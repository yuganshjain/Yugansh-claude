# DeckVerse — Design Spec
**Date:** 2026-04-18
**Status:** Approved

## Overview

DeckVerse is a standalone web app featuring all 10 classic card games in one premium platform. It is distinguished by 3D CSS card animations, interactive animated tutorials for every game, and guest-friendly multiplayer rooms. No similar platform exists today that combines all these games under a single polished 3D experience.

**Location:** `fun-projects/deckverse/` (standalone Next.js project)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router |
| Styling | Tailwind CSS + custom CSS 3D |
| Animations | GSAP (flip, deal, shuffle, hover-tilt) |
| Multiplayer | Partykit (WebSocket rooms) |
| Auth | NextAuth.js (email + Google OAuth) |
| Database | Neon PostgreSQL + Prisma ORM |
| Deployment | Vercel |

---

## Games

All 10 games ship with: solo vs AI mode, live multiplayer mode, and an interactive animated tutorial.

| Game | Solo AI | Multiplayer | Players |
|---|---|---|---|
| Solitaire (Klondike) | ✓ | — | 1 |
| Blackjack (21) | ✓ | ✓ | 1–6 |
| Texas Hold'em Poker | ✓ | ✓ | 2–8 |
| War | ✓ | ✓ | 2 |
| Snap | ✓ | ✓ | 2–4 |
| Memory / Concentration | ✓ | ✓ | 1–4 |
| Go Fish | ✓ | ✓ | 2–6 |
| Crazy Eights | ✓ | ✓ | 2–8 |
| Rummy | ✓ | ✓ | 2–6 |
| Speed / Spit | ✓ | ✓ | 2 |

---

## Routes

```
/                        → Landing page (hero + game grid + multiplayer CTA)
/games                   → All games lobby with filters
/games/[slug]            → Game hub — pick Solo or Multiplayer
/games/[slug]/play       → Solo game vs AI
/room/[code]             → Live multiplayer room
/learn/[slug]            → Animated step-by-step tutorial
/leaderboard             → Global scores by game
/profile                 → User stats, history, achievements
/auth/signin             → Sign in (email or Google)
/auth/signup             → Register
```

---

## Data Model

```prisma
model User {
  id          String        @id @default(cuid())
  email       String        @unique
  name        String
  avatar      String?
  createdAt   DateTime      @default(now())
  sessions    GameSession[]
  leaderboard Leaderboard[]
}

model GameSession {
  id        String   @id @default(cuid())
  gameType  String
  userId    String?
  score     Int      @default(0)
  outcome   String   // "win" | "loss" | "draw" | "abandoned"
  duration  Int      // seconds
  createdAt DateTime @default(now())
  user      User?    @relation(fields: [userId], references: [id])
}

model Room {
  id         String       @id @default(cuid())
  code       String       @unique // 6-char, generated via nanoid(6) in server action before insert
  gameType   String
  hostId     String?
  status     String       @default("waiting") // "waiting" | "playing" | "finished"
  maxPlayers Int
  createdAt  DateTime     @default(now())
  players    RoomPlayer[]
}

model RoomPlayer {
  id          String  @id @default(cuid())
  roomId      String
  userId      String?
  displayName String
  isReady     Boolean @default(false)
  room        Room    @relation(fields: [roomId], references: [id])
}

model Leaderboard {
  id          String @id @default(cuid())
  userId      String
  gameType    String
  highScore   Int    @default(0)
  wins        Int    @default(0)
  gamesPlayed Int    @default(0)
  user        User   @relation(fields: [userId], references: [id])

  @@unique([userId, gameType])
}
```

---

## Game Module Structure

Every game follows the same file structure:

```
lib/games/[slug]/
  logic.ts        → Pure state machine — all game rules, no UI
  ai.ts           → AI opponent: rule-based decision making

components/games/[slug]/
  Board.tsx       → Game table layout specific to this game
  Hand.tsx        → Player's card hand display

components/games/shared/
  Card.tsx        → 3D CSS card component (face + back, flip animation)
  Deck.tsx        → Stacked deck with 3D depth effect
  Table.tsx       → Felt-texture game surface wrapper
  AnimatedCard.tsx → GSAP-powered deal/fly/shuffle animations
```

### Game Logic Contract

Each `logic.ts` exports:

```ts
type GameState = { ... }       // game-specific, serializable
type GameAction = { ... }      // player moves
type GameResult = { winner: string | null; scores: Record<string, number> }

function initGame(players: string[]): GameState
function applyAction(state: GameState, action: GameAction): GameState
function getValidActions(state: GameState, playerId: string): GameAction[]
function isGameOver(state: GameState): boolean
function getResult(state: GameState): GameResult
```

This contract means the same logic runs for both solo (AI calls `applyAction`) and multiplayer (Partykit server calls `applyAction` on each player action).

---

## 3D Card Animation System

Cards use CSS `transform-style: preserve-3d` with `perspective` set on the container. Each card has two faces (front and back) as absolutely-positioned children.

**GSAP animations:**

| Animation | Trigger | Description |
|---|---|---|
| `dealCard` | Game start | Card flies from deck position to hand slot |
| `flipCard` | Reveal | 180° Y-axis rotation exposing face |
| `shuffleDeck` | Shuffle | Rapid fan-out and fan-in sequence |
| `hoverTilt` | Mouse move | Subtle X/Y tilt tracking cursor (max 15°) |
| `playCard` | Card played | Slides from hand to table center |
| `winPulse` | Win condition | Gold glow + scale pulse on winning cards |

---

## Multiplayer Architecture (Partykit)

- Each room maps to one Partykit room server instance
- **Room code:** 6 uppercase alphanumeric chars (e.g. `DECK42`), stored in DB
- **Auth:** Host must be signed in to create. Guests join with code + display name — no account needed.
- **Server authority:** Partykit server holds canonical game state. Clients send actions; server validates via `logic.ts`, broadcasts new state.

**WebSocket message types:**

```ts
// Client → Server
{ type: "join", displayName: string, userId?: string }
{ type: "ready" }
{ type: "action", payload: GameAction }
{ type: "chat", message: string }

// Server → Client
{ type: "room-state", room: RoomState }
{ type: "game-state", state: GameState }
{ type: "chat", from: string, message: string }
{ type: "error", message: string }
```

---

## Tutorial System

Each game's `/learn/[slug]` page has:

1. **Animated intro** — cards deal out as the objective is explained
2. **Step cards** — numbered steps with GSAP-animated card demonstrations
3. **Interactive practice** — click-through scenario where user makes the correct move to proceed
4. **Quick rules card** — collapsible reference visible during gameplay

---

## Visual Design

- **Color palette:** Deep navy `#050510` background · Purple `#7c3aed` primary · Soft purple `#a855f7` accent · White text
- **Card design:** White face with classic suit colors (red/black) · Purple ornamental card back
- **Table:** SVG felt texture in dark green `#1a3a2a` · Subtle vignette edges
- **Typography:** Georgia serif for headings · System sans-serif for UI
- **App name:** DeckVerse

---

## What Doesn't Exist Today

No current platform combines:
- All 10 of these games in one place
- 3D CSS card animations (deal, flip, shuffle, tilt)
- Interactive animated tutorials for every game
- Guest multiplayer (join without an account)
- Speed and Snap as polished real-time reflex web games

---

## Out of Scope

- In-app purchases or betting with real money
- Mobile native app (web-responsive only)
- Video chat in rooms
- Tournaments or brackets (v2)
- Custom card deck themes (v2)
