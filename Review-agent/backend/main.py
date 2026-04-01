from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from database import init_db
from routes.auth import router as auth_router
from routes.reviews import router as reviews_router
from routes.settings import router as settings_router

app = FastAPI(
    title="Review Reply Agent API",
    description="AI-powered Google review response automation",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(reviews_router)
app.include_router(settings_router)


@app.on_event("startup")
def on_startup():
    init_db()
    print("Review Agent API started. Mock mode:", os.getenv("GOOGLE_MOCK_MODE", "true"))


@app.get("/")
def root():
    return {"status": "ok", "service": "Review Reply Agent", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
