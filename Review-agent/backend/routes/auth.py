from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db, Business
from auth import hash_password, verify_password, create_access_token, get_current_business
from google_api import get_authorization_url, exchange_code_for_tokens
import uuid

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    business: dict


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(Business).filter(Business.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    business = Business(
        id=str(uuid.uuid4()),
        name=req.name,
        email=req.email,
        hashed_password=hash_password(req.password),
    )
    db.add(business)
    db.commit()
    db.refresh(business)

    token = create_access_token({"sub": business.id})
    return {"access_token": token, "business": _business_dict(business)}


@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    business = db.query(Business).filter(Business.email == form.username).first()
    if not business or not verify_password(form.password, business.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": business.id})
    return {"access_token": token, "business": _business_dict(business)}


@router.get("/me")
def get_me(current: Business = Depends(get_current_business)):
    return _business_dict(current)


@router.get("/google/connect")
def google_connect(current: Business = Depends(get_current_business)):
    auth_url, state = get_authorization_url()
    return {"auth_url": auth_url, "state": state}


@router.get("/google/callback")
def google_callback(code: str, db: Session = Depends(get_db), current: Business = Depends(get_current_business)):
    try:
        tokens = exchange_code_for_tokens(code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Google OAuth failed: {str(e)}")

    current.google_access_token = tokens["access_token"]
    current.google_refresh_token = tokens["refresh_token"]
    current.google_account_id = tokens["account_id"]
    current.google_location_id = tokens["location_id"]
    db.commit()
    return {"message": "Google Business Profile connected successfully"}


def _business_dict(b: Business) -> dict:
    return {
        "id": b.id,
        "name": b.name,
        "email": b.email,
        "google_connected": b.google_access_token is not None,
        "google_location_id": b.google_location_id,
        "tone": b.tone,
        "brand_voice": b.brand_voice,
        "auto_reply": b.auto_reply,
        "auto_reply_threshold": b.auto_reply_threshold,
        "language": b.language,
        "alert_email": b.alert_email,
        "alert_on_negative": b.alert_on_negative,
        "negative_threshold": b.negative_threshold,
    }
