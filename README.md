# 🕵️ AI Mystery Room — Interactive Noir Detective Experience

> A cinematic, AI-powered web experience where users submit a murder mystery prompt and step into an interactive investigation room. Inspect fake WhatsApp message leaks, analyze forensic crime scene photos, watch CCTV surveillance video feeds, cross-examine suspects, and identify the true culprit!

Built in accordance with [spec.md](spec.md).

---

## 🚀 Quick Start (Instant Run)

The server and frontend run out of the box with zero external dependencies required:

```bash
# From the project root:
cd server
npm start
# or run directly:
node server.js
```

Open your browser at:
👉 **[http://localhost:5001](http://localhost:5001)**

---

## 🎨 Design Theme & Aesthetics

- **Sleek Noir Minimalism**: Deep obsidian palette (`#09090c`), subtle crimson accents (`#e11d48`), amber caution highlights (`#f59e0b`), and detective gold (`#fbbf24`).
- **Typography**: Display headlines in `Bebas Neue`, body in `Inter`, and evidence logs in `JetBrains Mono`.
- **Atmospheric Animations**:
  - Ambient dust mote particles on background canvas
  - WhatsApp chat bubble staggered reveal with click-to-unblur redacted secrets
  - CCTV surveillance monitor with CRT scanlines, flicker, and ticking 24-hr timecode
  - Accusation interrogation modal with suspenseful focus dimming
  - Dramatic "CASE SOLVED: GUILTY" stamp impact animation and celebratory canvas confetti burst

---

## 🧩 Key Features

1. **AI Mystery Generation Pipeline**:
   - Free-text scenario input (50-500 characters) with 4 quick inspiration presets
   - 5 Genre Settings: **Noir**, **Sci-Fi**, **Corporate**, **Fantasy**, **Historical**
   - 3 Difficulty Levels: **Easy** (3 suspects), **Medium** (4 suspects), **Hard** (5 suspects with intricate red herrings)
   - Real **Google Gemini API** integration with automatic fallback to high-fidelity **Procedural Noir Engine**

2. **Investigation Workstation**:
   - **Case Brief Dossier**: Incident summary and preliminary findings
   - **Suspects Board**: Portrait photos, roles, alibi cards, backstories, and pin toggles
   - **Evidence Locker**:
     - 💬 **WhatsApp Chats**: Encrypted exports with timestamps, read receipts, and clickable redacted secrets
     - 📷 **Forensic Photos**: Crime scene stills with camera EXIF data and zoomable Lightbox
     - 📹 **CCTV Feeds**: Surveillance camera replay with live running timecode and sensor logs
     - 📑 **Coroner Reports**: Medical examiner toxicology findings with confidential stamp
   - ⏱ **Timeline**: Chronological event logs to cross-reference against alibis
   - 📝 **Detective Notes**: Sticky notepad with auto-save to localStorage & server
   - 💡 **AI Hint Tokens**: 3 progressive hints per case that subtly nudge towards discrepancies

3. **Accusation & Verdict Reveal**:
   - Interrogation modal to indict the prime suspect
   - Real-time forensic evaluation: +100 base score minus 10 per hint used
   - Complete unmasking debrief: culprit motive revealed, evidence tied together, and planted red herrings debunked
   - Case archive and history replay

---

## 🔐 Configuration (`server/.env`)

To use your own Google Gemini API key:

```env
PORT=5001
GEMINI_API_KEY=your_gemini_api_key_here
```

*Note: If no API key is provided, the application runs seamlessly using its built-in Procedural AI Engine.*

---

## 📁 Project Structure

```
AI_investigation_room/
|-- index.html                 # Root frontend SPA entrypoint
|-- spec.md                    # Single Source of Truth specification
|-- progress.md                # Development tracking log
|-- README.md                  # Documentation and quick start
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
    |-- server.js              # Node.js HTTP REST API & static server
    |-- config/db.js           # Database & session storage
    |-- services/
    |   +-- aiService.js       # Gemini API client & Procedural Noir Engine
    |-- utils/
    |   |-- promptTemplates.js # AI prompts
    |   +-- responseFilter.js  # Security filter stripping culprit data before verdict
    +-- .env
```
