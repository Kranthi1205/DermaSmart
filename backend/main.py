from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import os
from datetime import datetime
from dotenv import load_dotenv

from database import connect_db, close_db, get_db
from aiModel import skin_analysis, validate_face
from gemini import get_personalized_skin_advice
from routes import user, skin_analysis as skin_analysis_routes

load_dotenv()

app = FastAPI(title="DermaSmart API")

# ── CORS ───────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Startup / Shutdown ─────────────────────────────────
@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

# ── Routers ────────────────────────────────────────────
app.include_router(user.router, prefix="/api")
app.include_router(skin_analysis_routes.router, prefix="/api")



# ── Face Validation Endpoint ───────────────────────────
@app.post("/validate-face")
async def validate_face_endpoint(image: UploadFile = File(...)):
    """Quick face/skin check on camera page — no TFLite inference."""
    image_content = await image.read()
    result = validate_face(image_content)
    return result


# ── Main Endpoint ──────────────────────────────────────
@app.post("/userInfo")
async def analyze_skin(
    image: UploadFile = File(...),
    name: str = Form(...),
    skin_type: str = Form(...),
    email: str = Form(...),
    age: int = Form(...),
):
    try:
        # 1. Read the uploaded image into memory
        image_content = await image.read()

        # 2. Run TensorFlow skin condition classifier directly on bytes
        tf_result = skin_analysis(image_content)
        if "error" in tf_result:
            skin_condition = "Unknown"
        else:
            skin_condition = tf_result["condition"]

        # 3. Handle Medical Emergency Overrides
        EMERGENCY_CLASSES = [
            "Melanoma Skin Cancer Nevi and Moles",
            "Actinic Keratosis Basal Cell Carcinoma and other Malignant Lesions"
        ]
        
        is_emergency = skin_condition in EMERGENCY_CLASSES
        
        if is_emergency:
            derma_report = {
                "overview": {"condition": f"EMERGENCY ALERT: High probability of malignant lesion detected ({skin_condition})."},
                "routine": {"morning": ["URGENT: Consult a Dermatologist immediately."], "evening": ["URGENT: Consult a Dermatologist immediately."]},
                "diet": {"recommendations": ["Seek professional medical evaluation immediately. Do not rely on cosmetic skincare advice."]},
                "products": []
            }
        else:
            # 4. Get personalised skincare advice from Gemini
            derma_report = get_personalized_skin_advice(
                skin_condition=skin_condition,
                skin_type=skin_type,
                age=age,
            )

        # 4. Save to MongoDB
        db = get_db()

        # Upsert user
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": name, "skin_type": skin_type, "age": age, "email": email}},
            upsert=True,
        )

        # Insert analysis record
        analysis_doc = {
            "user_email": email,
            "skin_condition": skin_condition,
            "derma_report": derma_report,
            "image_filename": "in-memory-processed",
            "created_at": datetime.utcnow(),
        }
        result = await db.skin_analyses.insert_one(analysis_doc)

        # 6. Return response to frontend
        return {
            "status": "success",
            "analysis_id": str(result.inserted_id),
            "user_data": {
                "name": name,
                "email": email,
                "skin_type": skin_type,
                "age": age,
            },
            "skin_condition": skin_condition,
            "is_emergency": is_emergency,
            "dermaReport": {
                "report": derma_report
            },
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/")
def root():
    return {"message": "DermaSmart API is running 🚀"}
