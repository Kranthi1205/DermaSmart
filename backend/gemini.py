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

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    generation_config=generation_config,
)


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

    try:
        chat = model.start_chat(history=[])
        response = chat.send_message(prompt)
        raw = response.text.strip()

        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        return json.loads(raw)

    except json.JSONDecodeError as e:
        print(f"Gemini JSON parse error: {e}\nRaw response: {response.text}")
        return _default_report(skin_condition, skin_type)

    except Exception as e:
        print(f"Gemini error: {e}")
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
                "price": 19.99,
                "description": f"Gentle non-stripping formula for {skin_type} skin",
                "keyIngredients": ["Ceramides", "Glycerin"],
                "bestFor": "Daily cleansing",
                "useTime": "Morning and evening"
            }
        ]
    }
