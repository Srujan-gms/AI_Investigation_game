# 🕵️ AI Mystery Room — Project Specification
> **Version:** 1.1.0 | **Status:** Draft | **Last Updated:** 2026-10-25
> This document is the **Single Source of Truth** for the AI Mystery Room project.
> All design, development, and testing decisions must align with this spec.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Core User Flow](#4-core-user-flow)
5. [Feature Specification](#5-feature-specification)
6. [AI Integration (Gemini)](#6-ai-integration-gemini)
7. [Data Models](#7-data-models)
8. [API Contracts](#8-api-contracts)
9. [Frontend Specification](#9-frontend-specification)
10. [Backend Specification](#10-backend-specification)
11. [Security & Auth](#11-security--auth)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Folder Structure](#13-folder-structure)
14. [Development Phases (Milestones)](#14-development-phases-milestones)
15. [Open Questions & Decisions](#15-open-questions--decisions)

---

## 1. Project Overview

### 1.1 Concept
**AI Mystery Room** is an immersive, AI-powered web experience where users submit a brief scenario or story prompt. The system then generates a complete fictional murder mystery / investigation challenge — including characters, motive, evidence (fake WhatsApp messages, AI-generated images, surveillance camera recordings), and a set of suspects. The user must analyze the evidence and identify the culprit.

### 1.2 Goals
- Deliver an interactive, cinematic detective experience powered entirely by AI.
- All content (story, evidence, characters) is dynamically generated — no two mysteries are the same.
- The experience should feel immersive: styled evidence cards, a tense UI aesthetic, and progressive evidence reveals.

### 1.3 Target Users
- Casual gamers who enjoy puzzle / mystery games.
- Interactive fiction enthusiasts.
- Groups playing collaboratively (e.g., party game mode).

### 1.4 Success Metrics
| Metric | Target |
|---|---|
| Mystery generation time | < 30 seconds |
| Evidence variety per case | >= 3 types (chat, image, video) |
| Unique mysteries generated | Unlimited (prompt-driven) |
| User session length | >= 10 minutes |

---

## 2. Tech Stack

### 2.1 Full Stack
| Layer | Technology | Version |
|---|---|---|
| Frontend | React.js | 18+ |
| Backend | Node.js + Express.js | Node 20+ |
| Database | MongoDB | 7+ |
| ODM | Mongoose | 8+ |
| AI / LLM | Google Gemini API | gemini-2.0-flash or gemini-1.5-pro |
| AI Image Gen | Gemini Imagen API | Latest |
| AI Video Gen | Google Veo API (or stub) | Latest |
| Auth | Google OAuth 2.0 + Passport.js + JWT | - |
| File Storage | Cloudinary (images/videos) | - |
| Styling | Vanilla CSS / CSS Modules | - |
| State Management | React Context API + useReducer | - |
| HTTP Client | Axios | - |
| Environment | dotenv | - |

### 2.2 Dev Tools
| Tool | Purpose |
|---|---|
| Vite | Frontend build tool |
| Nodemon | Backend hot reload |
| ESLint + Prettier | Code quality |
| Postman | API testing |
| MongoDB Atlas | Cloud DB |

---

## 3. System Architecture

```
+--------------------------------------------------+
|                   CLIENT (React)                  |
|  +------------+  +--------------+  +----------+  |
|  | Story Input |  |Evidence Room |  | Verdict  |  |
|  +------------+  +--------------+  +----------+  |
+------------------------+-------------------------+
                         | HTTPS (REST API)
+------------------------v-------------------------+
|               SERVER (Express.js)                 |
|  +--------------+  +-------------------------+   |
|  | Auth Routes  |  |   Mystery Routes         |   |
|  +--------------+  +------------+------------+   |
|                                 |               |
|  +------------------------------v------------+  |
|  |           AI Orchestration Service        |  |
|  |  +------------------------------------+   |  |
|  |  |  Gemini LLM (story + script gen)   |   |  |
|  |  |  Gemini Imagen (evidence images)   |   |  |
|  |  |  Google Veo (cam footage stubs)    |   |  |
|  |  +------------------------------------+   |  |
|  +-------------------------------------------+  |
+------------------------+-------------------------+
                         |
          +--------------v--------------+
          |     MongoDB (Atlas)          |
          |  users | mysteries | sessions|
          +------------------------------+
                         |
          +--------------v--------------+
          |       Cloudinary CDN         |
          |  (images, video clips)       |
          +------------------------------+
```

---

## 4. Core User Flow

```
[User lands on Homepage]
        |
        v
[User logs in / registers]
        |
        v
[Dashboard — "New Investigation"]
        |
        v
[Story Input Page]
  User types a scenario (e.g., "A professor was found dead in his study room...")
        |
        v
[Loading Screen — "AI is building your case..."]
  Backend calls Gemini to:
  1. Generate mystery (culprit, suspects, motive, timeline)
  2. Generate fake WhatsApp-style chat evidence
  3. Generate evidence images (Gemini Imagen)
  4. Generate cam-footage description / thumbnail stub
        |
        v
[Investigation Room]
  |-- Case Brief panel (story summary)
  |-- Suspects Board (3-5 AI-generated suspects with photos)
  |-- Evidence Locker (tabbed: Chats | Images | Cam Footage)
  +-- Timeline panel (chronological events)
        |
        v
[User reviews evidence, pins clues, takes notes]
        |
        v
[Accusation Screen — "Who did it?"]
  User selects a suspect and submits verdict
        |
        v
[Verdict Reveal Screen]
  |-- Correct: "Well done, Detective!" + Case file summary
  +-- Wrong: "The real culprit was [X]" + explanation
        |
        v
[Option: Share result | Play again | View history]
```

---

## 5. Feature Specification

### 5.1 Authentication
| Feature | Detail |
|---|---|
| Provider | Google OAuth 2.0 (via Passport.js `passport-google-oauth20`) |
| Login / Register | Single "Sign in with Google" button — no email/password form |
| Session | After Google callback, server issues a JWT stored in an httpOnly cookie |
| New user | Auto-created in DB on first Google login (email + Google profile ID) |
| Guest mode | Allow one mystery without account; account required to save/view history |
| Logout | Clears JWT cookie; no Google session revocation needed |

### 5.2 Story Input
| Feature | Detail |
|---|---|
| Prompt field | Free-text textarea, 50-500 chars |
| Validation | Non-empty, profanity filter (basic) |
| Genre tags | Optional tags: Noir, Sci-Fi, Fantasy, Corporate, Historical |
| Difficulty | Easy / Medium / Hard (affects number of red herrings) |
| Submit | Triggers mystery generation pipeline |

### 5.3 Mystery Generation (AI Pipeline)
| Feature | Detail |
|---|---|
| Suspects | 3 (Easy), 4 (Medium), 5 (Hard) AI-generated suspects |
| Culprit | Randomly selected from suspects; AI builds backstory around them |
| Evidence pieces | Min 6 per mystery (2 chats, 2 images, 1 video stub, 1 document) |
| Red herrings | AI plants misleading clues pointing to innocent suspects |
| Timeline | AI generates a chronological event log for the mystery |

### 5.4 Investigation Room
| Feature | Detail |
|---|---|
| Case Brief | Read-only story summary panel |
| Suspects Board | Grid of suspect cards (name, photo, role, alibi) |
| Evidence Locker | Tabbed panel with Chat / Image / Video / Docs evidence |
| Pin clue | User can bookmark/pin specific evidence items |
| Detective Notes | Free-text scratchpad (stored per session) |
| Reveal hints | Spend "hint tokens" (3 per mystery) for AI-powered hints |

### 5.5 WhatsApp-Style Chat Evidence
| Feature | Detail |
|---|---|
| UI | Styled to match WhatsApp chat bubbles (dark and light mode) |
| Content | AI-generated conversation between fictional characters |
| Metadata | Timestamps, read receipts, typing indicators (static) |
| Redacted messages | Some messages partially blurred (Easter egg) |

### 5.6 Image Evidence
| Feature | Detail |
|---|---|
| Generation | Gemini Imagen generates scene photos |
| Types | Crime scene photo, CCTV screenshot, personal photo, document photo |
| Metadata | AI-generated EXIF-style caption (date, location, camera) |
| Zoom | Click-to-zoom lightbox |

### 5.7 Cam Recording Evidence
| Feature | Detail |
|---|---|
| Generation | Google Veo or stub video clip with AI description overlay |
| Fallback | If Veo unavailable: animated GIF + AI-written transcript |
| UI | Fake VHS / CCTV player aesthetic |
| Timestamp | Shows fake date/time overlay on footage |

### 5.8 Verdict & Scoring
| Feature | Detail |
|---|---|
| Submission | User selects one suspect and confirms |
| Scoring | +100 base if correct; -10 per hint used |
| Leaderboard | Top scores per genre (stretch goal) |
| Share | Generate shareable card with case name + score |

### 5.9 History / Dashboard
| Feature | Detail |
|---|---|
| Past cases | List of previously generated mysteries |
| Status | Solved / Unsolved / Abandoned |
| Replay | View evidence from old cases |

---

## 6. AI Integration (Gemini)

### 6.1 Prompt Engineering — Mystery Generation

**System Prompt:**
```
You are a mystery writer AI. Given a user scenario, generate a complete JSON investigation file.
Rules:
- Create 3-5 unique suspects with names, roles, photo descriptions, and alibis
- Choose one culprit secretly; hide them among suspects
- Generate a plausible motive, timeline of events, and cause of death/crime
- Plant at least 2 red herrings in the evidence
- All names, places, and events are fictional
- Output must be valid JSON only. No markdown, no explanation.
```

**Output Schema:** See Data Models -> Mystery

### 6.2 Prompt — Chat Evidence Generation

**Prompt template:**
```
Generate a WhatsApp-style conversation between [Character A] and [Character B] that:
- Takes place on [DATE] between [TIME RANGE]
- Subtly reveals [CLUE_DETAIL] without being too obvious
- Is exactly [N] messages long
- Feels natural and realistic
Output as JSON array: [{sender, message, timestamp, isRead}]
```

### 6.3 Image Generation — Gemini Imagen

- Use Gemini Imagen API with descriptive prompts for each evidence image.
- Prompt must include: scene type, lighting, objects present, style: photorealistic, grainy, surveillance.
- Images stored to Cloudinary; URL saved in Mystery.evidence[].

### 6.4 Video Evidence — Google Veo (or fallback)

- **Primary:** Call Veo API with a short-clip prompt (5-10s, CCTV style).
- **Fallback:** Generate an AI description + static noise image + overlay transcript text.
- Video stored in Cloudinary.

### 6.5 Hint Generation

**Prompt template:**
```
The user is investigating case [CASE_ID]. They have viewed [EVIDENCE_LIST].
Provide a subtle hint that nudges them toward the correct culprit without revealing the answer.
Hint should be 2 sentences or fewer. Do not directly name the culprit.
```

### 6.6 Rate Limits & Cost Management
| Constraint | Strategy |
|---|---|
| Gemini API quota | Queue requests; limit 1 mystery per user per minute |
| Image gen cost | Cache images; do not regenerate on page refresh |
| Video gen cost | Generate once; serve from Cloudinary CDN |
| Error handling | Graceful fallback to text-only evidence on API failure |

---

## 7. Data Models

### 7.1 User
```js
{
  _id: ObjectId,
  username: String,          // from Google profile displayName
  email: String,             // from Google profile email
  googleId: String,          // unique Google profile ID (used for upsert on login)
  avatar: String,            // Google profile picture URL
  solvedCases: [ObjectId],   // ref: Mystery
  hintTokens: Number,        // default: 3 per case (reset per case)
  createdAt: Date,
  updatedAt: Date
}
```

### 7.2 Mystery
```js
{
  _id: ObjectId,
  createdBy: ObjectId,       // ref: User (null if guest)
  title: String,             // AI-generated case title
  userPrompt: String,        // original user input
  genre: String,             // Noir | Sci-Fi | Fantasy | Corporate | Historical
  difficulty: String,        // easy | medium | hard

  caseBrief: String,         // AI-generated story summary (2-3 paragraphs)
  timeline: [
    {
      time: String,          // e.g., "9:45 PM"
      event: String          // description of what happened
    }
  ],

  suspects: [
    {
      id: String,            // slug e.g., "james-harrow"
      name: String,
      role: String,          // e.g., "The Victim's Business Partner"
      age: Number,
      photoUrl: String,      // Cloudinary URL
      photoPrompt: String,   // stored prompt used to generate photo
      alibi: String,
      backstory: String,
      isCulprit: Boolean     // hidden from client until verdict submitted
    }
  ],

  evidence: [
    {
      id: String,
      type: String,          // "chat" | "image" | "video" | "document"
      title: String,
      description: String,
      mediaUrl: String,      // Cloudinary URL (image/video)
      chatData: [            // populated if type === "chat"
        {
          sender: String,
          message: String,
          timestamp: String,
          isRead: Boolean
        }
      ],
      documentText: String,  // populated if type === "document"
      isRedHerring: Boolean, // hidden from client
      revealOrder: Number    // order in which evidence is shown
    }
  ],

  culpritId: String,         // hidden from client until verdict
  motive: String,            // revealed after verdict
  explanation: String,       // full case explanation revealed after verdict

  status: String,            // "generating" | "ready" | "failed"
  generationLog: [String],   // debug log of AI generation steps

  createdAt: Date,
  updatedAt: Date
}
```

### 7.3 Session (Investigation Progress)
```js
{
  _id: ObjectId,
  userId: ObjectId,          // ref: User
  mysteryId: ObjectId,       // ref: Mystery
  pinnedEvidence: [String],  // evidence IDs pinned by user
  notes: String,             // detective scratchpad
  hintsUsed: Number,         // 0-3
  verdict: String,           // suspect ID user selected
  isCorrect: Boolean,
  score: Number,
  completedAt: Date,
  createdAt: Date
}
```

---

## 8. API Contracts

### 8.1 Auth Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/api/auth/google` | Redirect to Google OAuth consent screen |
| GET | `/api/auth/google/callback` | Google OAuth callback; issues JWT cookie |
| POST | `/api/auth/logout` | Clear JWT cookie |
| GET | `/api/auth/me` | Get current user from JWT (protected) |

**GET /api/auth/google — Flow:**
1. Client redirects browser to `/api/auth/google`
2. Passport redirects to Google consent screen
3. Google redirects back to `/api/auth/google/callback`
4. Server upserts User in DB (by `googleId`), signs JWT, sets httpOnly cookie
5. Redirects client to `/dashboard`

**GET /api/auth/me — Response 200:**
```json
{ "id": "string", "username": "string", "email": "string", "avatar": "string" }
```

---

### 8.2 Mystery Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/mystery/generate` | Trigger AI mystery generation |
| GET | `/api/mystery/:id` | Get mystery (evidence visible; culprit hidden) |
| POST | `/api/mystery/:id/verdict` | Submit verdict + get result (protected) |
| GET | `/api/mystery/:id/status` | Poll generation status |
| GET | `/api/mystery/history` | Get user's past mysteries (protected) |

**POST /api/mystery/generate — Request Body:**
```json
{
  "prompt": "string (50-500 chars)",
  "genre": "Noir | Sci-Fi | Fantasy | Corporate | Historical",
  "difficulty": "easy | medium | hard"
}
```
**Response 202:** (async generation)
```json
{ "mysteryId": "string", "status": "generating", "pollUrl": "/api/mystery/:id/status" }
```

**GET /api/mystery/:id — Response 200:**
```json
{
  "title": "string",
  "caseBrief": "string",
  "timeline": [],
  "suspects": [{ "id": "", "name": "", "role": "", "age": 0, "photoUrl": "", "alibi": "" }],
  "evidence": [{ "id": "", "type": "", "title": "", "description": "", "mediaUrl": "", "chatData": [] }],
  "status": "ready"
}
```
> NOTE: `isCulprit`, `isRedHerring`, `culpritId`, `motive`, `explanation` are NEVER sent before verdict is submitted.

**POST /api/mystery/:id/verdict — Request Body:**
```json
{ "suspectId": "string" }
```
**Response 200:**
```json
{
  "isCorrect": true,
  "culpritId": "string",
  "culpritName": "string",
  "motive": "string",
  "explanation": "string",
  "score": 90
}
```

---

### 8.3 Session Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/api/session/:mysteryId` | Get or create session |
| PATCH | `/api/session/:mysteryId` | Update notes / pinned evidence |
| POST | `/api/session/:mysteryId/hint` | Request a hint (uses 1 token) |

---

## 9. Frontend Specification

### 9.1 Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Landing / Homepage | No |
| `/auth/login` | Login Page | No |
| `/auth/register` | Register Page | No |
| `/dashboard` | User Dashboard | Yes |
| `/new` | Story Input Page | No (guest OK) |
| `/case/:id/loading` | Generation Loading Screen | No |
| `/case/:id` | Investigation Room | No (guest OK) |
| `/case/:id/verdict` | Accusation Screen | No |
| `/case/:id/result` | Verdict Reveal Screen | No |
| `/history` | Case History | Yes |

### 9.2 Design System

**Color Palette (CSS Variables):**
```css
--color-bg-primary:     #0d0d0f;   /* Near black */
--color-bg-secondary:   #141418;   /* Dark surface */
--color-bg-card:        #1a1a20;   /* Card background */
--color-accent-red:     #c0392b;   /* Crime red */
--color-accent-amber:   #e67e22;   /* Warning / clue highlight */
--color-accent-gold:    #f1c40f;   /* Score / reveal */
--color-text-primary:   #e8e8ec;
--color-text-muted:     #6b6b7a;
--color-border:         #2a2a35;
--color-success:        #27ae60;
--color-error:          #e74c3c;
```

**Typography:**
```css
--font-display: 'Bebas Neue', sans-serif;    /* Headlines */
--font-body:    'Inter', sans-serif;          /* Body text */
--font-mono:    'JetBrains Mono', monospace;  /* Evidence text / chat */
```

**UI Aesthetic:** Dark, cinematic noir. Worn paper textures, red string boards, old polaroid-style evidence cards, CRT scanline overlays on video.

### 9.3 Key Components

| Component | Description |
|---|---|
| `StoryInputForm` | Textarea + genre/difficulty selectors + submit |
| `GeneratingLoader` | Animated "case file assembling" loader screen |
| `SuspectCard` | Portrait photo, name, role, alibi; clickable to expand |
| `EvidenceCard` | Base card for all evidence types |
| `ChatEvidence` | WhatsApp-style chat bubble renderer |
| `ImageEvidence` | Lightbox image with EXIF metadata |
| `VideoEvidence` | CCTV-styled video player |
| `DocumentEvidence` | Typed-document-style text card |
| `EvidenceLocker` | Tabbed container for all evidence |
| `DetectiveNotes` | Sticky note scratchpad component |
| `HintButton` | Triggers hint API; shows token count |
| `AccusationModal` | Suspect selector confirmation dialog |
| `VerdictReveal` | Cinematic reveal animation with case summary |
| `CaseBriefPanel` | Collapsible story summary sidebar |
| `TimelinePanel` | Vertical scrollable event timeline |

### 9.4 State Management (Context)

```
AuthContext       -> { user, login(), logout(), isAuthenticated }
MysteryContext    -> { mystery, session, loading, error, submitVerdict(), pinEvidence(), addNote() }
UIContext         -> { activeTab, lightboxItem, openLightbox(), closeModal() }
```

---

## 10. Backend Specification

### 10.1 Directory Structure (Server)
```
server/
|-- config/
|   +-- db.js              # MongoDB connection
|-- controllers/
|   |-- authController.js
|   |-- mysteryController.js
|   +-- sessionController.js
|-- middleware/
|   |-- authMiddleware.js  # JWT verify
|   +-- errorMiddleware.js
|-- models/
|   |-- User.js
|   |-- Mystery.js
|   +-- Session.js
|-- routes/
|   |-- auth.js
|   |-- mystery.js
|   +-- session.js
|-- services/
|   |-- aiService.js       # Gemini LLM calls
|   |-- imageService.js    # Imagen / Cloudinary
|   |-- videoService.js    # Veo / fallback
|   +-- mysteryBuilder.js  # Orchestrates full mystery generation
|-- utils/
|   |-- promptTemplates.js # All AI prompt strings
|   +-- responseFilter.js  # Strips culprit info before sending to client
|-- .env
|-- server.js
+-- package.json
```

### 10.2 Mystery Generation Pipeline (mysteryBuilder.js)

```
generateMystery(prompt, genre, difficulty)
  |
  |-- Step 1: callGemini(MYSTERY_PROMPT)      -> returns full JSON mystery skeleton
  |
  |-- Step 2: generateSuspectPhotos()
  |   +-- for each suspect: callImagen(photoPrompt) -> upload to Cloudinary -> save URL
  |
  |-- Step 3: generateChatEvidence()
  |   +-- for each chat evidence: callGemini(CHAT_PROMPT) -> parse JSON -> save to DB
  |
  |-- Step 4: generateImageEvidence()
  |   +-- for each image: callImagen(scenePrompt) -> upload to Cloudinary -> save URL
  |
  |-- Step 5: generateVideoEvidence()
  |   +-- callVeo(camPrompt) OR generate stub -> upload to Cloudinary -> save URL
  |
  +-- Step 6: saveMystery() -> update status to "ready" -> notify client via polling
```

### 10.3 Error Handling Strategy
- All async routes wrapped in `asyncHandler` wrapper.
- AI failures: retry once, then fallback to text-only evidence.
- Global error middleware returns consistent `{ "error": "string", "code": "string" }` JSON.

---

## 11. Security & Auth

| Concern | Implementation |
|---|---|
| Auth provider | Google OAuth 2.0 — no passwords stored in DB |
| Google ID storage | `googleId` field on User model (never exposed to client) |
| JWT secret | 256-bit random secret from env |
| Token storage | httpOnly + Secure + SameSite=Strict cookie |
| Token expiry | 7 days; refresh on activity |
| Culprit hiding | responseFilter.js strips isCulprit, culpritId, motive, explanation, isRedHerring from all GET responses |
| Rate limiting | express-rate-limit: 10 requests/min per IP on /generate |
| Input sanitization | express-validator on all input fields |
| CORS | Whitelist frontend origin only |
| Helmet.js | Secure HTTP headers |
| Env secrets | All API keys (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, etc.) in .env, never committed |

---

## 12. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Mystery generation time | < 30 seconds (P95) |
| Page load time | < 2 seconds |
| API response time (non-AI) | < 300ms |
| Mobile responsiveness | Full support (min 360px width) |
| Accessibility | WCAG 2.1 AA compliance |
| Browser support | Chrome 120+, Firefox 120+, Safari 17+ |
| Uptime | 99.5% (dev target) |
| Data retention | User data retained for 90 days of inactivity |

---

## 13. Folder Structure

```
AI_investigation_room/
|-- client/                        # React frontend (Vite)
|   |-- public/
|   |   +-- assets/                # Static assets, fonts, textures
|   +-- src/
|       |-- components/            # Reusable UI components
|       |   |-- evidence/          # ChatEvidence, ImageEvidence, VideoEvidence
|       |   |-- suspects/          # SuspectCard, SuspectBoard
|       |   |-- ui/                # Button, Modal, Tabs, Loader
|       |   +-- layout/            # Navbar, Sidebar
|       |-- contexts/              # AuthContext, MysteryContext, UIContext
|       |-- hooks/                 # useAuth, useMystery, useSession
|       |-- pages/                 # One file per route
|       |-- services/              # api.js (Axios instance + all API calls)
|       |-- styles/                # index.css, variables.css, components.css
|       +-- utils/                 # helpers, formatters
|
|-- server/                        # Express backend
|   +-- (see Section 10.1)
|
|-- spec.md                        # THIS FILE (Single Source of Truth)
+-- README.md
```

---

## 14. 1-Day Build Plan (Side Project Sprint)

> **Goal:** Ship a working end-to-end MVP in one sitting (~10 hrs).
> Scope cuts are intentional — nail the core loop first, polish later.

---

### Morning Block — 9:00 AM to 12:00 PM (3 hrs) — Setup + Backend Core

| Time | Task |
|---|---|
| 9:00 – 9:30 | Scaffold project: `client/` (Vite + React) + `server/` (Express), install all deps, connect MongoDB Atlas |
| 9:30 – 10:00 | Google OAuth setup (Passport.js, `passport-google-oauth20`, JWT cookie, `/api/auth/google` routes) |
| 10:00 – 11:00 | Gemini LLM integration — `aiService.js` + `promptTemplates.js`, test mystery JSON output in isolation |
| 11:00 – 12:00 | `POST /api/mystery/generate` — full pipeline: Gemini → parse JSON → save Mystery to MongoDB |

---

### Afternoon Block — 1:00 PM to 5:00 PM (4 hrs) — Frontend Core Loop

| Time | Task |
|---|---|
| 1:00 – 1:30 | Global CSS (variables, fonts, dark noir theme), Landing page + "Sign in with Google" button |
| 1:30 – 2:00 | Story Input page — textarea, genre/difficulty selectors, submit → hits generate API |
| 2:00 – 2:30 | Loading screen — poll `/api/mystery/:id/status` every 2s, animated loader |
| 2:30 – 3:30 | Investigation Room — Case Brief panel + Suspects Board + Evidence Locker (chat tab) |
| 3:30 – 4:00 | WhatsApp-style Chat Evidence component |
| 4:00 – 4:30 | Accusation screen — suspect selector + `POST /api/mystery/:id/verdict` |
| 4:30 – 5:00 | Verdict Reveal screen — correct/wrong state, culprit reveal, motive explanation |

---

### Evening Block — 5:00 PM to 8:00 PM (3 hrs) — Images + Polish + Deploy

| Time | Task |
|---|---|
| 5:00 – 5:45 | Gemini Imagen integration — 2 evidence images per mystery, upload to Cloudinary |
| 5:45 – 6:15 | Image Evidence lightbox component |
| 6:15 – 6:45 | UI polish — hover effects, transitions, mobile responsive pass |
| 6:45 – 7:30 | End-to-end test of full flow (generate → investigate → accuse → reveal) |
| 7:30 – 8:00 | Deploy: server → Render, client → Vercel, set all env vars, smoke test live URL |

---

### MVP Scope (must ship today)
- [ ] Google OAuth login
- [ ] Story input → Gemini mystery generation
- [ ] Suspects board + WhatsApp chat evidence
- [ ] 2 AI-generated image evidence per case
- [ ] Accusation screen → verdict reveal
- [ ] Live deployment (Render + Vercel)

### Deferred to V2 (not today)
- [ ] Video / cam footage evidence (Veo)
- [ ] Hint token system
- [ ] Detective notes scratchpad
- [ ] Case history page
- [ ] Scoring leaderboard
- [ ] Shareable result card
- [ ] Document evidence type


---

## 15. Open Questions & Decisions

| # | Question | Status | Decision |
|---|---|---|---|
| 1 | Use Veo for video or animated stub? | Open | TBD — depends on API access |
| 2 | Guest mode: save mystery to DB or session only? | Open | Likely session storage with 24h TTL |
| 3 | Should hints consume a global token pool or per-mystery? | Decided | Per-mystery: 3 hints per case |
| 4 | Real-time generation updates via polling or WebSocket? | Decided | Polling every 2s with status endpoint |
| 5 | Leaderboard in V1 or stretch goal? | Decided | Stretch goal (Phase 6+) |
| 6 | Share feature: static card image or dynamic URL? | Open | TBD |
| 7 | Profanity/content filter on user prompts? | Decided | Basic keyword filter + Gemini safety settings |
| 8 | Multi-language support? | Open | English only in V1 |

---

> NOTE: This is a living document. All changes to scope, data models, or API contracts must be reflected here BEFORE implementation begins.
