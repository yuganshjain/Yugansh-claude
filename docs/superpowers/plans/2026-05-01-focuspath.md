# FocusPath Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build FocusPath — a Next.js web app that trains ADHD users to build longer attention spans by reading spiritual texts daily, measuring focus time, and gating session completion behind comprehension questions.

**Architecture:** Standalone Next.js 16 app in `focuspath/` at the repo root. Passages are static JSON files. A Neon PostgreSQL DB (via Prisma) stores users, reading sessions, and cached quiz questions. Claude Haiku generates 3-question quizzes per passage on first access and caches them. Auth via next-auth v5 (Google OAuth) is optional — unauthenticated users get `localStorage`-backed sessions.

**Tech Stack:** Next.js 16 · React 19 · Tailwind CSS v4 · Prisma 7 + Neon PostgreSQL · next-auth v5 · Recharts · Claude API (`claude-haiku-4-5-20251001`) · Vitest · Vercel

---

## File Structure

```
focuspath/
├── app/
│   ├── layout.tsx                   # Root layout: fonts, CSS vars, SessionProvider, NavBar
│   ├── globals.css                  # Tailwind v4 import + Sacred Cream/Saffron CSS tokens
│   ├── page.tsx                     # Dashboard
│   ├── session/
│   │   └── [id]/
│   │       ├── page.tsx             # Reading screen
│   │       └── quiz/
│   │           └── page.tsx         # Comprehension gate
│   ├── progress/
│   │   └── page.tsx                 # Progress charts
│   ├── settings/
│   │   └── page.tsx                 # Tradition toggles + target time
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── sessions/route.ts        # POST complete session, GET all sessions
│       └── quiz/[passageId]/route.ts # GET quiz (generate or cache hit)
├── components/
│   ├── NavBar.tsx                   # Bottom nav: Home · Today · Progress · Settings
│   ├── PassageCard.tsx              # Today's passage CTA card
│   ├── FocusTimer.tsx               # Counts-up timer, exposes elapsed seconds
│   ├── ReadingProgress.tsx          # Scroll-based progress bar
│   ├── QuizQuestion.tsx             # Single question with choices + reveal
│   ├── WeeklyChart.tsx              # Recharts bar chart for weekly focus time
│   └── TraditionBar.tsx             # Per-tradition mini progress bar row
├── data/
│   └── passages/
│       ├── index.ts                 # Exports flat PASSAGES array
│       ├── stoics.json
│       ├── gita.json
│       ├── tao.json
│       ├── upanishads.json
│       ├── bible.json
│       ├── quran.json
│       └── buddhist.json
├── lib/
│   ├── prisma.ts                    # Prisma singleton (PrismaNeon adapter)
│   ├── auth.ts                      # next-auth v5 config
│   ├── passages.ts                  # getTodayPassage(), getPassageById()
│   ├── sessions.ts                  # localStorage helpers for unauthed users
│   └── claude.ts                    # generateQuiz() via Claude API
├── types/
│   └── index.ts                     # Passage, QuizQuestion, FocusSession types
├── prisma/
│   └── schema.prisma
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
└── vitest.config.ts
```

---

## Task 1: Scaffold the app

**Files:**
- Create: `focuspath/` (entire directory)

- [ ] **Step 1: Scaffold Next.js app**

```bash
cd /path/to/repo
npx create-next-app@16.2.3 focuspath \
  --typescript --tailwind --app --no-src-dir \
  --import-alias "@/*" --no-turbopack
cd focuspath
```

- [ ] **Step 2: Install dependencies**

```bash
npm install @neondatabase/serverless @prisma/client @prisma/adapter-neon \
  @auth/prisma-adapter next-auth@beta recharts lucide-react \
  @anthropic-ai/sdk dotenv
npm install -D prisma vitest @vitejs/plugin-react vite-tsconfig-paths
```

- [ ] **Step 3: Set up Vitest**

Create `focuspath/vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
  },
})
```

Add to `focuspath/package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Create `.env.local`**

```bash
cat > .env.local << 'EOF'
DATABASE_URL=your_neon_connection_string_here
AUTH_SECRET=run_npx_auth_secret_to_generate
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
ANTHROPIC_API_KEY=your_anthropic_key
EOF
```

- [ ] **Step 5: Commit scaffold**

```bash
git add focuspath/
git commit -m "feat: scaffold FocusPath Next.js app"
```

---

## Task 2: Types

**Files:**
- Create: `focuspath/types/index.ts`

- [ ] **Step 1: Write failing test**

Create `focuspath/types/index.test.ts`:
```ts
import { describe, it, expectTypeOf } from 'vitest'
import type { Passage, QuizQuestion, FocusSession } from './index'

