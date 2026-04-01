from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database import get_db, Business, Review
from auth import get_current_business
from ai_agent import generate_reply, get_sentiment, bulk_generate_replies
from google_api import fetch_reviews, post_reply, MOCK_MODE
import uuid

router = APIRouter(prefix="/api/reviews", tags=["reviews"])


class ReplyRequest(BaseModel):
    reply_text: str


class BulkGenerateRequest(BaseModel):
    review_ids: Optional[list[str]] = None  # None = all pending


@router.get("/sync")
def sync_reviews(
    background_tasks: BackgroundTasks,
    current: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    """Fetch latest reviews from Google (or mock) and store new ones."""
    raw_reviews = fetch_reviews(
        current.google_access_token or "",
        current.google_refresh_token or "",
        current.google_location_id or "",
    )

    new_count = 0
    for r in raw_reviews:
        existing = db.query(Review).filter(Review.google_review_id == r["google_review_id"]).first()
        if existing:
            continue

        sentiment = get_sentiment(r["rating"])
        review = Review(
            id=r.get("id") or str(uuid.uuid4()),
            business_id=current.id,
            google_review_id=r["google_review_id"],
            reviewer_name=r["reviewer_name"],
            reviewer_photo=r.get("reviewer_photo"),
            rating=r["rating"],
            text=r["text"],
            sentiment=sentiment,
            status="pending",
            is_mock=r.get("is_mock", MOCK_MODE),
            created_at=datetime.fromisoformat(r["created_at"]) if isinstance(r["created_at"], str) else r["created_at"],
        )
        db.add(review)
        new_count += 1

        # Auto-reply if enabled and rating meets threshold
        if current.auto_reply and r["rating"] >= current.auto_reply_threshold:
            background_tasks.add_task(
                _auto_reply_task,
                review_id=review.id,
                business_id=current.id,
            )

    db.commit()
    return {"synced": new_count, "total": len(raw_reviews)}


@router.get("/")
def list_reviews(
    status: Optional[str] = None,
    sentiment: Optional[str] = None,
    current: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    query = db.query(Review).filter(Review.business_id == current.id)
    if status:
        query = query.filter(Review.status == status)
    if sentiment:
        query = query.filter(Review.sentiment == sentiment)
    reviews = query.order_by(Review.created_at.desc()).all()
    return [_review_dict(r) for r in reviews]


@router.get("/stats")
def get_stats(
    current: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    all_reviews = db.query(Review).filter(Review.business_id == current.id).all()
    if not all_reviews:
        return {
            "total": 0, "avg_rating": 0, "positive": 0, "neutral": 0, "negative": 0,
            "pending": 0, "replied": 0, "response_rate": 0,
        }

    ratings = [r.rating for r in all_reviews]
    replied = [r for r in all_reviews if r.status == "posted"]
    return {
        "total": len(all_reviews),
        "avg_rating": round(sum(ratings) / len(ratings), 2),
        "positive": sum(1 for r in all_reviews if r.sentiment == "positive"),
        "neutral": sum(1 for r in all_reviews if r.sentiment == "neutral"),
        "negative": sum(1 for r in all_reviews if r.sentiment == "negative"),
        "pending": sum(1 for r in all_reviews if r.status == "pending"),
        "replied": len(replied),
        "response_rate": round(len(replied) / len(all_reviews) * 100, 1),
    }


@router.post("/{review_id}/generate")
def generate_reply_for_review(
    review_id: str,
    current: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    review = _get_review(review_id, current.id, db)
    reply = generate_reply(
        reviewer_name=review.reviewer_name,
        rating=review.rating,
        review_text=review.text,
        business_name=current.name,
        tone=current.tone,
        brand_voice=current.brand_voice,
        language=current.language,
    )
    review.suggested_reply = reply
    review.status = "suggested"
    db.commit()
    return {"suggested_reply": reply}


@router.post("/bulk-generate")
def bulk_generate(
    req: BulkGenerateRequest,
    current: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    query = db.query(Review).filter(Review.business_id == current.id, Review.status == "pending")
    if req.review_ids:
        query = query.filter(Review.id.in_(req.review_ids))
    reviews = query.all()

    review_data = [{"id": r.id, "reviewer_name": r.reviewer_name, "rating": r.rating, "text": r.text} for r in reviews]
    results = bulk_generate_replies(review_data, current.name, current.tone, current.brand_voice, current.language)

    updated = 0
    for review in reviews:
        result = results.get(review.id)
        if result and result["reply"]:
            review.suggested_reply = result["reply"]
            review.status = "suggested"
            updated += 1
    db.commit()
    return {"generated": updated, "results": results}


@router.post("/{review_id}/approve")
def approve_reply(
    review_id: str,
    req: ReplyRequest,
    current: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    review = _get_review(review_id, current.id, db)
    review.final_reply = req.reply_text
    review.status = "approved"
    db.commit()
    return {"status": "approved"}


@router.post("/{review_id}/post")
def post_review_reply(
    review_id: str,
    current: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    review = _get_review(review_id, current.id, db)
    if not review.final_reply:
        raise HTTPException(status_code=400, detail="No reply to post. Approve a reply first.")

    success = post_reply(
        access_token=current.google_access_token or "",
        refresh_token=current.google_refresh_token or "",
        location_id=current.google_location_id or "",
        google_review_id=review.google_review_id,
        reply_text=review.final_reply,
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to post reply to Google")

    review.status = "posted"
    review.replied_at = datetime.utcnow()
    db.commit()
    return {"status": "posted"}


@router.post("/{review_id}/ignore")
def ignore_review(
    review_id: str,
    current: Business = Depends(get_current_business),
    db: Session = Depends(get_db),
):
    review = _get_review(review_id, current.id, db)
    review.status = "ignored"
    db.commit()
    return {"status": "ignored"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_review(review_id: str, business_id: str, db: Session) -> Review:
    review = db.query(Review).filter(Review.id == review_id, Review.business_id == business_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review


def _review_dict(r: Review) -> dict:
    return {
        "id": r.id,
        "google_review_id": r.google_review_id,
        "reviewer_name": r.reviewer_name,
        "reviewer_photo": r.reviewer_photo,
        "rating": r.rating,
        "text": r.text,
        "sentiment": r.sentiment,
        "status": r.status,
        "suggested_reply": r.suggested_reply,
        "final_reply": r.final_reply,
        "replied_at": r.replied_at.isoformat() if r.replied_at else None,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "is_mock": r.is_mock,
    }


def _auto_reply_task(review_id: str, business_id: str):
    from database import SessionLocal
    db = SessionLocal()
    try:
        business = db.query(Business).filter(Business.id == business_id).first()
        review = db.query(Review).filter(Review.id == review_id).first()
        if not business or not review:
            return
        reply = generate_reply(
            reviewer_name=review.reviewer_name,
            rating=review.rating,
            review_text=review.text,
            business_name=business.name,
            tone=business.tone,
            brand_voice=business.brand_voice,
            language=business.language,
        )
        review.suggested_reply = reply
        review.final_reply = reply
        success = post_reply(
            access_token=business.google_access_token or "",
            refresh_token=business.google_refresh_token or "",
            location_id=business.google_location_id or "",
            google_review_id=review.google_review_id,
            reply_text=reply,
        )
        review.status = "posted" if success else "suggested"
        if success:
            review.replied_at = datetime.utcnow()
        db.commit()
    finally:
        db.close()
