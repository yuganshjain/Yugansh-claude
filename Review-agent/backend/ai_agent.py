import anthropic
import os
from typing import Optional

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SENTIMENT_MAP = {
    5: "positive",
    4: "positive",
    3: "neutral",
    2: "negative",
    1: "negative",
}

TONE_INSTRUCTIONS = {
    "professional": "Use professional, courteous language. Be concise and solution-focused.",
    "friendly": "Use warm, friendly language. Feel personal and approachable, like talking to a friend.",
    "formal": "Use formal, polished language. Maintain a corporate, dignified tone.",
    "casual": "Use casual, relaxed language. Keep it light and conversational.",
}


def get_sentiment(rating: float) -> str:
    return SENTIMENT_MAP.get(round(rating), "neutral")


def generate_reply(
    reviewer_name: str,
    rating: float,
    review_text: str,
    business_name: str,
    tone: str = "professional",
    brand_voice: str = "",
    language: str = "en",
) -> str:
    sentiment = get_sentiment(rating)
    tone_instruction = TONE_INSTRUCTIONS.get(tone, TONE_INSTRUCTIONS["professional"])

    brand_voice_section = f"\n\nBrand voice / custom instructions: {brand_voice}" if brand_voice.strip() else ""

    language_instruction = ""
    if language != "en":
        language_instruction = f"\n\nIMPORTANT: Write the reply in {language} language."

    system_prompt = f"""You are a review response specialist for '{business_name}'.
Your job is to write genuine, helpful replies to customer reviews that build trust and reputation.

Tone: {tone_instruction}{brand_voice_section}

Guidelines:
- Always address the reviewer by name if provided
- For positive reviews (4-5 stars): thank them sincerely, mention something specific from their review, invite them back
- For neutral reviews (3 stars): acknowledge their feedback, show you take it seriously, offer to improve their experience
- For negative reviews (1-2 stars): apologize genuinely (without being sycophantic), acknowledge the specific issue, offer a path to resolution, provide contact info if appropriate
- Keep replies between 2-4 sentences — concise and human
- Never be defensive or dismissive
- Do NOT use generic filler phrases like "We value your feedback" as the opener
- Sound like a real person, not a bot{language_instruction}"""

    user_prompt = f"""Write a reply to this Google review:

Reviewer: {reviewer_name}
Rating: {rating}/5 stars ({sentiment})
Review: {review_text if review_text.strip() else "(No written review — just a star rating)"}

Reply:"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=300,
        messages=[{"role": "user", "content": user_prompt}],
        system=system_prompt,
    )

    return message.content[0].text.strip()


def bulk_generate_replies(reviews: list, business_name: str, tone: str, brand_voice: str, language: str) -> dict:
    """Generate replies for multiple reviews. Returns dict of review_id -> reply."""
    results = {}
    for review in reviews:
        try:
            reply = generate_reply(
                reviewer_name=review.get("reviewer_name", "Customer"),
                rating=review.get("rating", 3),
                review_text=review.get("text", ""),
                business_name=business_name,
                tone=tone,
                brand_voice=brand_voice,
                language=language,
            )
            results[review["id"]] = {"reply": reply, "error": None}
        except Exception as e:
            results[review["id"]] = {"reply": None, "error": str(e)}
    return results
