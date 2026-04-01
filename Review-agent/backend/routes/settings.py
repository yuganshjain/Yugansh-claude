from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from database import get_db, Business
from auth import get_current_business

router = APIRouter(prefix="/api/settings", tags=["settings"])


class SettingsUpdate(BaseModel):
    tone: Optional[str] = None
    brand_voice: Optional[str] = None
    auto_reply: Optional[bool] = None
    auto_reply_threshold: Optional[float] = None
    language: Optional[str] = None
    alert_email: Optional[str] = None
    alert_on_negative: Optional[bool] = None
    negative_threshold: Optional[float] = None
    name: Optional[str] = None


@router.get("/")
def get_settings(current: Business = Depends(get_current_business)):
    return {
        "name": current.name,
        "email": current.email,
        "tone": current.tone,
        "brand_voice": current.brand_voice,
        "auto_reply": current.auto_reply,
        "auto_reply_threshold": current.auto_reply_threshold,
        "language": current.language,
        "alert_email": current.alert_email,
        "alert_on_negative": current.alert_on_negative,
        "negative_threshold": current.negative_threshold,
        "google_connected": current.google_access_token is not None,
    }


@router.patch("/")
def update_settings(
    updates: SettingsUpdate,
    current: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    for field, value in updates.model_dump(exclude_none=True).items():
        setattr(current, field, value)
    db.commit()
    return {"message": "Settings updated"}
