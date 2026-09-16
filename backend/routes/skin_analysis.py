from fastapi import APIRouter, HTTPException
from database import get_db
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()

class FeedbackModel(BaseModel):
    is_accurate: bool
    comments: str = ""


@router.get("/analyses/{analysis_id}")
async def get_analysis(analysis_id: str):
    db = get_db()
    doc = await db.skin_analyses.find_one({"_id": ObjectId(analysis_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.get("/analyses/user/{email}")
async def get_analyses_by_user(email: str):
    db = get_db()
    cursor = db.skin_analyses.find({"user_email": email}).sort("created_at", -1)
    results = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        results.append(doc)
    return results

@router.post("/analyses/{analysis_id}/feedback")
async def submit_feedback(analysis_id: str, feedback: FeedbackModel):
    db = get_db()
    result = await db.skin_analyses.update_one(
        {"_id": ObjectId(analysis_id)},
        {"$set": {"feedback": feedback.model_dump(), "updated_at": datetime.utcnow()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    return {"status": "success", "message": "Feedback recorded."}
