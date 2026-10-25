# 🕵️ AI Mystery Room — Interactive Noir Detective Experience

> A cinematic, AI-powered web experience where users submit a murder mystery prompt and step into an interactive investigation room. Inspect encrypted WhatsApp leaks, examine forensic crime scene photos, watch CCTV surveillance video feeds, cross-examine suspects, and identify the true culprit!

Built in accordance with [spec.md](spec.md).

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?style=flat&logo=vercel)](https://vercel.com)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%202.0-blue?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ⚡ Quick Start (Run Locally)

The application runs instantly with zero external dependencies required:

```bash
# 1. Clone the repository
git clone https://github.com/Srujan-gms/AI_Inverstigation_game.git
cd AI_Inverstigation_game

# 2. Start the server
node server/server.js
```

Open your browser at:  
👉 **`http://localhost:5001`**

---

## ☁️ Deploy to Vercel (1-Click Ready)

The project is pre-configured with a serverless architecture (`vercel.json` + `api/index.js`) for seamless Vercel hosting.

### Method 1: Via Vercel Web Dashboard (Recommended)

1. Fork or push this repository to your GitHub account: `https://github.com/Srujan-gms/AI_Inverstigation_game`.
2. Go to [vercel.com](https://vercel.com) and click **"Add New..."** → **"Project"**.
3. Import the `AI_Inverstigation_game` repository.
4. In the **Environment Variables** section, add your secret key:
   * **Key:** `GEMINI_API_KEY`
   * **Value:** *(Your Gemini API key)*
5. Click **Deploy** — your mystery room will be live globally!

### Method 2: Via Vercel CLI

```bash
# Deploy to preview
npx vercel

# Add the secret key safely to your project
npx vercel env add GEMINI_API_KEY production

# Deploy to production
npx vercel --prod
```

---

## 🔐 API Security & Secrets Protection

* **Zero Client-Side Leakage**: The `GEMINI_API_KEY` is **never** sent to the client browser. All AI calls run exclusively inside the backend serverless function (`server/services/aiService.js`).
* **Git Protection**: The `.gitignore` file strictly prevents `.env`, `*.env`, and secrets from being committed or pushed to public repositories.
* **Encrypted Cloud Environment**: On Vercel, API keys are stored in encrypted environment variables and injected only at runtime.

---

## 🎨 Design Theme & Aesthetics

* **Sleek Noir Minimalism**: Deep obsidian palette (`#09090c`), glassmorphic headers, sharp border contrasts (`#23232f`), with crimson (`#e11d48`), amber (`#f59e0b`), and detective gold (`#fbbf24`) accents.
* **Modern Typography**: Display headlines in `Bebas Neue`, body in `Inter`, and evidence logs in `JetBrains Mono`.
* **Atmospheric Micro-Animations**:
  * **Ambient Particle Canvas**: Subtle floating dust motes drifting across the crime scene.
  * **WhatsApp Chat Evidence**: Realistic dark mode bubbles with staggered entry, timestamps, read receipts, and interactive **click-to-unblur** redacted messages.
  * **CCTV Security Monitor**: Retro CRT scanlines, live ticking milliseconds timecode, REC indicator pulse, and sensor interference.
  * **Forensic Lightbox**: Click-to-zoom evidence inspector with camera EXIF metadata.
  * **Interrogation Accusation Modal**: Spotlight focus with suspect selection grid.
  * **Dramatic Verdict Reveal**: Screen pulse, animated **`CASE SOLVED: GUILTY`** stamp impact, canvas confetti particle explosion, unmasked perpetrator card, and full forensic debrief.

---

## 🧩 Key Features

### 1. AI Mystery Generation Pipeline
* **Prompt Flexibility**: Free-text scenario input (50–500 characters) with 4 quick inspiration presets.
* **5 Unique Genre Settings**:
  * **Noir**: Art deco speakeasies, private eyes, femme fatales, and corrupt aldermen.
  * **Sci-Fi**: Titan habitat modules, synthetic intelligences, neural matrix divers, and orbital marshals.
  * **Corporate**: 54th-floor penthouses, hostile takeovers, whistleblowers, and dark pool algorithms.
  * **Fantasy**: Celestial observatories, high astromancers, shadow spymasters, and royal alchemists.
  * **Historical**: 1920s sleeper trains, Scotland Yard inspectors, exiled tsarist diplomats, and jewel smugglers.
* **Dynamic Difficulty Scaling**:
  * **Easy**: 3 suspects
  * **Medium**: 4 suspects
  * **Hard**: 5 suspects with intricate red herrings
* **Hybrid AI Engine**: Real **Google Gemini 2.0 Flash** integration with automatic fallback to our built-in **Procedural Noir Engine** when offline or without an API key.

### 2. Investigation Workstation
* **Case Brief Dossier**: Incident summary and preliminary medical examiner findings.
* **Suspects Board**: Portrait photos, roles, alibi cards, backstories, and pin toggles.
* **Evidence Locker**:
  * 💬 **WhatsApp Chats**: Encrypted exports with timestamps, read receipts, and clickable redacted secrets.
  * 📷 **Forensic Photos**: Crime scene stills with camera EXIF data and zoomable Lightbox.
  * 📹 **CCTV Feeds**: Surveillance camera replay with live running timecode and sensor logs.
  * 📑 **Coroner Reports**: Medical examiner toxicology findings with confidential stamp.
* ⏱ **Chronological Timeline**: Cross-reference suspect alibis against recorded event times.
* 📝 **Detective Notes Scratchpad**: Floating drawer with instant auto-save to localStorage & server.
* 💡 **AI Hint Tokens**: 3 progressive hints per case that subtly nudge toward timeline discrepancies.

### 3. Accusation & Verdict Reveal
* Interrogation modal to indict the prime suspect.
* Real-time forensic evaluation: +100 base score minus 10 per hint used.
* Complete unmasking debrief: culprit motive revealed, evidence tied together, and planted red herrings debunked.
* Case archive and history replay.

---

## 📁 Project Architecture

```
AI_investigation_room/
|-- index.html                 # Root frontend SPA entrypoint
|-- vercel.json                # Vercel serverless routing configuration
|-- .gitignore                 # Secrets & environment isolation
|-- spec.md                    # Single Source of Truth specification
|-- progress.md                # Development tracking log
|-- README.md                  # Documentation and quick start
|-- api/
|   +-- index.js               # Vercel Serverless Function entrypoint
|-- src/
|   |-- css/
|   |   |-- variables.css      # Noir minimalism color tokens & typography
|   |   |-- animations.css     # Keyframes (stamp impact, scanlines, spring physics)
|   |   +-- style.css          # Core UI styling & responsive layouts
|   |-- js/
|       |-- api.js             # REST API client
|       |-- state.js           # Central reactive state manager
|       |-- app.js             # Router & UI view orchestrator
|       +-- components/
|           |-- atmosphere.js  # Noir ambient particle canvas
|           |-- confetti.js    # Celebratory victory confetti
|           +-- lightbox.js    # Forensic photo inspection modal
+-- server/
    |-- server.js              # Local Node.js HTTP server
    |-- handler.js             # Unified API request handler (Local + Vercel)
    |-- config/db.js           # Database & session storage
    |-- services/
    |   +-- aiService.js       # Gemini 2.0 API & Procedural Multi-Genre Engine
    |-- utils/
    |   |-- promptTemplates.js # AI prompts
    |   +-- responseFilter.js  # Security filter stripping culprit data before verdict
    +-- .env.example           # Environment template
```

---

## ⚙️ Environment Variables

Create a `server/.env` file for local development:

```env
PORT=5001
GEMINI_API_KEY=your_gemini_api_key_here
```

*(When deployed to Vercel, set `GEMINI_API_KEY` in **Vercel Project Settings → Environment Variables**).*
