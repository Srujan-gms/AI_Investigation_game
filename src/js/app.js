import { appState } from './state.js';
import { api } from './api.js';
import { initAtmosphere } from './components/atmosphere.js';
import { initLightbox } from './components/lightbox.js';
import { fireConfetti } from './components/confetti.js';
import { setupAuth, signInWithGoogle, signOutUser, isLocalhost } from './auth.js';
import { mountCctvPlayer } from './components/cctvPlayer.js';

// Dom Elements
const appContainer = document.getElementById('app');
const navBrand = document.getElementById('nav-brand');
const navCasesBtn = document.getElementById('nav-cases-btn');
const navNewBtn = document.getElementById('nav-new-btn');
const navHintTokens = document.getElementById('nav-hint-tokens');
const notesDrawerBtn = document.getElementById('notes-drawer-btn');
const notesDrawerModal = document.getElementById('notes-drawer-modal');
const notesTextarea = document.getElementById('notes-textarea');
const notesCloseBtn = document.getElementById('notes-close-btn');

// Modal Elements
const accusationModal = document.getElementById('accusation-modal');
const accusationCloseBtn = document.getElementById('accusation-close-btn');
const accusationConfirmBtn = document.getElementById('accusation-confirm-btn');
const suspectPickGrid = document.getElementById('suspect-pick-grid');

let selectedSuspectId = null;

/**
 * Procedural SVG Noir Detective Avatar generator (Guaranteed instant offline fallback)
 */
