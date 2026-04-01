"""
Google Business Profile API integration.
Supports both REAL mode (OAuth2 + API) and MOCK mode (demo data).
Set GOOGLE_MOCK_MODE=true in .env to use mock data without API approval.
"""

import os
import uuid
from datetime import datetime, timedelta
import random
from typing import Optional
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

MOCK_MODE = os.getenv("GOOGLE_MOCK_MODE", "true").lower() == "true"

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")

SCOPES = [
    "https://www.googleapis.com/auth/business.manage",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
]

# ---------------------------------------------------------------------------
# Mock data
# ---------------------------------------------------------------------------

MOCK_REVIEWS = [
    {
        "id": "mock_1",
        "google_review_id": "mock_google_1",
        "reviewer_name": "Sarah Mitchell",
        "reviewer_photo": None,
        "rating": 5.0,
        "text": "Absolutely love this place! The staff was incredibly friendly and the service was top-notch. Will definitely be coming back!",
        "created_at": (datetime.utcnow() - timedelta(days=1)).isoformat(),
        "status": "pending",
        "is_mock": True,
    },
    {
        "id": "mock_2",
        "google_review_id": "mock_google_2",
        "reviewer_name": "James O'Brien",
        "reviewer_photo": None,
        "rating": 2.0,
        "text": "Waited over 45 minutes and nobody acknowledged me. When I finally got help, the person seemed disinterested. Very disappointed.",
        "created_at": (datetime.utcnow() - timedelta(days=2)).isoformat(),
        "status": "pending",
        "is_mock": True,
    },
    {
        "id": "mock_3",
        "google_review_id": "mock_google_3",
        "reviewer_name": "Priya Sharma",
        "reviewer_photo": None,
        "rating": 4.0,
        "text": "Really good experience overall. The quality was great, though parking was a bit of a hassle. Would recommend!",
        "created_at": (datetime.utcnow() - timedelta(days=3)).isoformat(),
        "status": "pending",
        "is_mock": True,
    },
    {
        "id": "mock_4",
        "google_review_id": "mock_google_4",
        "reviewer_name": "Tom Baker",
        "reviewer_photo": None,
        "rating": 1.0,
        "text": "Terrible experience. The product was broken on arrival and customer support was completely unhelpful. Never again.",
        "created_at": (datetime.utcnow() - timedelta(days=5)).isoformat(),
        "status": "pending",
        "is_mock": True,
    },
    {
        "id": "mock_5",
        "google_review_id": "mock_google_5",
        "reviewer_name": "Linda Chen",
        "reviewer_photo": None,
        "rating": 5.0,
        "text": "Outstanding! Every detail was perfect. The team went above and beyond to make sure everything was right.",
        "created_at": (datetime.utcnow() - timedelta(days=7)).isoformat(),
        "status": "pending",
        "is_mock": True,
    },
    {
        "id": "mock_6",
        "google_review_id": "mock_google_6",
        "reviewer_name": "Marcus Williams",
        "reviewer_photo": None,
        "rating": 3.0,
        "text": "It was okay. Nothing special but nothing terrible either. Might come back, might not.",
        "created_at": (datetime.utcnow() - timedelta(days=9)).isoformat(),
        "status": "pending",
        "is_mock": True,
    },
    {
        "id": "mock_7",
        "google_review_id": "mock_google_7",
        "reviewer_name": "Emily Rodriguez",
        "reviewer_photo": None,
        "rating": 5.0,
        "text": "",  # Rating only, no text
        "created_at": (datetime.utcnow() - timedelta(days=10)).isoformat(),
        "status": "pending",
        "is_mock": True,
    },
]

# ---------------------------------------------------------------------------
# OAuth helpers
# ---------------------------------------------------------------------------

def get_oauth_flow() -> Flow:
    client_config = {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uris": [REDIRECT_URI],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }
    flow = Flow.from_client_config(client_config, scopes=SCOPES)
    flow.redirect_uri = REDIRECT_URI
    return flow


def get_authorization_url() -> tuple[str, str]:
    if MOCK_MODE:
        return "http://localhost:5173/oauth-mock-callback?code=mock_code&state=mock_state", "mock_state"
    flow = get_oauth_flow()
    auth_url, state = flow.authorization_url(access_type="offline", prompt="consent")
    return auth_url, state


def exchange_code_for_tokens(code: str) -> dict:
    if MOCK_MODE:
        return {
            "access_token": "mock_access_token",
            "refresh_token": "mock_refresh_token",
            "account_id": "mock_account_123",
            "location_id": "mock_location_456",
        }
    flow = get_oauth_flow()
    flow.fetch_token(code=code)
    creds = flow.credentials
    account_id, location_id = _get_first_location(creds)
    return {
        "access_token": creds.token,
        "refresh_token": creds.refresh_token,
        "account_id": account_id,
        "location_id": location_id,
    }


def _get_first_location(creds: Credentials) -> tuple[str, str]:
    service = build("mybusinessaccountmanagement", "v1", credentials=creds)
    accounts = service.accounts().list().execute()
    account_name = accounts["accounts"][0]["name"]

    loc_service = build("mybusinessbusinessinformation", "v1", credentials=creds)
    locations = loc_service.locations().list(parent=account_name).execute()
    location_name = locations["locations"][0]["name"]
    return account_name, location_name

# ---------------------------------------------------------------------------
# Review fetching
# ---------------------------------------------------------------------------

def fetch_reviews(access_token: str, refresh_token: str, location_id: str) -> list[dict]:
    if MOCK_MODE:
        return MOCK_REVIEWS

    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        token_uri="https://oauth2.googleapis.com/token",
    )
    service = build("mybusiness", "v4", credentials=creds)
    response = service.accounts().locations().reviews().list(parent=location_id).execute()
    reviews = []
    for r in response.get("reviews", []):
        reviews.append({
            "id": str(uuid.uuid4()),
            "google_review_id": r.get("reviewId"),
            "reviewer_name": r.get("reviewer", {}).get("displayName", "Anonymous"),
            "reviewer_photo": r.get("reviewer", {}).get("profilePhotoUrl"),
            "rating": _star_to_float(r.get("starRating", "THREE")),
            "text": r.get("comment", ""),
            "created_at": r.get("createTime"),
            "status": "pending",
            "is_mock": False,
        })
    return reviews


def _star_to_float(star: str) -> float:
    mapping = {"ONE": 1.0, "TWO": 2.0, "THREE": 3.0, "FOUR": 4.0, "FIVE": 5.0}
    return mapping.get(star, 3.0)

# ---------------------------------------------------------------------------
# Reply posting
# ---------------------------------------------------------------------------

def post_reply(access_token: str, refresh_token: str, location_id: str, google_review_id: str, reply_text: str) -> bool:
    if MOCK_MODE:
        return True  # Simulate success

    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        token_uri="https://oauth2.googleapis.com/token",
    )
    service = build("mybusiness", "v4", credentials=creds)
    review_name = f"{location_id}/reviews/{google_review_id}"
    try:
        service.accounts().locations().reviews().updateReply(
            name=review_name,
            body={"comment": reply_text}
        ).execute()
        return True
    except HttpError:
        return False
