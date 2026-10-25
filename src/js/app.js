import { appState } from './state.js';
import { api } from './api.js';
import { initAtmosphere } from './components/atmosphere.js';
import { initLightbox } from './components/lightbox.js';
import { fireConfetti } from './components/confetti.js';

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
let cctvInterval = null;

// Initialize Global UI Components
function initApp() {
  initAtmosphere();
  initLightbox();

  // Load User Profile
  api.getMe().then(res => {
    if (res && res.user) {
      appState.setState({ user: res.user });
      updateNav();
    }
  }).catch(() => {});

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

  if (cctvInterval) clearInterval(cctvInterval);

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
        ${mystery.suspects.map(suspect => renderSuspectCard(suspect, state)).join('')}
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

  // Start CCTV running clock
  startCctvClock();

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

function renderSuspectCard(suspect, state) {
  const isPinned = state.pinnedEvidence.has(suspect.id);
  return `
    <div class="suspect-card animate-slide-up" id="card-${suspect.id}">
      <div class="suspect-photo-wrap">
        <img src="${suspect.photoUrl}" alt="${suspect.name}" class="suspect-photo" />
        <span class="suspect-tape-badge">SUSPECT #${suspect.id.split('-')[1] || '1'}</span>
        <button class="suspect-pin-btn ${isPinned ? 'pinned' : ''}" data-id="${suspect.id}" title="Pin clue">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
        </button>
      </div>
      <div class="suspect-body">
        <h3 class="suspect-name">${suspect.name} (${suspect.age})</h3>
        <div class="suspect-role">${suspect.role}</div>
        <div class="suspect-alibi-box">
          <strong style="color: #fff;">Stated Alibi:</strong> ${suspect.alibi}
        </div>
        <p style="font-size: 0.82rem; color: var(--color-text-secondary); margin-bottom: 1rem; line-height: 1.5;">
          ${suspect.backstory}
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
    contentHtml = `
      <div class="forensic-photo-box" onclick="window.openLightbox('${item.mediaUrl}', '${item.title}', '${item.exif ? item.exif.notes || '' : ''}')">
        <img src="${item.mediaUrl}" alt="${item.title}" class="forensic-photo" />
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
      <div class="cctv-monitor-box">
        <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80" class="cctv-screen" alt="CCTV feed" />
        <div class="cctv-overlay-scanline"></div>
        <div class="cctv-live-tag">
          <div class="cctv-rec-dot"></div>
          ${item.cameraLabel || 'CAM 04 - CORRIDOR'}
        </div>
        <div class="cctv-timecode" id="cctv-running-time">10:18:44 PM</div>
      </div>
      <p style="font-size: 0.82rem; color: var(--color-text-secondary); margin-top: 0.75rem; line-height: 1.5;">
        ${item.footageDescription || 'Security log recorded anomalous frame static.'}
      </p>
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

function startCctvClock() {
  cctvInterval = setInterval(() => {
    const el = document.getElementById('cctv-running-time');
    if (!el) return;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + Math.floor(now.getMilliseconds() / 100);
    el.textContent = 'REC ' + timeStr;
  }, 200);
}

/* =========================================================
   5. ACCUSATION MODAL
========================================================= */
function openAccusationModal(suspects, preselectId = null) {
  selectedSuspectId = preselectId || suspects[0].id;

  suspectPickGrid.innerHTML = suspects.map(s => `
    <div class="suspect-pick-card ${s.id === selectedSuspectId ? 'selected' : ''}" data-id="${s.id}">
      <img src="${s.photoUrl}" alt="${s.name}" class="suspect-pick-avatar" />
      <div class="suspect-pick-name">${s.name}</div>
      <div style="font-size: 0.72rem; color: var(--color-accent-red); margin-top: 0.2rem;">${s.role.split('&')[0]}</div>
    </div>
  `).join('');

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
          <img src="${res.culpritPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}" alt="${res.culpritName}" class="culprit-unmasked-photo" />
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

// Start Application on DOM Ready
window.addEventListener('DOMContentLoaded', initApp);