export function generateNoirAvatarSvg(name, index = 0) {
  const cleanName = (name || 'Suspect').trim();
  const initials = cleanName
    .split(/\s+/)
    .filter(Boolean)
    .map(p => p[0].toUpperCase())
    .slice(0, 2)
    .join('') || 'SP';

  const palettes = [
    { bg1: '#0e1017', bg2: '#1b1e2b', accent: '#f59e0b', ring: '#d97706' },
    { bg1: '#11131a', bg2: '#222533', accent: '#ef4444', ring: '#dc2626' },
    { bg1: '#0d131a', bg2: '#182433', accent: '#06b6d4', ring: '#0891b2' },
    { bg1: '#141117', bg2: '#281e2b', accent: '#ec4899', ring: '#db2777' },
    { bg1: '#121415', bg2: '#212628', accent: '#10b981', ring: '#059669' }
  ];
  const p = palettes[Math.abs(index) % palettes.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="g${index}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${p.bg1}" />
        <stop offset="100%" stop-color="${p.bg2}" />
      </linearGradient>
      <pattern id="grid${index}" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
      </pattern>
    </defs>
    <rect width="400" height="400" fill="url(#g${index})" />
    <rect width="400" height="400" fill="url(#grid${index})" />
    <!-- Outer Reticle Rings -->
    <circle cx="200" cy="155" r="75" fill="none" stroke="${p.accent}" stroke-width="2" stroke-dasharray="6 4" opacity="0.6" />
    <circle cx="200" cy="155" r="62" fill="rgba(255,255,255,0.05)" stroke="${p.ring}" stroke-width="2" />
    <!-- Detective Fedora & Collar Silhouette -->
    <path d="M140 135 C150 115, 175 105, 200 105 C225 105, 250 115, 260 135 C240 130, 220 128, 200 128 C180 128, 160 130, 140 135 Z" fill="${p.accent}" opacity="0.75" />
    <path d="M125 140 C160 135, 240 135, 275 140 C285 142, 275 146, 255 148 C225 151, 175 151, 145 148 C125 146, 115 142, 125 140 Z" fill="${p.ring}" />
    <!-- Face Contour -->
    <path d="M170 148 C170 130, 230 130, 230 148 C230 180, 215 195, 200 195 C185 195, 170 180, 170 148 Z" fill="rgba(255,255,255,0.12)" />
    <!-- Trench Coat Shoulders -->
    <path d="M110 300 L140 220 L175 228 L200 240 L225 228 L260 220 L290 300 Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
    <!-- Badge Disc & Initials -->
    <circle cx="200" cy="158" r="38" fill="rgba(9,10,15,0.92)" stroke="${p.accent}" stroke-width="2" />
    <text x="200" y="166" font-family="'Inter', sans-serif" font-size="24" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">${initials}</text>
    <!-- Crosshairs -->
    <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1" />
    <line x1="200" y1="20" x2="200" y2="380" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="6 6" />
    <line x1="20" y1="200" x2="380" y2="200" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="6 6" />
    <!-- Tape / Evidence Label -->
    <rect x="40" y="325" width="320" height="38" rx="4" fill="rgba(0,0,0,0.85)" stroke="${p.accent}" stroke-width="1" />
    <text x="200" y="349" font-family="'JetBrains Mono', monospace" font-size="12" font-weight="700" fill="${p.accent}" text-anchor="middle" letter-spacing="2">DOSSIER // SUSPECT ARCHIVE</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Global safe error handler for broken or blocked external portrait URLs
window.handleSuspectImgError = function(imgEl, idx) {
  if (!imgEl) return;
  imgEl.onerror = null;
  const name = imgEl.getAttribute('data-name') || imgEl.alt || 'Suspect';
  imgEl.src = generateNoirAvatarSvg(name, idx || 0);
};

// Initialize Global UI Components
function initApp() {
  initAtmosphere();
  initLightbox();

  // Initialize Authentication & User Profile
  // On Localhost: Bypasses auth automatically as requested
  // On Vercel: Uses Google Firebase Auth with Guest Detective fallback
  setupAuth((user) => {
    if (user) {
      appState.setState({ user });
      updateNav();
    }
  });

  // Wire User Badge click to open Account Management
  const navUserBadge = document.getElementById('nav-user-badge');
  if (navUserBadge) {
    navUserBadge.addEventListener('click', () => navigateTo('account'));
  }

  // Wire Notes Drawer
  if (notesTextarea) {
    notesTextarea.value = appState.getState().notes;
    notesTextarea.addEventListener('input', (e) => {
      appState.setNotes(e.target.value);
      const state = appState.getState();
      if (state.mystery) {
        api.updateSession(state.mystery.id, { notes: e.target.value }).catch(() => {});
      }
    });
  }

  if (notesDrawerBtn) {
    notesDrawerBtn.addEventListener('click', () => {
      notesDrawerModal.classList.toggle('open');
    });
  }
  if (notesCloseBtn) {
    notesCloseBtn.addEventListener('click', () => {
      notesDrawerModal.classList.remove('open');
    });
  }

  // Accusation Modal Events
  if (accusationCloseBtn) {
    accusationCloseBtn.addEventListener('click', () => {
      accusationModal.classList.remove('open');
    });
  }

  if (accusationConfirmBtn) {
    accusationConfirmBtn.addEventListener('click', handleVerdictSubmit);
  }

  // Navigation Links
  if (navBrand) navBrand.addEventListener('click', () => navigateTo('landing'));
  if (navNewBtn) navNewBtn.addEventListener('click', () => navigateTo('new'));
  if (navCasesBtn) navCasesBtn.addEventListener('click', () => navigateTo('history'));

  // Subscribe to state changes
  appState.subscribe(renderCurrentPage);

  // Initial load
  navigateTo('landing');
}

function updateNav() {
  const state = appState.getState();
  if (navHintTokens) {
    navHintTokens.textContent = `${state.hintsRemaining} HINTS`;
  }
  const userBadge = document.getElementById('user-badge-name');
  if (userBadge && state.user) {
    userBadge.textContent = state.user.username;
  }
  const userAvatar = document.getElementById('nav-user-avatar');
  if (userAvatar && state.user && state.user.avatar) {
    userAvatar.src = state.user.avatar;
  }
  const statusDot = document.getElementById('nav-user-status-dot');
  if (statusDot && state.user) {
    statusDot.className = 'user-badge-status-dot ' + (state.user.isGuest ? 'guest' : 'localhost');
    statusDot.title = state.user.isLocalhost
      ? 'Localhost Clearance: Active (No auth required)'
      : (state.user.authProvider === 'google' ? 'Google Authenticated' : 'Guest Mode (Click to Sign In)');
  }
}

// Router
export function navigateTo(page, params = {}) {
  appState.setState({ activePage: page, ...params });
}

// Page Dispatcher
function renderCurrentPage(state) {
  updateNav();

  switch (state.activePage) {
    case 'landing':
      renderLandingPage(state);
      break;
    case 'new':
      renderNewCasePage(state);
      break;
    case 'loading':
      renderLoadingPage(state);
      break;
    case 'room':
      renderInvestigationRoom(state);
      break;
    case 'verdict':
      renderVerdictResult(state);
      break;
    case 'history':
      renderHistoryPage(state);
      break;
    case 'account':
      renderAccountPage(state);
      break;
    default:
      renderLandingPage(state);
  }
}

/* =========================================================
   1. LANDING PAGE
========================================================= */
function renderLandingPage(state) {
  appContainer.innerHTML = `
    <div class="page-view animate-fade-in">
      <div class="hero-section">
        <div class="hero-tag animate-slide-up">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/></svg>
          AI-Powered Forensic Mystery Engine
        </div>

        <h1 class="hero-title animate-slide-up">
          UNMASK THE <span>CULPRIT</span>.<br>SOLVE THE IMPOSSIBLE.
        </h1>

        <p class="hero-subtitle animate-slide-up">
          Step into a dark, procedurally orchestrated investigation room. Interrogate AI-generated suspects, inspect encrypted WhatsApp leaks, scrutinize CCTV security monitors, and crack cold murder cases.
        </p>

        <div class="hero-actions animate-slide-up">
          <button id="hero-start-default-btn" class="btn btn-primary" style="padding: 0.85rem 2rem; font-size: 1.05rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Enter Initial Crime Scene
          </button>
          <button id="hero-create-btn" class="btn btn-secondary" style="padding: 0.85rem 1.75rem; font-size: 1.05rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            Draft Custom Scenario
          </button>
        </div>

        <div class="feature-cards-grid animate-slide-up">
          <div class="feature-card">
            <div class="feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <h3>WhatsApp Leaks</h3>
            <p>Recovered encrypted message chains with realistic timestamps, typing patterns, and redacted secrets.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 6 4-6 4Z"/></svg>
            </div>
            <h3>CCTV Surveillance</h3>
            <p>Retro CRT scanline feeds with live ticking timecodes, sensor glitches, and corridor movements.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/></svg>
            </div>
            <h3>Fair Clues & Red Herrings</h3>
            <p>Meticulously planted forensic alibis, coroner toxicology findings, and planted diversion clues.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('hero-start-default-btn').addEventListener('click', () => {
    loadMysteryById('case_initial_finch');
  });

  document.getElementById('hero-create-btn').addEventListener('click', () => {
    navigateTo('new');
  });
}

/* =========================================================
   2. STORY INPUT PAGE
========================================================= */
function renderNewCasePage() {
  const PRESETS = [
    { label: "Gala Poisoning", genre: "Noir", prompt: "A renowned art appraiser was discovered poisoned at his mahogany desk during the annual gallery gala." },
    { label: "Cyberpunk Blackout", genre: "Sci-Fi", prompt: "The lead architect of an orbital quantum grid was flatlined in her pressurized Titan station laboratory." },
    { label: "Executive Penthouse", genre: "Corporate", prompt: "A venture capitalist was pushed from the 54th floor balcony hours before the hostile acquisition audit." },
    { label: "Grand Orient Sleeper", genre: "Historical", prompt: "A vintage Swiss watchmaker was found strangled with piano wire inside Compartment 8 of the overnight express." }
  ];

  let selectedGenre = 'Noir';
  let selectedDifficulty = 'medium';

  appContainer.innerHTML = `
    <div class="page-view animate-fade-in">
      <div class="case-creator-box">
        <span class="section-badge">// DRAFT INVESTIGATION SCENARIO</span>
        <h2 class="case-creator-title">Commission New Mystery</h2>
        <p class="case-creator-subtitle">Input a brief crime prompt or select a curated premise. The AI will weave suspects, evidence, and hidden motives.</p>

        <div class="input-group">
          <div class="input-label">
            <span>SCENARIO / CRIME PREMISE</span>
            <span class="input-counter" id="prompt-char-count">0 / 500</span>
          </div>
          <textarea id="scenario-input" class="scenario-textarea" placeholder="e.g., A reclusive collector was murdered inside his private library during an electrical storm. The safe was emptied, but the doors remained bolted from the inside..."></textarea>
          
          <div style="margin-top: 0.75rem;">
            <span style="font-size: 0.78rem; color: var(--color-text-muted); font-weight: 600;">QUICK INSPIRATION PRESETS:</span>
            <div class="presets-container" id="presets-container">
              ${PRESETS.map((p, idx) => `
                <div class="preset-chip" data-idx="${idx}">
                  ${p.label}
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div class="input-group">
          <div class="input-label">GENRE SETTING</div>
          <div class="tag-selector-row" id="genre-selector">
            ${['Noir', 'Sci-Fi', 'Corporate', 'Fantasy', 'Historical'].map(g => `
              <div class="tag-pill ${g === selectedGenre ? 'selected' : ''}" data-val="${g}">${g}</div>
            `).join('')}
          </div>
        </div>

        <div class="input-group">
          <div class="input-label">INVESTIGATION DIFFICULTY</div>
          <div class="tag-selector-row" id="difficulty-selector">
            <div class="tag-pill ${selectedDifficulty === 'easy' ? 'selected' : ''}" data-val="easy">Easy (3 Suspects)</div>
            <div class="tag-pill ${selectedDifficulty === 'medium' ? 'selected' : ''}" data-val="medium">Medium (4 Suspects)</div>
            <div class="tag-pill ${selectedDifficulty === 'hard' ? 'selected' : ''}" data-val="hard">Hard (5 Suspects & Red Herrings)</div>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
          <button id="cancel-new-btn" class="btn btn-secondary">Cancel</button>
          <button id="submit-mystery-btn" class="btn btn-primary" style="padding: 0.75rem 2rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
            Assemble Case File
          </button>
        </div>
      </div>
    </div>
  `;

  const textarea = document.getElementById('scenario-input');
  const counter = document.getElementById('prompt-char-count');

  textarea.addEventListener('input', () => {
    counter.textContent = `${textarea.value.length} / 500`;
  });

  // Presets click
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const p = PRESETS[chip.dataset.idx];
      textarea.value = p.prompt;
      counter.textContent = `${textarea.value.length} / 500`;
      selectedGenre = p.genre;
      updatePills('#genre-selector', selectedGenre);
    });
  });

  // Genre pills
  document.querySelectorAll('#genre-selector .tag-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      selectedGenre = pill.dataset.val;
      updatePills('#genre-selector', selectedGenre);
    });
  });

  // Difficulty pills
  document.querySelectorAll('#difficulty-selector .tag-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      selectedDifficulty = pill.dataset.val;
      updatePills('#difficulty-selector', selectedDifficulty);
    });
  });

  function updatePills(containerSelector, activeVal) {
    document.querySelectorAll(`${containerSelector} .tag-pill`).forEach(el => {
      el.classList.toggle('selected', el.dataset.val === activeVal);
    });
  }

  document.getElementById('cancel-new-btn').addEventListener('click', () => navigateTo('landing'));

  document.getElementById('submit-mystery-btn').addEventListener('click', async () => {
    const promptText = textarea.value.trim() || 'A reclusive collector was murdered inside his private library during an electrical storm.';
    
    navigateTo('loading');

    try {
      const res = await api.generateMystery(promptText, selectedGenre, selectedDifficulty);
      const pollId = res.mysteryId;

      // Poll until ready
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await api.pollStatus(pollId);
          if (statusRes.status === 'ready') {
            clearInterval(pollInterval);
            loadMysteryById(pollId);
          }
        } catch (err) {
          clearInterval(pollInterval);
          console.error('Polling error', err);
        }
      }, 1500);
    } catch (err) {
      alert('Generation error: ' + err.message);
      navigateTo('new');
    }
  });
}