describe('types', () => {
  it('Passage has required fields', () => {
    expectTypeOf<Passage>().toHaveProperty('id')
    expectTypeOf<Passage>().toHaveProperty('tradition')
    expectTypeOf<Passage>().toHaveProperty('body')
    expectTypeOf<Passage>().toHaveProperty('estimatedMinutes')
  })

  it('QuizQuestion has choices array', () => {
    expectTypeOf<QuizQuestion>().toHaveProperty('choices')
    expectTypeOf<QuizQuestion['choices']>().toEqualTypeOf<string[]>()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- types/index.test.ts
```
Expected: FAIL — `Cannot find module './index'`

- [ ] **Step 3: Create types**

Create `focuspath/types/index.ts`:
```ts
export type Tradition =
  | 'stoics'
  | 'gita'
  | 'tao'
  | 'upanishads'
  | 'bible'
  | 'quran'
  | 'buddhist'

export interface Passage {
  id: string
  tradition: Tradition
  source: string        // e.g. "Marcus Aurelius"
  work: string          // e.g. "Meditations"
  quote: string         // short pull quote shown on card
  body: string          // full passage text shown in reading view
  estimatedMinutes: number
}

export interface QuizQuestion {
  question: string
  choices: string[]     // 4 options
  correctIndex: number  // 0-3
  explanation: string
}

export interface FocusSession {
  id: string
  passageId: string
  focusSeconds: number
  quizScore: number     // 0-3
  completed: boolean
  date: string          // ISO date string
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- types/index.test.ts
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add focuspath/types/
git commit -m "feat: add FocusPath types"
```

---

## Task 3: Passage data

**Files:**
- Create: `focuspath/data/passages/stoics.json`
- Create: `focuspath/data/passages/gita.json`
- Create: `focuspath/data/passages/tao.json`
- Create: `focuspath/data/passages/upanishads.json`
- Create: `focuspath/data/passages/bible.json`
- Create: `focuspath/data/passages/quran.json`
- Create: `focuspath/data/passages/buddhist.json`
- Create: `focuspath/data/passages/index.ts`

- [ ] **Step 1: Create stoics.json**

Create `focuspath/data/passages/stoics.json`:
```json
[
  {
    "id": "stoics-001",
    "tradition": "stoics",
    "source": "Marcus Aurelius",
    "work": "Meditations",
    "quote": "You have power over your mind, not outside events.",
    "body": "You have power over your mind, not outside events. Realize this, and you will find strength.\n\nThe impediment to action advances action. What stands in the way becomes the way.\n\nWaste no more time arguing about what a good man should be. Be one.\n\nNever let the future disturb you. You will meet it, if you have to, with the same weapons of reason which today arm you against the present.\n\nIf it is not right, do not do it; if it is not true, do not say it. For let thy efforts be directed towards a whole, and let not thy mind be distracted by anything collateral.",
    "estimatedMinutes": 5
  },
  {
    "id": "stoics-002",
    "tradition": "stoics",
    "source": "Epictetus",
    "work": "Enchiridion",
    "quote": "Make the best use of what is in your power.",
    "body": "Make the best use of what is in your power, and take the rest as it happens. Some things are in our control and others not. Things in our control are opinion, pursuit, desire, aversion, and, in a word, whatever are our own actions. Things not in our control are body, property, reputation, command, and, in one word, whatever are not our own actions.\n\nThe things in our control are by nature free, unrestrained, unhindered; but those not in our control are weak, slavish, restrained, belonging to others. Remember, then, that if you suppose that things which are slavish by nature are also free, and that what belongs to others is your own, then you will be hindered.\n\nSeek not that the things which happen should happen as you wish; but wish the things which happen to be as they are, and you will have a tranquil flow of life.",
    "estimatedMinutes": 6
  },
  {
    "id": "stoics-003",
    "tradition": "stoics",
    "source": "Seneca",
    "work": "Letters from a Stoic",
    "quote": "We suffer more in imagination than in reality.",
    "body": "We suffer more in imagination than in reality. Begin at once to live, and count each separate day as a separate life.\n\nIt is not that I am brave, but that I know what is not worth fearing. Dum differtur vita transcurrit — while we are postponing, life speeds by.\n\nConcentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.\n\nLet us prepare our minds as if we had come to the very end of life. Let us postpone nothing. Let us balance life's books each day. The one who puts the finishing touches on their life each day is never short of time.\n\nNon differtur vita transcurrit. Omnia aliena sunt, tempus tantum nostrum est — all things are foreign to us; time alone belongs to us.",
    "estimatedMinutes": 6
  }
]
```

- [ ] **Step 2: Create gita.json**

Create `focuspath/data/passages/gita.json`:
```json
[
  {
    "id": "gita-001",
    "tradition": "gita",
    "source": "Bhagavad Gita",
    "work": "Chapter 2",
    "quote": "Let right deeds be thy motive, not the fruit which comes from them.",
    "body": "Let right deeds be thy motive, not the fruit which comes from them. And live in the action, labour! Make thine acts thy piety, casting all self aside, contemning gain and merit; so shall thine acts bring no bondage.\n\nNever the spirit was born; the spirit shall cease to be never. Never was time it was not; End and Beginning are dreams.\n\nYou grieve for those who should not be grieved for; yet you speak words as if with wisdom. Wise men do not grieve for the dead or for the living.\n\nIt is better to do one's own duty, however imperfectly, than to assume the duties of another person, however successfully. Prefer to die doing one's own duty: the duty of another will bring you into great spiritual danger.\n\nFor the soul there is never birth nor death at any time. It has not come into being, does not come into being, and will not come into being. It is unborn, eternal, ever-existing, and primeval.",
    "estimatedMinutes": 7
  },
  {
    "id": "gita-002",
    "tradition": "gita",
    "source": "Bhagavad Gita",
    "work": "Chapter 6",
    "quote": "The mind is restless and difficult to restrain, but it is subdued by practice.",
    "body": "The mind is restless and difficult to restrain, but it is subdued by practice. For those whose minds are uncontrolled, reaching the highest state is very hard. But those whose minds are controlled, and who strive by the right means, it is possible.\n\nWhen the mind, intellect and self are under control, freed from restless desire, so that they rest in the spirit within, a man becomes a Yukta — one in communion with God. A lamp does not flicker in a place where no wind blows; so it is with a yogi who controls his mind, intellect and self, being absorbed in the spirit within him.\n\nLet each man raise the self by the self. Let him not suffer the self to be lowered. For the Self is the friend of the self, and also the Self is the enemy of the self.\n\nTo the illumined man or woman, a clod of dirt, a stone, and gold are the same. With equal mind regard all: the honest, the dishonest, friends and enemies, the virtuous and the sinful.",
    "estimatedMinutes": 7
  }
]
```

- [ ] **Step 3: Create tao.json**

Create `focuspath/data/passages/tao.json`:
```json
[
  {
    "id": "tao-001",
    "tradition": "tao",
    "source": "Lao Tzu",
    "work": "Tao Te Ching",
    "quote": "To the mind that is still, the whole universe surrenders.",
    "body": "To the mind that is still, the whole universe surrenders.\n\nThe Tao that can be told is not the eternal Tao. The name that can be named is not the eternal name. The nameless is the beginning of heaven and earth. The named is the mother of ten thousand things.\n\nKnowing others is wisdom; knowing yourself is enlightenment. Mastering others requires force; mastering yourself requires strength.\n\nThe key to growth is the introduction of higher dimensions of consciousness into our awareness. Be content with what you have; rejoice in the way things are. When you realize there is nothing lacking, the whole world belongs to you.\n\nDo you have the patience to wait until your mud settles and the water is clear? Can you remain unmoving until the right action arises by itself?\n\nA man with outward courage dares to die. A man with inward courage dares to live.",
    "estimatedMinutes": 6
  },
  {
    "id": "tao-002",
    "tradition": "tao",
    "source": "Chuang Tzu",
    "work": "Inner Chapters",
    "quote": "Flow with whatever may happen and let your mind be free.",
    "body": "Flow with whatever may happen and let your mind be free. Stay centered by accepting whatever you are doing. This is the ultimate.\n\nHappiness is the absence of the striving for happiness. To have no striving is to have no mind. Without mind, one can do anything.\n\nThe man in whom Tao acts without impediment harms no other being by his actions yet he does not know himself to be 'kind', to be 'gentle'. The man in whom Tao acts without impediment does not bother with his own interests and does not despise others who do. He does not struggle to make money and does not make a virtue of poverty. He goes his way without relying on others and does not pride himself on walking alone.\n\nOnly the person who has faith in himself is able to be faithful to others. If water derives lucidity from stillness, how much more the faculties of the mind.",
    "estimatedMinutes": 6
  }
]
```

- [ ] **Step 4: Create upanishads.json**

Create `focuspath/data/passages/upanishads.json`:
```json
[
  {
    "id": "upanishads-001",
    "tradition": "upanishads",
    "source": "Brihadaranyaka Upanishad",
    "work": "Book 1",
    "quote": "You are what your deep, driving desire is.",
    "body": "You are what your deep, driving desire is. As your desire is, so is your will. As your will is, so is your deed. As your deed is, so is your destiny.\n\nFrom joy springs all creation, by joy it is sustained, towards joy it proceeds, and into joy it enters.\n\nThe Self is not born, nor does it die. It was not produced from anyone, and no one was produced from it. Unborn, eternal, primordial, this ancient one is not slain when the body is slain.\n\nThis Self is never born nor does it ever perish; it did not come into existence, and it will not come into existence. This unborn, eternal, ever-existing, primordial being is not slain when the body is slain.\n\nIn the beginning, this world was the Self alone in the form of a person. Looking around, he saw nothing else than himself. He first said, 'I am.' In the whole world, there is no one else.\n\nAs a lump of salt thrown in water becomes dissolved in water, and could not be taken out again, but wherever you taste the water, it is salty — even so, the infinite and boundless being is pure intelligence.",
    "estimatedMinutes": 7
  }
]
```

- [ ] **Step 5: Create bible.json**

Create `focuspath/data/passages/bible.json`:
```json
[
  {
    "id": "bible-001",
    "tradition": "bible",
    "source": "Psalms",
    "work": "Psalm 46",
    "quote": "Be still and know that I am God.",
    "body": "God is our refuge and strength, a very present help in trouble. Therefore we will not fear, even though the earth be removed, and though the mountains be carried into the midst of the sea.\n\nThere is a river whose streams shall make glad the city of God, the holy place of the tabernacle of the Most High. God is in the midst of her, she shall not be moved; God shall help her, just at the break of dawn.\n\nCome, behold the works of the Lord, who has made desolations in the earth. He makes wars cease to the end of the earth; He breaks the bow and cuts the spear in two; He burns the chariot in the fire.\n\nBe still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth. The Lord of hosts is with us; the God of Jacob is our refuge.",
    "estimatedMinutes": 5
  },
  {
    "id": "bible-002",
    "tradition": "bible",
    "source": "Sermon on the Mount",
    "work": "Matthew 5-7",
    "quote": "Blessed are the pure in heart, for they shall see God.",
    "body": "Blessed are the poor in spirit, for theirs is the kingdom of heaven. Blessed are those who mourn, for they shall be comforted. Blessed are the meek, for they shall inherit the earth. Blessed are those who hunger and thirst for righteousness, for they shall be filled.\n\nBlessed are the merciful, for they shall obtain mercy. Blessed are the pure in heart, for they shall see God. Blessed are the peacemakers, for they shall be called sons of God. Blessed are those who are persecuted for righteousness' sake, for theirs is the kingdom of heaven.\n\nYou are the light of the world. A city that is set on a hill cannot be hidden. Nor do they light a lamp and put it under a basket, but on a lampstand, and it gives light to all who are in the house. Let your light so shine before men, that they may see your good works and glorify your Father in heaven.\n\nAsk, and it will be given to you; seek, and you will find; knock, and it will be opened to you.",
    "estimatedMinutes": 6
  }
]
```

- [ ] **Step 6: Create quran.json**

Create `focuspath/data/passages/quran.json`:
```json
[
  {
    "id": "quran-001",
    "tradition": "quran",
    "source": "Quran",
    "work": "Surah Al-Baqarah 2:286",
    "quote": "Allah does not burden a soul beyond that it can bear.",
    "body": "Allah does not burden a soul beyond that it can bear. It will have what it has earned, and it will be held accountable for what it has deserved.\n\nOur Lord! Condemn us not if we forget or fall into error; our Lord! Lay not on us a burden like that which Thou didst lay on those before us; Our Lord! Lay not on us a burden greater than we have strength to bear. Blot out our sins, and grant us forgiveness. Have mercy on us. Thou art our Protector; Grant us victory over the disbelieving people.\n\nVerily, with hardship comes ease. Verily, with hardship comes ease. So when you have finished your duties, then stand up for worship. And to your Lord alone turn your hopes and intentions.\n\nAnd seek help through patience and prayer, and indeed, it is difficult except for the humbly submissive to Allah.",
    "estimatedMinutes": 5
  }
]
```

- [ ] **Step 7: Create buddhist.json**

Create `focuspath/data/passages/buddhist.json`:
```json
[
  {
    "id": "buddhist-001",
    "tradition": "buddhist",
    "source": "Dhammapada",
    "work": "Chapter 1",
    "quote": "The mind is everything. What you think, you become.",
    "body": "The mind is everything. What you think, you become. Mind is the forerunner of all actions. All deeds are led by mind, created by mind. If one speaks or acts with a corrupt mind, suffering follows, as the wheel follows the hoof of an ox.\n\nIf one speaks or acts with a serene mind, happiness follows, as a shadow that never departs.\n\nHatred is never appeased by hatred in this world. By non-hatred alone is hatred appeased. This is a law eternal.\n\nBetter than a thousand hollow words, is one word that brings peace. Better than a thousand hollow verses, is one verse that brings peace. Better than a hundred hollow stanzas, is one stanza that brings peace.\n\nDo not dwell in the past, do not dream of the future, concentrate the mind on the present moment. It is better to travel well than to arrive. You yourself, as much as anybody in the entire universe, deserve your love and affection.",
    "estimatedMinutes": 6
  },
  {
    "id": "buddhist-002",
    "tradition": "buddhist",
    "source": "Thich Nhat Hanh",
    "work": "The Miracle of Mindfulness",
    "quote": "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
    "body": "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor. Smile, breathe, and go slowly.\n\nThe present moment is the only moment available to us, and it is the door to all moments. People usually consider walking on water or in thin air a miracle. But I think the real miracle is not to walk either on water or in thin air, but to walk on earth.\n\nEvery day we are engaged in a miracle which we don't even recognize: a blue sky, white clouds, green leaves, the black, curious eyes of a child — our own two eyes. All is a miracle.\n\nBreathe in deeply to bring your mind home to your body. The most precious gift we can offer anyone is our attention. When mindfulness embraces those we love, they will bloom like flowers.\n\nIf you love someone but rarely make yourself available to him or her, that is not true love. When you love someone, you have to be fully present for them.",
    "estimatedMinutes": 6
  }
]
```

- [ ] **Step 8: Create passage index**

Create `focuspath/data/passages/index.ts`:
```ts
import stoics from './stoics.json'
import gita from './gita.json'
import tao from './tao.json'
import upanishads from './upanishads.json'
import bible from './bible.json'
import quran from './quran.json'
import buddhist from './buddhist.json'
import type { Passage } from '@/types'

export const PASSAGES: Passage[] = [
  ...stoics,
  ...gita,
  ...tao,
  ...upanishads,
  ...bible,
  ...quran,
  ...buddhist,
] as Passage[]
```

- [ ] **Step 9: Commit**

```bash
git add focuspath/data/
git commit -m "feat: add spiritual passage JSON data"
```

---

## Task 4: Passage selection logic

**Files:**
- Create: `focuspath/lib/passages.ts`
- Create: `focuspath/lib/passages.test.ts`

- [ ] **Step 1: Write failing tests**

Create `focuspath/lib/passages.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { getTodayPassage, getPassageById } from './passages'
import type { Tradition } from '@/types'

describe('getTodayPassage', () => {
  it('returns a passage deterministically for the same date', () => {
    const date = '2026-05-01'
    const a = getTodayPassage(date)
    const b = getTodayPassage(date)
    expect(a.id).toBe(b.id)
  })

  it('returns a different passage for a different date', () => {
    const ids = new Set(
      ['2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04'].map(
        d => getTodayPassage(d).id
      )
    )
    expect(ids.size).toBeGreaterThan(1)
  })

  it('filters by enabled traditions', () => {
    const traditions: Tradition[] = ['stoics']
    const passage = getTodayPassage('2026-05-01', traditions)
    expect(passage.tradition).toBe('stoics')
  })

  it('falls back to all passages if no traditions match', () => {
    const passage = getTodayPassage('2026-05-01', [])
    expect(passage).toBeDefined()
    expect(passage.id).toBeTruthy()
  })
})

describe('getPassageById', () => {
  it('returns correct passage', () => {
    const p = getPassageById('stoics-001')
    expect(p?.id).toBe('stoics-001')
    expect(p?.tradition).toBe('stoics')
  })

  it('returns null for unknown id', () => {
    expect(getPassageById('not-real')).toBeNull()
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test -- lib/passages.test.ts
```
Expected: FAIL — `Cannot find module './passages'`

- [ ] **Step 3: Implement**

Create `focuspath/lib/passages.ts`:
```ts
import { PASSAGES } from '@/data/passages'
import type { Passage, Tradition } from '@/types'

function hashDate(dateStr: string): number {
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function getTodayPassage(
  dateStr: string,
  traditions?: Tradition[]
): Passage {
  const pool =
    traditions && traditions.length > 0
      ? PASSAGES.filter(p => traditions.includes(p.tradition))
      : PASSAGES
  const source = pool.length > 0 ? pool : PASSAGES
  return source[hashDate(dateStr) % source.length]
}

export function getPassageById(id: string): Passage | null {
  return PASSAGES.find(p => p.id === id) ?? null
}
```

- [ ] **Step 4: Run to verify pass**

```bash
npm test -- lib/passages.test.ts
```
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add focuspath/lib/passages.ts focuspath/lib/passages.test.ts
git commit -m "feat: add passage selection logic with deterministic daily pick"
```

---

## Task 5: Prisma schema + DB setup

**Files:**
- Create: `focuspath/prisma/schema.prisma`
- Create: `focuspath/lib/prisma.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
cd focuspath
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Write schema**

Replace `focuspath/prisma/schema.prisma` with:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model User {
  id          String        @id @default(cuid())
  email       String?       @unique
  name        String?
  image       String?
  emailVerified DateTime?
  accounts    Account[]
  authSessions AuthSession[]
  sessions    FocusSession[]
  settings    UserSettings?
  createdAt   DateTime      @default(now())
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model AuthSession {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

model UserSettings {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  traditions      String[] @default(["stoics","gita","tao","upanishads","bible","quran","buddhist"])
  dailyTargetMins Int      @default(8)
}

model FocusSession {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  passageId    String
  focusSeconds Int
  quizScore    Int
  completed    Boolean  @default(false)
  date         DateTime @default(now())
}

model QuizCache {
  passageId  String   @id
  questions  Json
  createdAt  DateTime @default(now())
}
```

- [ ] **Step 3: Create Prisma singleton**

Create `focuspath/lib/prisma.ts`:
```ts
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 4: Run migration**

```bash
npx prisma db push
```
Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 5: Generate client**

```bash
npx prisma generate
```

- [ ] **Step 6: Commit**

```bash
git add focuspath/prisma/ focuspath/lib/prisma.ts
git commit -m "feat: add Prisma schema and DB setup for FocusPath"
```

---

## Task 6: Auth setup

**Files:**
- Create: `focuspath/lib/auth.ts`
- Create: `focuspath/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Create auth config**

Create `focuspath/lib/auth.ts`:
```ts
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import { prisma } from './prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string
      return session
    },
  },
})
```

- [ ] **Step 2: Create API route**

Create `focuspath/app/api/auth/[...nextauth]/route.ts`:
```ts
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

- [ ] **Step 3: Commit**

```bash
git add focuspath/lib/auth.ts focuspath/app/api/auth/
git commit -m "feat: add next-auth Google OAuth for FocusPath"
```

---

## Task 7: Claude API quiz generation

**Files:**
- Create: `focuspath/lib/claude.ts`
- Create: `focuspath/lib/claude.test.ts`
- Create: `focuspath/app/api/quiz/[passageId]/route.ts`

- [ ] **Step 1: Write failing test for generateQuiz**

Create `focuspath/lib/claude.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify([
          {
            question: 'What is the main theme?',
            choices: ['A', 'B', 'C', 'D'],
            correctIndex: 0,
            explanation: 'Because A.'
          },
          {
            question: 'What did the author say?',
            choices: ['P', 'Q', 'R', 'S'],
            correctIndex: 1,
            explanation: 'Because Q.'
          },
          {
            question: 'What concept is central?',
            choices: ['X', 'Y', 'Z', 'W'],
            correctIndex: 2,
            explanation: 'Because Z.'
          }
        ])}]
      })
    }
  }
}))

import { generateQuiz } from './claude'

describe('generateQuiz', () => {
  it('returns 3 questions with correct structure', async () => {
    const questions = await generateQuiz('stoics-001', 'Some passage text here.')
    expect(questions).toHaveLength(3)
    expect(questions[0]).toHaveProperty('question')
    expect(questions[0].choices).toHaveLength(4)
    expect(questions[0].correctIndex).toBeGreaterThanOrEqual(0)
    expect(questions[0].correctIndex).toBeLessThanOrEqual(3)
    expect(questions[0]).toHaveProperty('explanation')
  })
})
```

- [ ] **Step 2: Run to verify failure**

```bash
npm test -- lib/claude.test.ts
```
Expected: FAIL — `Cannot find module './claude'`

- [ ] **Step 3: Implement generateQuiz**

Create `focuspath/lib/claude.ts`:
```ts
import Anthropic from '@anthropic-ai/sdk'
import type { QuizQuestion } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateQuiz(
  passageId: string,
  passageBody: string
): Promise<QuizQuestion[]> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: `You generate reading comprehension questions for spiritual texts. 
Return ONLY a JSON array of exactly 3 objects, no markdown, no explanation outside the JSON.
Each object: { "question": string, "choices": [string, string, string, string], "correctIndex": number (0-3), "explanation": string }
Questions should test genuine understanding, not trivial recall.`,
    messages: [
      {
        role: 'user',
        content: `Generate 3 comprehension questions for this passage (id: ${passageId}):\n\n${passageBody}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const questions: QuizQuestion[] = JSON.parse(text)
  return questions
}
```

- [ ] **Step 4: Run to verify pass**

```bash
npm test -- lib/claude.test.ts
```
Expected: PASS

- [ ] **Step 5: Create quiz API route**

Create `focuspath/app/api/quiz/[passageId]/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateQuiz } from '@/lib/claude'
import { getPassageById } from '@/lib/passages'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ passageId: string }> }
) {
  const { passageId } = await params

  const cached = await prisma.quizCache.findUnique({ where: { passageId } })
  if (cached) {
    return NextResponse.json({ questions: cached.questions })
  }

  const passage = getPassageById(passageId)
  if (!passage) {
    return NextResponse.json({ error: 'Passage not found' }, { status: 404 })
  }

  const questions = await generateQuiz(passageId, passage.body)

  await prisma.quizCache.create({
    data: { passageId, questions: questions as object[] },
  })

  return NextResponse.json({ questions })
}
```

- [ ] **Step 6: Commit**

```bash
git add focuspath/lib/claude.ts focuspath/lib/claude.test.ts focuspath/app/api/quiz/
git commit -m "feat: add Claude quiz generation with DB caching"
```

---

## Task 8: Sessions API route

**Files:**
- Create: `focuspath/app/api/sessions/route.ts`
- Create: `focuspath/lib/sessions.ts`

- [ ] **Step 1: Create sessions API**

Create `focuspath/app/api/sessions/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { passageId, focusSeconds, quizScore, completed } = body

  const record = await prisma.focusSession.create({
    data: {
      userId: session.user.id,
      passageId,
      focusSeconds: Number(focusSeconds),
      quizScore: Number(quizScore),
      completed: Boolean(completed),
    },
  })

  return NextResponse.json(record)
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sessions = await prisma.focusSession.findMany({
    where: { userId: session.user.id, completed: true },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(sessions)
}
```

- [ ] **Step 2: Create localStorage helper for unauthenticated users**

Create `focuspath/lib/sessions.ts`:
```ts
import type { FocusSession } from '@/types'

const KEY = 'focuspath_sessions'

export function getLocalSessions(): FocusSession[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveLocalSession(session: FocusSession) {
  const all = getLocalSessions()
  all.push(session)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function getCurrentStreak(sessions: FocusSession[]): number {
  if (sessions.length === 0) return 0
  const completedDates = new Set(
    sessions
      .filter(s => s.completed)
      .map(s => new Date(s.date).toISOString().split('T')[0])
  )
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    if (completedDates.has(d.toISOString().split('T')[0])) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function getWeeklyAverages(
  sessions: FocusSession[]
): { week: string; avgSeconds: number }[] {
  const byWeek: Record<string, number[]> = {}
  for (const s of sessions.filter(s => s.completed)) {
    const d = new Date(s.date)
    const monday = new Date(d)
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const key = monday.toISOString().split('T')[0]
    byWeek[key] = [...(byWeek[key] ?? []), s.focusSeconds]
  }
  return Object.entries(byWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([week, vals]) => ({
      week,
      avgSeconds: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
    }))
}
```

- [ ] **Step 3: Commit**

```bash
git add focuspath/app/api/sessions/ focuspath/lib/sessions.ts
git commit -m "feat: add sessions API and localStorage helpers"
```

---

## Task 9: Global styles + layout

**Files:**
- Modify: `focuspath/app/globals.css`
- Modify: `focuspath/app/layout.tsx`
- Create: `focuspath/components/NavBar.tsx`

- [ ] **Step 1: Write globals.css**

Replace `focuspath/app/globals.css`:
```css
@import "tailwindcss";

:root {
  --cream: #fdf6ec;
  --cream-dark: #faebd7;
  --border: #e8d5b7;
  --saffron: #e85d04;
  --saffron-light: #f48c06;
  --brown: #3d2b1f;
  --brown-mid: #7a5c3a;
  --brown-muted: #a0845c;
  --green-ok: #4caf50;
  --green-ok-bg: #f0fff4;
  --red-err: #e53935;
  --red-err-bg: #fff5f5;
}

body {
  background-color: var(--cream);
  color: var(--brown);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

- [ ] **Step 2: Write layout.tsx**

Replace `focuspath/app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import './globals.css'
import NavBar from '@/components/NavBar'

export const metadata: Metadata = {
  title: 'FocusPath — Attention Trainer',
  description: 'Build your attention span through daily spiritual reading.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen pb-20">
        <SessionProvider>
          {children}
          <NavBar />
        </SessionProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Create NavBar**

Create `focuspath/components/NavBar.tsx`:
```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, TrendingUp, Settings } from 'lucide-react'

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/session/today', label: 'Today', icon: BookOpen },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function NavBar() {
  const path = usePathname()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex border-t"
      style={{ background: 'var(--cream-dark)', borderColor: 'var(--border)' }}
    >
      {links.map(({ href, label, icon: Icon }) => {
        const active = path === href || (href !== '/' && path.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center flex-1 py-2 gap-1 text-xs transition-colors"
            style={{ color: active ? 'var(--saffron)' : 'var(--brown-muted)' }}
          >
            <Icon size={20} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add focuspath/app/globals.css focuspath/app/layout.tsx focuspath/components/NavBar.tsx
git commit -m "feat: add global styles and nav bar"
```

---

## Task 10: Dashboard page

**Files:**
- Modify: `focuspath/app/page.tsx`
- Create: `focuspath/components/PassageCard.tsx`
- Create: `focuspath/components/WeeklyChart.tsx`

- [ ] **Step 1: Create PassageCard**

Create `focuspath/components/PassageCard.tsx`:
```tsx
import Link from 'next/link'
import type { Passage } from '@/types'

export default function PassageCard({ passage }: { passage: Passage }) {
  return (
    <Link href={`/session/${passage.id}`} className="block rounded-2xl p-5 text-white no-underline"
      style={{ background: 'linear-gradient(135deg, var(--saffron), var(--saffron-light))' }}>
      <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">
        Today's Passage
      </p>
      <p className="text-base font-semibold leading-relaxed mb-2" style={{ fontFamily: 'Georgia, serif' }}>
        "{passage.quote}"
      </p>
      <p className="text-xs opacity-80 mb-4">
        {passage.source} · {passage.work} · ~{passage.estimatedMinutes} min
      </p>
      <div className="rounded-lg py-2 px-4 text-center text-sm font-bold"
        style={{ background: 'rgba(255,255,255,0.2)' }}>
        Begin Today's Session →
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Create WeeklyChart**

Create `focuspath/components/WeeklyChart.tsx`:
```tsx
'use client'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface Props {
  data: { week: string; avgSeconds: number }[]
}

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export default function WeeklyChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-sm" style={{ color: 'var(--brown-muted)' }}>
        Complete your first session to see your progress chart.
      </div>
    )
  }
  const chartData = data.map(d => ({
    week: `Wk ${new Date(d.week).toLocaleDateString('en', { month: 'short', day: 'numeric' })}`,
    avgSeconds: d.avgSeconds,
  }))
  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={chartData} barSize={28}>
        <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--brown-muted)' }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v: number) => [fmt(v), 'Avg Focus']}
          contentStyle={{ background: 'var(--cream-dark)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="avgSeconds" fill="var(--saffron)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Step 3: Create Dashboard page**

Replace `focuspath/app/page.tsx`:
```tsx
import { getTodayPassage } from '@/lib/passages'
import PassageCard from '@/components/PassageCard'
import WeeklyChart from '@/components/WeeklyChart'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getWeeklyAverages, getCurrentStreak } from '@/lib/sessions'
import type { FocusSession } from '@/types'

export default async function Dashboard() {
  const today = new Date().toISOString().split('T')[0]
  const passage = getTodayPassage(today)

  const session = await auth()
  let dbSessions: FocusSession[] = []
  if (session?.user?.id) {
    const rows = await prisma.focusSession.findMany({
      where: { userId: session.user.id, completed: true },
      orderBy: { date: 'asc' },
    })
    dbSessions = rows.map(r => ({
      id: r.id,
      passageId: r.passageId,
      focusSeconds: r.focusSeconds,
      quizScore: r.quizScore,
      completed: r.completed,
      date: r.date.toISOString(),
    }))
  }

  const weeklyData = getWeeklyAverages(dbSessions)
  const streak = getCurrentStreak(dbSessions)
  const totalSessions = dbSessions.length
  const avgFocus = totalSessions > 0
    ? Math.round(dbSessions.reduce((a, s) => a + s.focusSeconds, 0) / totalSessions)
    : 0
  const avgQuiz = totalSessions > 0
    ? Math.round(dbSessions.reduce((a, s) => a + s.quizScore, 0) / totalSessions * 100 / 3)
    : 0

  const greetingHour = new Date().getHours()
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <main className="max-w-md mx-auto px-4 pt-8 pb-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--brown)' }}>{greeting}</h1>
          <p className="text-sm" style={{ color: 'var(--brown-muted)' }}>Your mind grows stronger every day</p>
        </div>
        {streak > 0 && (
          <span className="text-white text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: 'var(--saffron)' }}>
            🔥 {streak} days
          </span>
        )}
      </div>

      {/* Today's passage */}
      <div className="mb-6">
        <PassageCard passage={passage} />
      </div>

      {/* Stats */}
      {totalSessions > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { val: `${Math.floor(avgFocus / 60)}m`, label: 'Avg Focus' },
            { val: String(totalSessions), label: 'Sessions' },
            { val: `${avgQuiz}%`, label: 'Quiz Score' },
          ].map(({ val, label }) => (
            <div key={label} className="rounded-xl p-3 text-center border"
              style={{ background: 'var(--cream-dark)', borderColor: 'var(--border)' }}>
              <div className="text-xl font-black" style={{ color: 'var(--saffron)' }}>{val}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--brown-muted)' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly chart */}
      <div className="rounded-xl p-4 border" style={{ background: 'var(--cream-dark)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brown-muted)' }}>
          Attention span this week
        </p>
        <WeeklyChart data={weeklyData} />
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add focuspath/app/page.tsx focuspath/components/PassageCard.tsx focuspath/components/WeeklyChart.tsx
git commit -m "feat: add FocusPath dashboard"
```

---

## Task 11: Reading session page

**Files:**
- Create: `focuspath/app/session/[id]/page.tsx`
- Create: `focuspath/components/FocusTimer.tsx`
- Create: `focuspath/components/ReadingProgress.tsx`

- [ ] **Step 1: Create FocusTimer component**

Create `focuspath/components/FocusTimer.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'

interface Props {
  onTick: (seconds: number) => void
}

export default function FocusTimer({ onTick }: Props) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(s => {
        const next = s + 1
        onTick(next)
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [onTick])

  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')

  return (
    <div className="flex justify-between items-center rounded-xl p-4 border"
      style={{ background: 'var(--cream-dark)', borderColor: 'var(--border)' }}>
      <div>
        <div className="text-3xl font-black tabular-nums" style={{ color: 'var(--saffron)' }}>
          {m}:{s}
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--brown-muted)' }}>Time reading</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold" style={{ color: 'var(--brown)' }}>Target</div>
        <div className="text-xs" style={{ color: 'var(--brown-muted)' }}>Stay focused</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create ReadingProgress component**

Create `focuspath/components/ReadingProgress.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'

interface Props {
  onProgress: (pct: number) => void
}

export default function ReadingProgress({ onProgress }: Props) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      const p = total > 0 ? Math.round((scrolled / total) * 100) : 0
      setPct(p)
      onProgress(p)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [onProgress])

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50" style={{ background: 'var(--border)' }}>
      <div
        className="h-full transition-all duration-100"
        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--saffron), var(--saffron-light))' }}
      />
    </div>
  )
}
```

- [ ] **Step 3: Create reading page**

Create `focuspath/app/session/[id]/page.tsx`:
```tsx
'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getPassageById } from '@/lib/passages'
import FocusTimer from '@/components/FocusTimer'
import ReadingProgress from '@/components/ReadingProgress'

