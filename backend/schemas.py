from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ── User ──────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: str
    skin_type: str
    age: int


class UserResponse(UserCreate):
    id: str


# ── Skincare Report (from Gemini) ──────────────────────
class SkincareRoutine(BaseModel):
    morning: List[str] = []
    evening: List[str] = []


class SkincareOverview(BaseModel):
    condition: str = ""


class SkincareDiet(BaseModel):
    recommendations: List[str] = []


class SkincareProduct(BaseModel):
    name: str
    price: float
    description: str
    keyIngredients: List[str] = []
    bestFor: str
    useTime: str


class DermaReport(BaseModel):
    overview: SkincareOverview = SkincareOverview()
    routine: SkincareRoutine = SkincareRoutine()
    diet: SkincareDiet = SkincareDiet()
    products: List[SkincareProduct] = []


# ── Skin Analysis ──────────────────────────────────────
class SkinAnalysisResponse(BaseModel):
    id: str
    user_email: str
    skin_condition: str          # from TF model
    derma_report: DermaReport    # from Gemini
    image_filename: str
    created_at: datetime