/* =========================================================
   3. LOADING SCREEN
========================================================= */
function renderLoadingPage() {
  appContainer.innerHTML = `
    <div class="page-view animate-fade-in">
      <div class="loading-dossier-box">
        <div class="radar-spinner-wrap">
          <div class="radar-spinner"></div>
          <div class="radar-scanner-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
        </div>

        <h2 style="font-family: var(--font-display); font-size: 2.2rem; margin-bottom: 0.5rem; letter-spacing: 0.05em;">
          COMPILING EVIDENCE DOSSIER
        </h2>
        <p style="color: var(--color-text-secondary); font-size: 0.95rem;">
          The AI crime engine is orchestrating suspects, encrypted transcripts, and forensic timelines...
        </p>

        <div class="terminal-logs-window" id="terminal-logs">
          <div class="log-line done">✔ Prompt contextual analysis validated</div>
          <div class="log-line done">✔ Suspect personas & conflicting alibis constructed</div>
          <div class="log-line active">⟳ Synthesizing WhatsApp exports & surveillance camera frames...</div>
        </div>
      </div>
    </div>
  `;
}

/* =========================================================
   4. INVESTIGATION ROOM
========================================================= */
export async function loadMysteryById(id) {
  try {
    const mystery = await api.getMystery(id);
    const session = await api.getSession(id);
    
    appState.setState({
      mystery,
      session,
      hintsRemaining: 3 - (session.hintsUsed || 0),
      notes: session.notes || ''
    });

    navigateTo('room');
  } catch (err) {
    alert('Failed to load investigation room: ' + err.message);
  }
}