export default function ReadingPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const passage = getPassageById(id)

  const [focusSeconds, setFocusSeconds] = useState(0)
  const [scrollPct, setScrollPct] = useState(0)

  const canFinish = focusSeconds >= 60 && scrollPct >= 60

  const handleTick = useCallback((s: number) => setFocusSeconds(s), [])
  const handleProgress = useCallback((p: number) => setScrollPct(p), [])

  useEffect(() => {
    if (!passage) router.replace('/')
  }, [passage, router])

  if (!passage) return null

  function handleDone() {
    sessionStorage.setItem('fp_focus_seconds', String(focusSeconds))
    router.push(`/session/${id}/quiz`)
  }

  return (
    <>
      <ReadingProgress onProgress={handleProgress} />
      <main className="max-w-md mx-auto px-4 pt-8 pb-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--brown-muted)' }}>
            {passage.source} · {passage.work}
          </p>
          <p className="text-xs" style={{ color: 'var(--brown-muted)' }}>
            Read carefully — you'll be asked 3 questions after
          </p>
        </div>

        {/* Passage text */}
        <div className="mb-8 leading-8 text-base" style={{ fontFamily: 'Georgia, serif', color: 'var(--brown)' }}>
          {passage.body.split('\n\n').map((para, i) => (
            <p key={i} className="mb-5">{para}</p>
          ))}
        </div>

        {/* Timer */}
        <div className="mb-4">
          <FocusTimer onTick={handleTick} />
        </div>

        {/* Done button */}
        <button
          onClick={handleDone}
          disabled={!canFinish}
          className="w-full py-4 rounded-xl font-bold text-base transition-all"
          style={{
            background: canFinish ? 'var(--saffron)' : 'var(--border)',
            color: canFinish ? 'white' : 'var(--brown-muted)',
            cursor: canFinish ? 'pointer' : 'not-allowed',
          }}
        >
          {canFinish ? "I've finished reading →" : `Keep reading… (${Math.max(0, 60 - focusSeconds)}s)`}
        </button>
      </main>
    </>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add focuspath/app/session/ focuspath/components/FocusTimer.tsx focuspath/components/ReadingProgress.tsx
git commit -m "feat: add reading session page with focus timer"
```

---

## Task 12: Comprehension gate (quiz)

**Files:**
- Create: `focuspath/app/session/[id]/quiz/page.tsx`
- Create: `focuspath/components/QuizQuestion.tsx`

- [ ] **Step 1: Create QuizQuestion component**

Create `focuspath/components/QuizQuestion.tsx`:
```tsx
'use client'
import { useState } from 'react'
import type { QuizQuestion as Q } from '@/types'

interface Props {
  question: Q
  questionNumber: number
  total: number
  onAnswer: (correct: boolean) => void
}

export default function QuizQuestion({ question, questionNumber, total, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null)

  function handleChoice(i: number) {
    if (selected !== null) return
    setSelected(i)
    setTimeout(() => onAnswer(i === question.correctIndex), 1200)
  }

  function choiceStyle(i: number) {
    if (selected === null) return { background: 'var(--cream-dark)', border: '1.5px solid var(--border)', color: 'var(--brown)' }
    if (i === question.correctIndex) return { background: 'var(--green-ok-bg)', border: '1.5px solid var(--green-ok)', color: '#2e7d32' }
    if (i === selected) return { background: 'var(--red-err-bg)', border: '1.5px solid var(--red-err)', color: '#b71c1c' }
    return { background: 'var(--cream-dark)', border: '1.5px solid var(--border)', color: 'var(--brown-muted)', opacity: 0.5 }
  }

  return (
    <div>
      {/* Progress dots */}
      <div className="flex gap-2 mb-4">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full"
            style={{ background: i < questionNumber - 1 ? 'var(--saffron)' : i === questionNumber - 1 ? 'var(--saffron-light)' : 'var(--border)' }} />
        ))}
      </div>

      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--brown-muted)' }}>
        Question {questionNumber} of {total}
      </p>
      <p className="text-base mb-5 leading-relaxed" style={{ fontFamily: 'Georgia, serif', color: 'var(--brown)', fontStyle: 'italic' }}>
        "{question.question}"
      </p>

      <div className="flex flex-col gap-3 mb-4">
        {question.choices.map((choice, i) => (
          <button key={i} onClick={() => handleChoice(i)}
            className="text-left rounded-xl px-4 py-3 text-sm transition-all"
            style={choiceStyle(i)}>
            {choice}
          </button>
        ))}
      </div>

      {selected !== null && (
        <div className="rounded-xl p-3 text-sm"
          style={{
            background: selected === question.correctIndex ? 'var(--green-ok-bg)' : 'var(--red-err-bg)',
            border: `1.5px solid ${selected === question.correctIndex ? 'var(--green-ok)' : 'var(--red-err)'}`,
            color: selected === question.correctIndex ? '#2e7d32' : '#b71c1c',
          }}>
          {selected === question.correctIndex ? '✓ Correct! ' : '✗ Not quite. '}
          <span style={{ opacity: 0.85 }}>{question.explanation}</span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create quiz page**

Create `focuspath/app/session/[id]/quiz/page.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import QuizQuestionComponent from '@/components/QuizQuestion'
import type { QuizQuestion } from '@/types'
import { saveLocalSession } from '@/lib/sessions'

export default function QuizPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch(`/api/quiz/${id}`)
      .then(r => r.json())
      .then(data => {
        setQuestions(data.questions)
        setLoading(false)
      })
  }, [id])

  function handleAnswer(correct: boolean) {
    const newScore = correct ? score + 1 : score
    if (current + 1 >= questions.length) {
      // Session complete
      const focusSeconds = Number(sessionStorage.getItem('fp_focus_seconds') ?? 0)
      const completed = newScore >= 2
      saveLocalSession({
        id: crypto.randomUUID(),
        passageId: id,
        focusSeconds,
        quizScore: newScore,
        completed,
        date: new Date().toISOString(),
      })
      // Also persist to DB if logged in
      fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passageId: id, focusSeconds, quizScore: newScore, completed }),
      }).catch(() => {}) // silently fail if not authed
      setScore(newScore)
      setDone(true)
    } else {
      setScore(newScore)
      setCurrent(c => c + 1)
    }
  }

  if (loading) {
    return (
      <main className="max-w-md mx-auto px-4 pt-16 text-center">
        <p style={{ color: 'var(--brown-muted)' }}>Generating questions…</p>
      </main>
    )
  }

  if (done) {
    const passed = score >= 2
    return (
      <main className="max-w-md mx-auto px-4 pt-16 text-center">
        <div className="text-6xl mb-4">{passed ? '🌟' : '📖'}</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--brown)' }}>
          {passed ? 'Session Complete!' : 'Keep Practicing'}
        </h2>
        <p className="mb-2" style={{ color: 'var(--brown-muted)' }}>
          You scored {score}/3
        </p>
        {!passed && (
          <p className="text-sm mb-6" style={{ color: 'var(--brown-muted)' }}>
            That's okay — re-reading will deepen your understanding.
          </p>
        )}
        <div className="flex flex-col gap-3 mt-6">
          <button onClick={() => router.push('/')}
            className="py-4 rounded-xl font-bold text-white"
            style={{ background: 'var(--saffron)' }}>
            Back to Home
          </button>
          {!passed && (
            <button onClick={() => router.push(`/session/${id}`)}
              className="py-4 rounded-xl font-bold border"
              style={{ borderColor: 'var(--border)', color: 'var(--brown)' }}>
              Re-read passage
            </button>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-md mx-auto px-4 pt-8">
      <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--brown)' }}>Did you really read it?</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--brown-muted)' }}>Answer to complete your session</p>
      <QuizQuestionComponent
        key={current}
        question={questions[current]}
        questionNumber={current + 1}
        total={questions.length}
        onAnswer={handleAnswer}
      />
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add focuspath/app/session/ focuspath/components/QuizQuestion.tsx
git commit -m "feat: add comprehension gate quiz page"
```

---

## Task 13: Progress page

**Files:**
- Create: `focuspath/app/progress/page.tsx`
- Create: `focuspath/components/TraditionBar.tsx`

- [ ] **Step 1: Create TraditionBar**

Create `focuspath/components/TraditionBar.tsx`:
```tsx
import type { Tradition } from '@/types'
import { PASSAGES } from '@/data/passages'

const LABELS: Record<Tradition, string> = {
  stoics: 'Stoics',
  gita: 'Bhagavad Gita',
  tao: 'Tao Te Ching',
  upanishads: 'Upanishads',
  bible: 'Bible',
  quran: 'Quran',
  buddhist: 'Buddhist',
}

interface Props {
  tradition: Tradition
  count: number
}

export default function TraditionBar({ tradition, count }: Props) {
  const total = PASSAGES.filter(p => p.tradition === tradition).length
  const pct = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div className="flex items-center justify-between rounded-xl px-4 py-3 border"
      style={{ background: 'var(--cream-dark)', borderColor: 'var(--border)' }}>
      <span className="text-sm font-semibold" style={{ color: 'var(--brown)' }}>
        {LABELS[tradition]}
      </span>
      <div className="flex items-center gap-3">
        <div className="w-20 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--saffron)' }} />
        </div>
        <span className="text-xs w-12 text-right" style={{ color: 'var(--brown-muted)' }}>
          {count} read
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create Progress page**

Create `focuspath/app/progress/page.tsx`:
```tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import WeeklyChart from '@/components/WeeklyChart'
import TraditionBar from '@/components/TraditionBar'
import { getWeeklyAverages } from '@/lib/sessions'
import type { FocusSession, Tradition } from '@/types'

const TRADITIONS: Tradition[] = ['stoics', 'gita', 'tao', 'upanishads', 'bible', 'quran', 'buddhist']

export default async function ProgressPage() {
  const session = await auth()
  let sessions: FocusSession[] = []

  if (session?.user?.id) {
    const rows = await prisma.focusSession.findMany({
      where: { userId: session.user.id, completed: true },
      orderBy: { date: 'asc' },
    })
    sessions = rows.map(r => ({
      id: r.id,
      passageId: r.passageId,
      focusSeconds: r.focusSeconds,
      quizScore: r.quizScore,
      completed: r.completed,
      date: r.date.toISOString(),
    }))
  }

  const weeklyData = getWeeklyAverages(sessions)
  const totalSessions = sessions.length
  const avgSeconds = totalSessions > 0
    ? Math.round(sessions.reduce((a, s) => a + s.focusSeconds, 0) / totalSessions)
    : 0
  const week1Avg = weeklyData[0]?.avgSeconds ?? 0
  const currentAvg = weeklyData[weeklyData.length - 1]?.avgSeconds ?? avgSeconds
  const delta = currentAvg - week1Avg

  const traditionCounts = Object.fromEntries(
    TRADITIONS.map(t => [t, sessions.filter(s => s.passageId.startsWith(t)).length])
  ) as Record<Tradition, number>

  function fmtSeconds(s: number) {
    return `${Math.floor(s / 60)}m ${s % 60}s`
  }

  return (
    <main className="max-w-md mx-auto px-4 pt-8">
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--brown)', fontFamily: 'Georgia, serif' }}>
        Your attention span is growing
      </h1>

      {/* Big stat */}
      <div className="rounded-2xl p-5 border mb-4" style={{ background: 'var(--cream-dark)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--brown-muted)' }}>
          Average focus time
        </p>
        <p className="text-4xl font-black mb-1" style={{ color: 'var(--saffron)' }}>
          {fmtSeconds(currentAvg || avgSeconds)}
        </p>
        {delta > 0 && (
          <p className="text-sm font-semibold" style={{ color: 'var(--green-ok)' }}>
            ↑ +{fmtSeconds(delta)} from week 1
          </p>
        )}
        <div className="mt-4">
          <WeeklyChart data={weeklyData} />
        </div>
      </div>

      {/* By tradition */}
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brown-muted)' }}>
        By tradition
      </p>
      <div className="flex flex-col gap-2">
        {TRADITIONS.map(t => (
          <TraditionBar key={t} tradition={t} count={traditionCounts[t]} />
        ))}
      </div>

      {totalSessions === 0 && (
        <p className="text-center text-sm mt-8" style={{ color: 'var(--brown-muted)' }}>
          Complete your first session to see your progress here.
        </p>
      )}
    </main>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add focuspath/app/progress/ focuspath/components/TraditionBar.tsx
git commit -m "feat: add progress page with weekly chart and tradition breakdown"
```

---

## Task 14: Settings page

**Files:**
- Create: `focuspath/app/settings/page.tsx`

- [ ] **Step 1: Create settings page**

Create `focuspath/app/settings/page.tsx`:
```tsx
'use client'
import { useEffect, useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import type { Tradition } from '@/types'

const TRADITIONS: { id: Tradition; label: string }[] = [
  { id: 'stoics', label: 'Stoics (Marcus Aurelius, Epictetus, Seneca)' },
  { id: 'gita', label: 'Bhagavad Gita' },
  { id: 'tao', label: 'Tao Te Ching' },
  { id: 'upanishads', label: 'Upanishads' },
  { id: 'bible', label: 'Bible (Psalms, Proverbs, Sermon on the Mount)' },
  { id: 'quran', label: 'Quran' },
  { id: 'buddhist', label: 'Buddhist (Dhammapada)' },
]

const DEFAULT_TRADITIONS: Tradition[] = ['stoics', 'gita', 'tao', 'upanishads', 'bible', 'quran', 'buddhist']

export default function SettingsPage() {
  const { data: session } = useSession()
  const [enabled, setEnabled] = useState<Tradition[]>(DEFAULT_TRADITIONS)
  const [target, setTarget] = useState(8)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fp_traditions')
      if (saved) setEnabled(JSON.parse(saved))
      const t = localStorage.getItem('fp_target_mins')
      if (t) setTarget(Number(t))
    } catch {}
  }, [])

  function toggleTradition(id: Tradition) {
    setEnabled(prev => {
      const next = prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
      localStorage.setItem('fp_traditions', JSON.stringify(next))
      return next
    })
  }

  function handleTarget(v: number) {
    setTarget(v)
    localStorage.setItem('fp_target_mins', String(v))
  }

  return (
    <main className="max-w-md mx-auto px-4 pt-8">
      <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--brown)' }}>Settings</h1>

      {/* Auth */}
      <div className="rounded-2xl p-5 border mb-6" style={{ background: 'var(--cream-dark)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brown-muted)' }}>Account</p>
        {session ? (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--brown)' }}>{session.user?.name}</p>
              <p className="text-xs" style={{ color: 'var(--brown-muted)' }}>{session.user?.email}</p>
            </div>
            <button onClick={() => signOut()} className="text-sm px-4 py-2 rounded-lg border"
              style={{ borderColor: 'var(--border)', color: 'var(--brown-muted)' }}>
              Sign out
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm mb-3" style={{ color: 'var(--brown-muted)' }}>
              Sign in to sync your progress across devices.
            </p>
            <button onClick={() => signIn('google')}
              className="w-full py-3 rounded-xl font-bold text-white"
              style={{ background: 'var(--saffron)' }}>
              Sign in with Google
            </button>
          </div>
        )}
      </div>

      {/* Daily target */}
      <div className="rounded-2xl p-5 border mb-6" style={{ background: 'var(--cream-dark)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brown-muted)' }}>Daily target</p>
        <div className="flex items-center gap-4">
          <input type="range" min={3} max={30} value={target} onChange={e => handleTarget(Number(e.target.value))}
            className="flex-1" style={{ accentColor: 'var(--saffron)' }} />
          <span className="text-lg font-black w-16 text-right" style={{ color: 'var(--saffron)' }}>{target} min</span>
        </div>
      </div>

      {/* Traditions */}
      <div className="rounded-2xl p-5 border" style={{ background: 'var(--cream-dark)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brown-muted)' }}>Traditions</p>
        <div className="flex flex-col gap-3">
          {TRADITIONS.map(({ id, label }) => (
            <label key={id} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm" style={{ color: 'var(--brown)' }}>{label}</span>
              <div onClick={() => toggleTradition(id)}
                className="w-11 h-6 rounded-full relative cursor-pointer transition-colors"
                style={{ background: enabled.includes(id) ? 'var(--saffron)' : 'var(--border)' }}>
                <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow"
                  style={{ left: enabled.includes(id) ? '24px' : '4px' }} />
              </div>
            </label>
          ))}
        </div>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add focuspath/app/settings/
