# Lumio — AI Journal + Mental Wellness Coach
**Design Spec | 2026-04-11**

---

## Overview

Lumio is a web-based AI journaling app that helps users understand their emotional patterns through daily writing or voice entries. After each entry, an AI responds with therapist-style insight. Weekly and monthly reports surface mood trends, triggers, and growth patterns. The goal is to make mental wellness accessible, habitual, and genuinely insightful for $7/month.

**Target users:** Everyone — stressed professionals, students, therapy-seekers, general wellness users.
**Platform:** Web first, mobile-responsive. React Native expansion planned later.
**Revenue model:** Freemium — 7 free entries, then $7/month Pro.

---

## Architecture

```
┌─────────────────────────────────────────┐
│              Next.js 14 (Frontend)       │
│  Pages: Landing, Auth, Dashboard,        │
│         Journal Entry, Reports           │
└────────────────┬────────────────────────┘
                 │ REST API
┌────────────────▼────────────────────────┐
│           Node.js + Express (Backend)    │
│  Routes: /auth, /entries, /ai,           │
│          /reports, /billing              │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼───┐  ┌────▼────┐  ┌────▼──────┐
│Postgres│  │ Claude  │  │  Stripe   │
│+Prisma │  │   API   │  │  Billing  │
└───────┘  └─────────┘  └───────────┘
                 │
          ┌──────▼──────┐
          │  Whisper API │
          │ (voice→text) │
          └─────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 + Tailwind CSS | SSR, routing, responsive UI |
| Backend | Node.js + Express | API layer |
| Database | PostgreSQL + Prisma ORM | User data, entries, reports |
| Auth | NextAuth.js | Google OAuth + email/password |
| AI | Claude API (claude-sonnet-4-6) | Daily replies, weekly/monthly reports |
| Voice | OpenAI Whisper API | Speech-to-text transcription |
| Payments | Stripe | $7/month subscription |
| Hosting | Vercel (frontend) + Railway (backend + DB) | Scalable, easy deploy |
| Storage | Cloudinary or S3 | Voice file storage |

---

## Database Schema

### Users
```
id              UUID PK
email           STRING UNIQUE
name            STRING
passwordHash    STRING (null if OAuth)
provider        ENUM (email, google)
plan            ENUM (free, pro)
stripeCustomerId STRING
createdAt       TIMESTAMP
```

### JournalEntries
```
id              UUID PK
userId          UUID FK → Users
content         TEXT (written entry)
voiceUrl        STRING (transcribed voice URL)
transcription   TEXT (Whisper output)
moodScore       INT (1-10, user-set)
aiReply         TEXT (Claude response)
createdAt       TIMESTAMP
```

### WeeklyReports
```
id              UUID PK
userId          UUID FK → Users
weekStart       DATE
weekEnd         DATE
moodAverage     FLOAT
topTriggers     JSONB
emotionalPatterns JSONB
summary         TEXT (Claude-generated)
createdAt       TIMESTAMP
```

### MonthlyReports
```
id              UUID PK
userId          UUID FK → Users
month           DATE
emotionalProfile JSONB
growthInsights  TEXT
moodTrend       JSONB
summary         TEXT (Claude-generated)
createdAt       TIMESTAMP
```

---

## Features

### Authentication
- Email/password signup + login
- Google OAuth
- JWT sessions via NextAuth.js
- Password reset via email

### Journal Entry (Daily Core Loop)
- Rich text editor (write mode)
- Voice recorder with real-time waveform (voice mode)
  - Whisper API transcribes voice → stored as text + audio URL
- Mood score slider (1-10) before submitting
- On submit → Claude API generates therapist-style reply
- Reply displayed immediately after submission
- Entries saved with timestamp, mood, content, AI reply

### AI Daily Reply
- Prompt includes: entry content, mood score, last 3 entries context
- Claude responds with:
  - Empathetic acknowledgment
  - One key insight or pattern noticed
  - One gentle follow-up question
- Tone: warm, non-clinical, non-judgmental

### Weekly Report (Pro)
- Auto-generated every Sunday night
- Contains:
  - Mood trend chart (7-day graph)
  - Top 3 emotional triggers identified
  - Top 3 positive moments
  - Word cloud of most-used words
  - Claude-written narrative summary (200-300 words)
- Delivered as in-app notification + email

### Monthly Deep Dive (Pro)
- Auto-generated on 1st of each month
- Contains:
  - Full emotional profile (dominant emotions, coping patterns)
  - Month-over-month mood comparison
  - Growth areas identified
  - Claude-written deep narrative (500 words)
  - Personalized suggestions for next month

### Streak System
- Daily login + entry = streak maintained
- Visual streak counter on dashboard
- Milestone badges: 7 days, 30 days, 100 days
- Streak freeze (1/month for Pro users)

### Dashboard
- Today's mood + quick entry CTA
- Current streak
- Last 7 days mood graph
- Recent entries list
- Weekly/monthly report cards
- Upgrade prompt (free users)

### Payments (Stripe)
- Free plan: 7 total entries, no AI replies, no reports
- Pro plan: $7/month
  - Unlimited entries
  - AI daily replies
  - Weekly reports
  - Monthly deep dives
  - Streak freezes
  - Voice entries
- Stripe checkout + webhook for subscription management
- Cancel anytime

---

## AI Prompting Strategy

### Daily Reply Prompt
```
System: You are a warm, empathetic mental wellness companion.
You respond to journal entries with insight, not advice.
Keep responses to 3-4 sentences. Never diagnose. Always validate.

User context: Mood today: {moodScore}/10
Recent entries (last 3): {recentEntries}
Today's entry: {entryContent}

Respond with: acknowledgment, one insight, one gentle question.
```

### Weekly Report Prompt
```
System: You are a mental wellness analyst generating a weekly summary.
Be specific, pattern-focused, warm but data-driven.

Data: 7 entries with mood scores, content, dates.
Generate: mood narrative, top triggers, top positives, growth observation.
Length: 250 words.
```

### Monthly Deep Dive Prompt
```
System: You are generating a monthly emotional profile.
Be honest, growth-oriented, compassionate.

Data: All entries from the month, weekly reports.
Generate: emotional profile, patterns, month comparison, suggestions.
Length: 500 words.
```

---

## Error Handling

- AI API failure: show "Reflection coming soon" message, retry async in background
- Voice transcription failure: allow manual text fallback, notify user
- Stripe webhook failure: log + retry, never block user access immediately
- Database errors: graceful error pages, never expose stack traces

---

## Pages & Routes

```
/                   Landing page (marketing)
/login              Auth page
/register           Auth page
/dashboard          Main app home
/journal/new        New entry (write or voice)
/journal/[id]       View past entry + AI reply
/reports/weekly     Weekly report view
/reports/monthly    Monthly report view
/settings           Account, billing, notifications
/upgrade            Pricing / Stripe checkout
```

---

## Mobile Strategy

- Tailwind responsive classes from day one
- Touch-friendly voice recorder UI
- Bottom navigation for mobile
- PWA manifest added (installable on home screen)
- React Native app planned as Phase 2 (share API layer)

---

## Launch Plan

- **Phase 1 (MVP):** Auth + journal entry (write only) + AI daily reply + Stripe
- **Phase 2:** Voice entries + weekly reports
- **Phase 3:** Monthly deep dives + streak system + badges
- **Phase 4:** Mobile app (React Native)

---

## Success Metrics

- 100 free signups in first month
- 10% free → Pro conversion
- < 5% monthly churn
- 4+ entries/week per active user