function renderInvestigationRoom(state) {
  const mystery = state.mystery;
  if (!mystery) {
    navigateTo('landing');
    return;
  }

  appContainer.innerHTML = `
    <div class="page-view animate-fade-in">
      <!-- Case Header -->
      <div class="case-room-header">
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem;">
            <span class="case-badge-genre">${mystery.genre}</span>
            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-accent-amber); font-weight: 700;">
              CASE #${mystery.id.slice(-6).toUpperCase()}
            </span>
          </div>
          <h1 class="case-room-title">${mystery.title}</h1>
          <div class="case-room-meta">
            <span>Difficulty: <strong style="color: #fff; text-transform: capitalize;">${mystery.difficulty}</strong></span>
            <span>•</span>
            <span>Suspects: <strong style="color: #fff;">${mystery.suspects.length}</strong></span>
            <span>•</span>
            <span>Evidence Items: <strong style="color: #fff;">${mystery.evidence.length}</strong></span>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <button id="room-hint-btn" class="btn btn-secondary btn-sm" title="Request an AI Hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            Request Hint (${state.hintsRemaining} left)
          </button>
          <button id="room-accuse-btn" class="btn btn-primary" style="padding: 0.65rem 1.4rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            File Accusation
          </button>
        </div>
      </div>

      <!-- Case Brief Panel -->
      <div class="case-brief-card">
        <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem;">Incident Summary & Lead Detective Briefing</h3>
        <p class="case-brief-text">${mystery.caseBrief}</p>
      </div>

      <!-- Suspects Board -->
      <div class="section-headline">
        <h2>Suspects Board (${mystery.suspects.length})</h2>
        <span style="font-size: 0.82rem; color: var(--color-text-muted);">Pin suspects or review statements</span>
      </div>

      <div class="suspects-grid" id="suspects-grid">
        ${mystery.suspects.map((suspect, idx) => renderSuspectCard(suspect, state, idx)).join('')}
      </div>

      <!-- Evidence Locker -->
      <div class="section-headline">
        <h2>Evidence Locker (${mystery.evidence.length})</h2>
        <span style="font-size: 0.82rem; color: var(--color-text-muted);">Recovered chat logs, CCTV captures, and autopsy findings</span>
      </div>

      <div class="evidence-locker-container">
        <div class="evidence-tabs-bar" id="evidence-tabs">
          <button class="evidence-tab-btn ${state.activeEvidenceTab === 'all' ? 'active' : ''}" data-tab="all">
            All Evidence <span class="evidence-tab-badge">${mystery.evidence.length}</span>
          </button>
          <button class="evidence-tab-btn ${state.activeEvidenceTab === 'chat' ? 'active' : ''}" data-tab="chat">
            Chats <span class="evidence-tab-badge">${mystery.evidence.filter(e=>e.type==='chat').length}</span>
          </button>
          <button class="evidence-tab-btn ${state.activeEvidenceTab === 'image' ? 'active' : ''}" data-tab="image">
            Crime Stills <span class="evidence-tab-badge">${mystery.evidence.filter(e=>e.type==='image').length}</span>
          </button>
          <button class="evidence-tab-btn ${state.activeEvidenceTab === 'video' ? 'active' : ''}" data-tab="video">
            CCTV Feeds <span class="evidence-tab-badge">${mystery.evidence.filter(e=>e.type==='video').length}</span>
          </button>
          <button class="evidence-tab-btn ${state.activeEvidenceTab === 'document' ? 'active' : ''}" data-tab="document">
            Documents <span class="evidence-tab-badge">${mystery.evidence.filter(e=>e.type==='document').length}</span>
          </button>
        </div>

        <div class="evidence-grid" id="evidence-items-grid">
          ${renderFilteredEvidence(mystery.evidence, state.activeEvidenceTab, state)}
        </div>
      </div>

      <!-- Timeline Section -->
      <div class="section-headline">
        <h2>Chronological Crime Timeline</h2>
        <span style="font-size: 0.82rem; color: var(--color-text-muted);">Cross-reference alibis against recorded timestamps</span>
      </div>

      <div class="timeline-section">
        <div class="timeline-list">
          ${mystery.timeline.map(item => `
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-time">${item.time}</div>
              <div class="timeline-event">${item.event}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Wire Tab Buttons
  document.querySelectorAll('#evidence-tabs .evidence-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      appState.setState({ activeEvidenceTab: btn.dataset.tab });
      document.querySelectorAll('#evidence-tabs .evidence-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('evidence-items-grid').innerHTML = renderFilteredEvidence(
        mystery.evidence,
        btn.dataset.tab,
        appState.getState()
      );
      wireEvidenceInteractions();
    });
  });

  // Wire Hint Button
  document.getElementById('room-hint-btn').addEventListener('click', async () => {
    if (state.hintsRemaining <= 0) {
      alert('You have exhausted all 3 hint tokens for this investigation.');
      return;
    }
    try {
      const res = await api.getHint(mystery.id);
      appState.setState({ hintsRemaining: res.remainingTokens });
      alert(`🕵️ DETECTIVE HINT:\n\n${res.hint}`);
      updateNav();
    } catch (err) {
      alert('Could not generate hint: ' + err.message);
    }
  });

  // Wire Accusation Button
  document.getElementById('room-accuse-btn').addEventListener('click', () => {
    openAccusationModal(mystery.suspects);
  });

  wireEvidenceInteractions();
}

