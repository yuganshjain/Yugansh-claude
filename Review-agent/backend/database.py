from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./review_agent.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Business(Base):
    __tablename__ = "businesses"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    google_account_id = Column(String, nullable=True)
    google_location_id = Column(String, nullable=True)
    google_access_token = Column(Text, nullable=True)
    google_refresh_token = Column(Text, nullable=True)
    hashed_password = Column(String, nullable=False)
    # AI reply settings
    tone = Column(String, default="professional")  # professional, friendly, formal, casual
    brand_voice = Column(Text, default="")  # custom instructions
    auto_reply = Column(Boolean, default=False)
    auto_reply_threshold = Column(Float, default=4.0)  # min stars to auto-reply
    language = Column(String, default="en")
    # Alert settings
    alert_email = Column(String, nullable=True)
    alert_on_negative = Column(Boolean, default=True)
    negative_threshold = Column(Float, default=2.0)
    # Meta
    created_at = Column(DateTime, default=datetime.utcnow)
    reviews = relationship("Review", back_populates="business", cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True)
    business_id = Column(String, ForeignKey("businesses.id"), nullable=False)
    google_review_id = Column(String, unique=True, nullable=True)
    reviewer_name = Column(String, default="Anonymous")
    reviewer_photo = Column(String, nullable=True)
    rating = Column(Float, nullable=False)
    text = Column(Text, default="")
    sentiment = Column(String, default="neutral")  # positive, neutral, negative
    status = Column(String, default="pending")  # pending, suggested, approved, posted, ignored
    created_at = Column(DateTime, default=datetime.utcnow)
    # Reply
    suggested_reply = Column(Text, nullable=True)
    final_reply = Column(Text, nullable=True)
    replied_at = Column(DateTime, nullable=True)
    # Meta
    is_mock = Column(Boolean, default=False)
    business = relationship("Business", back_populates="reviews")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
