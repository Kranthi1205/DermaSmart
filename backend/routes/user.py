from fastapi import APIRouter, HTTPException
from database import get_db
from schemas import UserCreate, UserResponse
from datetime import datetime

router = APIRouter()


@router.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate):
    db = get_db()
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    doc = user.dict()
    doc["created_at"] = datetime.utcnow()

    result = await db.users.insert_one(doc)
    return UserResponse(id=str(result.inserted_id), **user.dict())


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    from bson import ObjectId
    db = get_db()
    doc = await db.users.find_one({"_id": ObjectId(user_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found.")
    return UserResponse(id=str(doc["_id"]), **{k: v for k, v in doc.items() if k != "_id"})


@router.get("/users/email/{email}", response_model=UserResponse)
async def get_user_by_email(email: str):
    db = get_db()
    doc = await db.users.find_one({"email": email})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found.")
    return UserResponse(id=str(doc["_id"]), **{k: v for k, v in doc.items() if k != "_id"})