function renderSuspectCard(suspect, state, idx = 0) {
  const isPinned = state.pinnedEvidence.has(suspect.id);
  const fallbackSvg = generateNoirAvatarSvg(suspect.name, idx);
  const photoSrc = (suspect.photoUrl && typeof suspect.photoUrl === 'string' && suspect.photoUrl.startsWith('http'))
    ? suspect.photoUrl
    : fallbackSvg;
  const safeName = (suspect.name || 'Suspect').replace(/"/g, '&quot;');
  const suspectNum = idx + 1;

  return `
    <div class="suspect-card animate-slide-up" id="card-${suspect.id}">
      <div class="suspect-photo-wrap">
        <img 
          src="${photoSrc}" 
          alt="${safeName}" 
          data-name="${safeName}"
          class="suspect-photo" 
          referrerpolicy="no-referrer"
          loading="lazy"
          onerror="window.handleSuspectImgError(this, ${idx})"
        />
        <span class="suspect-tape-badge">SUSPECT #${suspectNum}</span>
        <button class="suspect-pin-btn ${isPinned ? 'pinned' : ''}" data-id="${suspect.id}" title="Pin clue">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
        </button>
      </div>
      <div class="suspect-body">
        <h3 class="suspect-name">${suspect.name} (${suspect.age || 'Unknown'})</h3>
        <div class="suspect-role">${suspect.role}</div>
        <div class="suspect-alibi-box">
          <strong style="color: #fff;">Stated Alibi:</strong> ${suspect.alibi || 'No sworn alibi filed.'}
        </div>
        <p style="font-size: 0.82rem; color: var(--color-text-secondary); margin-bottom: 1rem; line-height: 1.5;">
          ${suspect.backstory || ''}
        </p>
        <div class="suspect-actions">
          <button class="btn btn-secondary btn-sm suspect-accuse-quick-btn" data-id="${suspect.id}" style="width: 100%;">
            Interrogate / Accuse
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderFilteredEvidence(evidenceList, tab, state) {
  const filtered = tab === 'all' ? evidenceList : evidenceList.filter(e => e.type === tab);
  if (filtered.length === 0) {
    return `<div style="grid-column: 1/-1; padding: 2rem; text-align: center; color: var(--color-text-muted);">No evidence files under this category.</div>`;
  }
  return filtered.map(item => renderEvidenceItem(item, state)).join('');
}

function renderEvidenceItem(item) {
  let contentHtml = '';

  if (item.type === 'chat') {
    contentHtml = `
      <div class="chat-window">
        ${item.chatData.map(msg => `
          <div class="chat-bubble ${msg.sender.includes('Victim') ? 'received' : 'sent'}">
            <div class="chat-sender-name">${msg.sender}</div>
            <div>
              ${msg.isRedacted ? `<span class="redacted-text" title="Click to reveal encrypted text">${msg.message}</span>` : msg.message}
            </div>
            <div class="chat-timestamp">${msg.timestamp} ✓✓</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (item.type === 'image') {
    const mediaSrc = (item.mediaUrl && typeof item.mediaUrl === 'string' && item.mediaUrl.startsWith('http'))
      ? item.mediaUrl
      : "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80";
    contentHtml = `
      <div class="forensic-photo-box" onclick="window.openLightbox('${mediaSrc}', '${(item.title || 'Evidence').replace(/'/g, "\\'")}', '${item.exif ? (item.exif.notes || '').replace(/'/g, "\\'") : ''}')">
        <img src="${mediaSrc}" alt="${item.title}" class="forensic-photo" referrerpolicy="no-referrer" loading="lazy" />
      </div>
      ${item.exif ? `
        <div class="exif-tag-row">
          <span class="exif-pill">📷 ${item.exif.camera || 'Forensic Unit'}</span>
          <span class="exif-pill">⏱ ${item.exif.timestamp || '23:00 HRS'}</span>
          <span class="exif-pill">📍 ${item.exif.location || 'Crime Scene'}</span>
        </div>
      ` : ''}
    `;
  } else if (item.type === 'video') {
    contentHtml = `
      <div class="cctv-mount-slot" id="cctv-slot-${item.id}"></div>
    `;
  } else if (item.type === 'document') {
    contentHtml = `
      <div class="doc-evidence-paper">
        <div class="doc-stamp">CONFIDENTIAL</div>
        ${item.documentText}
      </div>
    `;
  }

  return `
    <div class="evidence-card animate-slide-up">
      <div class="evidence-card-header">
        <span class="evidence-type-pill">// ${item.type}</span>
        <button class="suspect-pin-btn" data-id="${item.id}" title="Pin clue">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
        </button>
      </div>
      <div class="evidence-card-body">
        <h4 class="evidence-title">${item.title}</h4>
        <p class="evidence-desc">${item.description}</p>
        ${contentHtml}
      </div>
    </div>
  `;
}

function wireEvidenceInteractions() {
  // Mount interactive forensic CCTV players
  const state = appState.getState();
  document.querySelectorAll('.cctv-mount-slot').forEach(slot => {
    const evId = slot.id.replace('cctv-slot-', '');
    const evItem = (state.mystery && state.mystery.evidence)
      ? state.mystery.evidence.find(e => e.id === evId)
      : null;
    mountCctvPlayer(slot, evItem || {}, state.mystery);
  });

  // Pin Clues
  document.querySelectorAll('.suspect-pin-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      appState.togglePin(id);
      btn.classList.toggle('pinned');
    });
  });

  // Redacted text reveal on click
  document.querySelectorAll('.redacted-text').forEach(el => {
    el.addEventListener('click', () => {
      el.classList.add('revealed');
    });
  });

  // Quick accuse
  document.querySelectorAll('.suspect-accuse-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const state = appState.getState();
      if (state.mystery) {
        openAccusationModal(state.mystery.suspects, btn.dataset.id);
      }
    });
  });
}

/* =========================================================
   5. ACCUSATION MODAL
========================================================= */
function openAccusationModal(suspects, preselectId = null) {
  selectedSuspectId = preselectId || suspects[0].id;

  suspectPickGrid.innerHTML = suspects.map((s, idx) => {
    const fallbackSvg = generateNoirAvatarSvg(s.name, idx);
    const photoSrc = (s.photoUrl && typeof s.photoUrl === 'string' && s.photoUrl.startsWith('http')) ? s.photoUrl : fallbackSvg;
    const safeName = (s.name || 'Suspect').replace(/"/g, '&quot;');
    return `
      <div class="suspect-pick-card ${s.id === selectedSuspectId ? 'selected' : ''}" data-id="${s.id}">
        <img 
          src="${photoSrc}" 
          alt="${safeName}" 
          data-name="${safeName}"
          class="suspect-pick-avatar" 
          referrerpolicy="no-referrer"
          onerror="window.handleSuspectImgError(this, ${idx})"
        />
        <div class="suspect-pick-name">${s.name}</div>
        <div style="font-size: 0.72rem; color: var(--color-accent-red); margin-top: 0.2rem;">${(s.role || '').split('&')[0]}</div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.suspect-pick-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedSuspectId = card.dataset.id;
      document.querySelectorAll('.suspect-pick-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });

  accusationModal.classList.add('open');
}

async function handleVerdictSubmit() {
  const state = appState.getState();
  if (!state.mystery || !selectedSuspectId) return;

  accusationModal.classList.remove('open');
  navigateTo('loading');

  try {
    const result = await api.submitVerdict(state.mystery.id, selectedSuspectId);
    appState.setState({ verdictResult: result });
    navigateTo('verdict');
    if (result.isCorrect) {
      fireConfetti();
    }
  } catch (err) {
    alert('Verdict submission error: ' + err.message);
    navigateTo('room');
  }
}

/* =========================================================
   6. VERDICT REVEAL SCREEN
========================================================= */
function renderVerdictResult(state) {
  const res = state.verdictResult;
  if (!res) {
    navigateTo('landing');
    return;
  }

  const culpritPhotoSrc = (res.culpritPhoto && typeof res.culpritPhoto === 'string' && res.culpritPhoto.startsWith('http'))
    ? res.culpritPhoto
    : generateNoirAvatarSvg(res.culpritName || 'Perpetrator', 0);
  const safeCulpritName = (res.culpritName || 'Perpetrator').replace(/"/g, '&quot;');

  appContainer.innerHTML = `
    <div class="page-view animate-fade-in">
      <div class="verdict-reveal-box">
        <div class="stamp-badge ${res.isCorrect ? 'solved' : ''}">
          ${res.isCorrect ? 'CASE SOLVED: GUILTY' : 'WRONG ACCUSATION'}
        </div>

        <div>
          <div class="verdict-score-pill">
            🏆 FINAL SCORE: ${res.score} PTS ${res.hintsUsed > 0 ? `(${res.hintsUsed} hints used)` : '(Flawless Deduction)'}
          </div>
        </div>

        <div class="culprit-unmasked-card">
          <img 
            src="${culpritPhotoSrc}" 
            alt="${safeCulpritName}" 
            data-name="${safeCulpritName}"
            class="culprit-unmasked-photo" 
            referrerpolicy="no-referrer"
            onerror="window.handleSuspectImgError(this, 0)"
          />
          <div>
            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-accent-amber); font-weight: 700;">
              IDENTIFIED PERPETRATOR
            </span>
            <h2 style="font-size: 1.8rem; margin: 0.2rem 0;">${res.culpritName}</h2>
            <div style="color: var(--color-accent-red); font-weight: 600; font-size: 0.9rem;">${res.culpritRole}</div>
          </div>
        </div>

        <div class="motive-debrief-box">
          <h4>// ESTABLISHED MOTIVE</h4>
          <p style="color: #fff; font-size: 0.95rem; line-height: 1.6;">${res.motive}</p>
        </div>

        <div style="background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.5rem; text-align: left; margin-bottom: 2.5rem;">
          <h4 style="font-family: var(--font-mono); color: var(--color-accent-amber); font-size: 0.85rem; margin-bottom: 0.75rem;">
            // FORENSIC EXPLANATION & RED HERRING RESOLUTION
          </h4>
          <div class="explanation-text">${res.explanation}</div>
        </div>

        <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
          <button id="verdict-replay-btn" class="btn btn-secondary">
            Review Case Evidence
          </button>
          <button id="verdict-new-btn" class="btn btn-primary" style="padding: 0.75rem 2rem;">
            Investigate Next Mystery
          </button>
          <button id="verdict-history-btn" class="btn btn-secondary">
            View Case History
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('verdict-replay-btn').addEventListener('click', () => navigateTo('room'));
  document.getElementById('verdict-new-btn').addEventListener('click', () => navigateTo('new'));
  document.getElementById('verdict-history-btn').addEventListener('click', () => navigateTo('history'));
}

/* =========================================================
   7. CASE HISTORY PAGE
========================================================= */
async function renderHistoryPage() {
  appContainer.innerHTML = `
    <div class="page-view animate-fade-in">
      <div class="section-headline">
        <h1>Case Archive & Solved Records</h1>
        <button id="history-new-case-btn" class="btn btn-primary btn-sm">
          + New Investigation
        </button>
      </div>

      <div id="history-list-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
        <div style="color: var(--color-text-muted);">Loading case dossiers...</div>
      </div>
    </div>
  `;

  document.getElementById('history-new-case-btn').addEventListener('click', () => navigateTo('new'));

  try {
    const res = await api.getHistory();
    const grid = document.getElementById('history-list-grid');

    if (!res.cases || res.cases.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; padding: 2rem; color: var(--color-text-muted);">No recorded investigations yet.</div>`;
      return;
    }

    grid.innerHTML = res.cases.map(c => `
      <div class="feature-card" style="display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span class="case-badge-genre">${c.genre}</span>
          <span style="font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; color: ${c.isSolved ? 'var(--color-success)' : 'var(--color-accent-amber)'};">
            ${c.isSolved ? 'SOLVED (' + c.score + ' PTS)' : 'UNDER INVESTIGATION'}
          </span>
        </div>
        <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${c.title}</h3>
        <p style="color: var(--color-text-secondary); font-size: 0.85rem; margin-bottom: 1.25rem; flex: 1;">${c.caseBrief}</p>
        <button class="btn btn-secondary btn-sm history-open-btn" data-id="${c.id}" style="width: 100%;">
          Reopen Investigation Room
        </button>
      </div>
    `).join('');

    document.querySelectorAll('.history-open-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        loadMysteryById(btn.dataset.id);
      });
    });
  } catch (err) {
    document.getElementById('history-list-grid').innerHTML = `<div style="color: var(--color-error);">Failed to load history: ${err.message}</div>`;
  }
}