git commit -m "feat: add settings page with tradition toggles and daily target"
```

---

## Task 15: Session/today redirect

**Files:**
- Create: `focuspath/app/session/today/page.tsx`

- [ ] **Step 1: Create today redirect**

Create `focuspath/app/session/today/page.tsx`:
```tsx
import { redirect } from 'next/navigation'
import { getTodayPassage } from '@/lib/passages'

export default function TodayRedirect() {
  const today = new Date().toISOString().split('T')[0]
  const passage = getTodayPassage(today)
  redirect(`/session/${passage.id}`)
}
```

- [ ] **Step 2: Commit**

```bash
git add focuspath/app/session/today/
git commit -m "feat: add /session/today redirect to daily passage"
```

---

## Task 16: Build check + deploy to Vercel

**Files:**
- Create: `focuspath/.env.local` (already done in Task 1 — verify it exists)
- Create: `focuspath/vercel.json` (optional, for root directory config)

- [ ] **Step 1: Verify build passes locally**

```bash
cd focuspath
npm run build
```
Expected: `✓ Compiled successfully` with no type errors

Fix any type errors before proceeding.

- [ ] **Step 2: Run tests**

```bash
npm test
```
Expected: All tests pass.

- [ ] **Step 3: Push branch to GitHub**

```bash
git push origin claude/objective-jepsen-22c48a
```

- [ ] **Step 4: Deploy to Vercel**

```bash
cd focuspath
npx vercel --yes
```

When prompted:
- Link to existing project? → No
- Project name → `focuspath`
- Which directory is your code? → `./` (you're already inside `focuspath/`)
- Override settings? → No

- [ ] **Step 5: Set environment variables in Vercel**

```bash
npx vercel env add DATABASE_URL production
npx vercel env add AUTH_SECRET production
npx vercel env add AUTH_GOOGLE_ID production
npx vercel env add AUTH_GOOGLE_SECRET production
npx vercel env add ANTHROPIC_API_KEY production
```

- [ ] **Step 6: Deploy to production**

```bash
npx vercel --prod
```
Expected: `✅ Production: https://focuspath-xxx.vercel.app`

- [ ] **Step 7: Run DB migration on production**

```bash
DATABASE_URL=<your_neon_url> npx prisma db push
```

- [ ] **Step 8: Final commit**

```bash
git add focuspath/
git commit -m "feat: FocusPath complete — spiritual attention trainer"
git push
```
