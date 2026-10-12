import os
import google.generativeai as genai
import json
from dotenv import load_dotenv

load_dotenv()

# Configure API from environment
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

# Models are tried in order until one answers. Google retires older Gemini
# models, and a single hard-coded name turned that into a silent permanent
# fallback to the generic report. GEMINI_MODEL, if set, is tried first; the
# non-"thinking" model comes next because it answers fastest.
MODEL_CANDIDATES = [
    m for m in dict.fromkeys(
        [os.getenv("GEMINI_MODEL"), "gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash"]
    ) if m
]

# Per-call cap so a slow Gemini response cannot hold the request open.
REQUEST_TIMEOUT_S = 20

_models = {}


def _get_model(name: str):
    if name not in _models:
        _models[name] = genai.GenerativeModel(model_name=name, generation_config=generation_config)
    return _models[name]


def gemini_status() -> dict:
    """Configuration facts for /health/config. Never includes secret values."""
    return {"gemini_key_set": bool(os.getenv("GEMINI_API_KEY")), "gemini_models": MODEL_CANDIDATES}


def get_personalized_skin_advice(
    skin_condition: str,
    skin_type: str,
    age: int,
    product_list: list = []
) -> dict:
    """
    Call Gemini to generate a structured skincare report.
    Returns a dict matching the DermaReport schema.
    """

    product_context = (
        f"\n\nAvailable products for recommendations:\n{', '.join(product_list)}"
        if product_list else ""
    )

    prompt = f"""
You are a professional dermatologist. Respond ONLY with a valid JSON object — no extra text, no markdown.

The JSON must follow this exact structure:
{{
    "overview": {{
        "condition": "short description of the skin condition"
    }},
    "routine": {{
        "morning": ["step 1", "step 2", "step 3", "step 4"],
        "evening": ["step 1", "step 2", "step 3", "step 4"]
    }},
    "diet": {{
        "recommendations": ["tip 1", "tip 2", "tip 3", "tip 4"]
    }},
    "products": [
        {{
            "name": "Product Name",
            "price": 24.99,
            "description": "Why this product suits the condition",
            "keyIngredients": ["Ingredient 1", "Ingredient 2"],
            "bestFor": "What it targets",
            "useTime": "Morning and/or evening"
        }}
    ]
}}

Patient details:
- Diagnosed skin condition: {skin_condition}
- Skin type: {skin_type}
- Age: {age}
{product_context}

Provide 3–4 morning steps, 3–4 evening steps, 4 diet tips, and 3–5 product recommendations.
Respond with ONLY the JSON object.
"""

    # Without a key the client searches for Google credentials and stalls for
    # ~12s per call before failing. Skip Gemini outright instead of making the
    # user wait for an answer that cannot come.
    if not os.getenv("GEMINI_API_KEY"):
        print("[WARN] GEMINI_API_KEY is not set — returning the default report.")
        return _default_report(skin_condition, skin_type)

    raw = ""
    for name in MODEL_CANDIDATES:
        try:
            response = _get_model(name).generate_content(
                prompt, request_options={"timeout": REQUEST_TIMEOUT_S}
            )
            raw = response.text.strip()

            # Strip markdown code fences if present
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
                raw = raw.strip()

            return json.loads(raw)

        except json.JSONDecodeError as e:
            print(f"[WARN] Gemini ({name}) returned invalid JSON: {e} | raw: {raw[:500]}")
        except Exception as e:
            print(f"[WARN] Gemini ({name}) failed: {type(e).__name__}: {e}")
            # Only a missing/retired model is worth trying another model for.
            # Bad key, quota, or a timeout would just repeat on the next one.
            if type(e).__name__ != "NotFound" and "not found" not in str(e).lower():
                break

    print("[WARN] Gemini did not produce a report — returning the default report.")
    return _default_report(skin_condition, skin_type)


def _default_report(skin_condition: str, skin_type: str) -> dict:
    return {
        "overview": {"condition": f"{skin_type} skin — {skin_condition}"},
        "routine": {
            "morning": ["Gentle cleanser", "Moisturizer", "SPF 50 sunscreen"],
            "evening": ["Micellar water", "Gentle cleanser", "Night cream"]
        },
        "diet": {
            "recommendations": [
                "Drink at least 2L of water daily",
                "Eat omega-3 rich foods (salmon, walnuts)",
                "Include antioxidant-rich fruits",
                "Reduce processed sugar and dairy"
            ]
        },
        "products": [
            {
                "name": "Gentle Daily Cleanser",
                "price": 349,
                "description": f"Gentle non-stripping formula for {skin_type} skin",
                "keyIngredients": ["Ceramides", "Glycerin"],
                "bestFor": "Daily cleansing",
                "useTime": "Morning and evening"
            }
        ]
    }