/* =========================================================
   8. ACCOUNT MANAGEMENT & DETECTIVE CREDENTIALS PAGE
========================================================= */
function renderAccountPage(state) {
  const user = state.user || {};
  const isLocal = isLocalhost();
  const isGoogle = user.authProvider === 'google';

  appContainer.innerHTML = `
    <div class="page-view animate-fade-in">
      <div class="account-page-container">
        <!-- Top Navigation Row -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <button class="btn btn-secondary" id="account-back-btn" style="padding: 0.45rem 1rem; font-size: 0.85rem;">
            ← Return to ${state.mystery ? 'Active Case' : 'Dashboard'}
          </button>
          <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-text-muted);">
            BUREAU DOSSIER // DEPT ARCHIVES
          </span>
        </div>

        <!-- Official Detective Identification Card -->
        <div class="account-dossier-card animate-slide-up">
          <div class="account-header-row">
            <div class="account-avatar-container">
              <img 
                src="${user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}" 
                alt="Avatar" 
                class="account-avatar-img"
                onerror="window.handleSuspectImgError(this, 0)" 
              />
              <div class="account-avatar-badge">${user.badgeId || 'DET-LOCAL'}</div>
            </div>

            <div class="account-meta-col">
              <h1 class="account-detective-title">${user.username || 'Detective Vance'}</h1>
              <div class="account-email-tag">
                ${user.email || 'detective.vance@agency.noir'}
              </div>
              <div class="account-rank-pill">
                ⭐ ${user.rank || 'Senior Homicide Investigator'}
              </div>
            </div>
          </div>

          <!-- Environment & Authentication Status Banner -->
          ${isLocal ? `
            <div class="env-status-banner localhost">
              <div>
                <strong>🟢 Localhost Mode:</strong> Authentication is completely bypassed for local development. Full investigative tools, mystery generator, and archives are unlocked.
              </div>
            </div>
          ` : (isGoogle ? `
            <div class="env-status-banner verified">
              <div>
                <strong>🔵 Google Account Verified:</strong> Signed in as <code>${user.email}</code>. Your solved mystery records and detective scores are preserved.
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-account-logout" style="padding: 0.35rem 0.85rem;">Sign Out</button>
            </div>
          ` : `
            <div class="env-status-banner guest">
              <div>
                <strong>🟡 Guest Investigator:</strong> You are playing in guest session mode on Vercel. Sign in with Google to permanently track your solved cases across devices.
              </div>
              <button class="btn-google-auth" id="btn-account-google-login">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                Sign In with Google
              </button>
            </div>
          `)}

          <!-- Google Actions Strip -->
          <div class="account-auth-actions">
            ${(!isGoogle && !isLocal) ? `
              <button class="btn-google-auth" id="btn-dossier-google-login">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                Sign In with Google
              </button>
            ` : ''}

            ${isGoogle ? `
              <button class="btn btn-secondary" id="btn-dossier-signout" style="padding: 0.6rem 1.25rem;">
                Sign Out of Detective Account
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Career Statistics -->
        <div class="account-stats-grid">
          <div class="account-stat-box">
            <div class="stat-number" style="color: var(--color-accent-amber);">${(user.solvedCases || []).length}</div>
            <div class="stat-label-text">CASES SOLVED</div>
          </div>
          <div class="account-stat-box">
            <div class="stat-number" style="color: #22c55e;">${(user.solvedCases || []).length > 0 ? '100%' : '0%'}</div>
            <div class="stat-label-text">CONVICTION ACCURACY</div>
          </div>
          <div class="account-stat-box">
            <div class="stat-number" style="color: #3b82f6;">${(user.solvedCases || []).length * 90}</div>
            <div class="stat-label-text">MERIT SCORE</div>
          </div>
          <div class="account-stat-box">
            <div class="stat-number" style="color: var(--color-accent-red);">${state.hintsRemaining}</div>
            <div class="stat-label-text">HINT TOKENS</div>
          </div>
        </div>
      </div>
    </div>
  `;

  wireAccountEvents();
}

function wireAccountEvents() {
  const backBtn = document.getElementById('account-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      const state = appState.getState();
      navigateTo(state.mystery ? 'room' : 'landing');
    });
  }

  // Google Sign-In buttons
  const handleGoogleLogin = async () => {
    try {
      const res = await signInWithGoogle();
      if (res && res.user) {
        const user = {
          uid: res.user.uid,
          username: res.user.displayName || res.user.email.split('@')[0],
          email: res.user.email,
          avatar: res.user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          badgeId: 'DET-' + res.user.uid.slice(0, 6).toUpperCase(),
          rank: 'Verified Inspector',
          isLocalhost: false,
          isGuest: false,
          authProvider: 'google',
          solvedCases: []
        };
        appState.setState({ user });
        updateNav();
        renderAccountPage(appState.getState());
      } else if (res && res.message) {
        alert(res.message);
      }
    } catch (err) {
      alert('Google Sign-In failed: ' + err.message);
    }
  };

  const loginBtn1 = document.getElementById('btn-account-google-login');
  if (loginBtn1) loginBtn1.addEventListener('click', handleGoogleLogin);

  const loginBtn2 = document.getElementById('btn-dossier-google-login');
  if (loginBtn2) loginBtn2.addEventListener('click', handleGoogleLogin);

  // Sign out buttons
  const handleSignOut = async () => {
    await signOutUser();
    const guestUser = {
      uid: 'guest_detective_' + Math.random().toString(36).substring(2, 8),
      username: 'Guest Detective',
      email: 'guest@mysteryroom.app',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      badgeId: 'DET-GUEST',
      rank: 'Guest Investigator',
      isLocalhost: false,
      isGuest: true,
      authProvider: 'guest',
      solvedCases: []
    };
    appState.setState({ user: guestUser });
    updateNav();
    renderAccountPage(appState.getState());
  };

  const logoutBtn1 = document.getElementById('btn-account-logout');
  if (logoutBtn1) logoutBtn1.addEventListener('click', handleSignOut);

  const logoutBtn2 = document.getElementById('btn-dossier-signout');
  if (logoutBtn2) logoutBtn2.addEventListener('click', handleSignOut);
}

// Start Application on DOM Ready
window.addEventListener('DOMContentLoaded', initApp);
