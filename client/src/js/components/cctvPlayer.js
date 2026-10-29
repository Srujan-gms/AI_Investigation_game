/**
 * High-Fidelity Forensic CCTV Surveillance Monitor Engine
 * Features:
 * - Real-time CRT scanlines, lens curvature, static noise & rolling distortion
 * - Multiple switchable camera angles (Corridor, Study Vault, Fire Escape)
 * - Forensic vision modes (B&W Noir, IR Night Vision, Thermal Heatmap)
 * - Interactive timeline scrubbing & playback controls (Play, Pause, 0.5x Slow-Mo, 2x)
 * - Dynamic silhouette motion tracking with forensic bounding reticle
 * - Keyframe anomaly detection synchronized with the crime timeline
 */

let cctvState = {
  isPlaying: true,
  currentTimePercent: 42, // Default near the anomaly event
  playbackSpeed: 1.0,
  activeCamera: 0, // 0: Main Corridor, 1: Vault Entrance, 2: Fire Escape
  visionMode: 'noir', // 'noir' | 'ir' | 'thermal'
  targetMystery: null,
  animationFrameId: null,
  lastFrameTime: performance.now()
};

const CAMERAS = [
  {
    id: 'cam-01',
    label: 'CAM 01 // MAIN NORTH PASSAGE',
    location: 'Primary Access Hallway - Floor 2',
    anomalyStart: 38,
    anomalyEnd: 62,
    anomalyTimestamp: '10:18:44 PM',
    description: 'Figure in heavy dark coat and leather gloves moves rapidly toward the study.'
  },
  {
    id: 'cam-02',
    label: 'CAM 02 // STUDY VAULT ENTRY',
    location: 'Private Study & Antechamber',
    anomalyStart: 48,
    anomalyEnd: 72,
    anomalyTimestamp: '10:22:15 PM',
    description: 'Door latch disengaged. Gloved hand manipulates brass study entrance lock.'
  },
  {
    id: 'cam-03',
    label: 'CAM 03 // SERVICE FIRE ESCAPE',
    location: 'Exterior Rear Alleyway Stairwell',
    anomalyStart: 60,
    anomalyEnd: 85,
    anomalyTimestamp: '10:29:50 PM',
    description: 'Subject flees down metal fire escape into the rain, concealing an object.'
  }
];

/**
 * Mount the CCTV player into a container element
 */
export function mountCctvPlayer(container, mysteryEvidenceItem, mystery) {
  if (!container) return;

  cctvState.targetMystery = mystery;
  cctvState.isPlaying = true;
  cctvState.currentTimePercent = 45; // Place player right at anomaly for immediate satisfaction

  const initialCam = CAMERAS[cctvState.activeCamera];

  container.innerHTML = `
    <div class="cctv-forensic-system">
      <!-- CCTV Top Command Header -->
      <div class="cctv-header-bar">
        <div class="cctv-brand-col">
          <div class="cctv-rec-pill">
            <span class="cctv-rec-blink">●</span> REC
          </div>
          <span class="cctv-sys-label">SEC-FEED // DEPT FORENSICS v4.8</span>
        </div>

        <!-- Camera Switcher -->
        <div class="cctv-cam-selector">
          ${CAMERAS.map((cam, idx) => `
            <button class="cctv-cam-btn ${idx === cctvState.activeCamera ? 'active' : ''}" data-cam="${idx}">
              ${cam.id.toUpperCase()}
            </button>
          `).join('')}
        </div>

        <!-- Vision Mode Toggles -->
        <div class="cctv-vision-modes">
          <button class="cctv-mode-btn ${cctvState.visionMode === 'noir' ? 'active' : ''}" data-mode="noir" title="Grayscale Noir Surveillance">B&W</button>
          <button class="cctv-mode-btn ${cctvState.visionMode === 'ir' ? 'active' : ''}" data-mode="ir" title="Infrared Night Vision">IR NIGHT</button>
          <button class="cctv-mode-btn ${cctvState.visionMode === 'thermal' ? 'active' : ''}" data-mode="thermal" title="Thermal Heatmap Signature">THERMAL</button>
        </div>
      </div>

      <!-- Main CRT Screen Monitor -->
      <div class="cctv-screen-frame">
        <canvas id="cctv-canvas" class="cctv-display-canvas" width="760" height="428"></canvas>
        <div class="cctv-crt-scanlines"></div>
        <div class="cctv-crt-glass-glare"></div>

        <!-- Live HUD Overlays -->
        <div class="cctv-hud-top-left">
          <div class="hud-mono-bold" id="cctv-hud-cam-title">${initialCam.label}</div>
          <div class="hud-mono-sub">${initialCam.location}</div>
        </div>

        <div class="cctv-hud-top-right">
          <div class="hud-fps-tag">15.0 FPS // 1080p B/W</div>
          <div class="hud-mono-bold" id="cctv-hud-timestamp">OCT 24 22:18:44.20</div>
        </div>

        <!-- Target Lock Reticle (Appears when figure is in frame) -->
        <div id="cctv-target-reticle" class="cctv-target-reticle" style="display: none;">
          <div class="reticle-box">
            <div class="reticle-corner tl"></div>
            <div class="reticle-corner tr"></div>
            <div class="reticle-corner bl"></div>
            <div class="reticle-corner br"></div>
            <div class="reticle-data">
              <span class="reticle-alert">⚠️ MOTION DETECTED</span>
              <span class="reticle-info">SUBJECT: UNIDENTIFIED</span>
              <span class="reticle-conf">MATCH CONFIDENCE: 94.6%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Scrubber & Playback Controls Bar -->
      <div class="cctv-controls-strip">
        <div class="cctv-playback-btns">
          <button class="cctv-ctrl-btn" id="cctv-play-btn" title="Play / Pause">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
          <button class="cctv-ctrl-btn" id="cctv-back-btn" title="Rewind 5 seconds">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/></svg>
          </button>
          <button class="cctv-ctrl-btn" id="cctv-fwd-btn" title="Forward 5 seconds">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>
          </button>
        </div>

        <!-- Interactive Progress Slider -->
        <div class="cctv-timeline-wrapper">
          <input type="range" class="cctv-seek-bar" id="cctv-seek-bar" min="0" max="100" step="0.2" value="45" />
          <div class="cctv-timeline-markers">
            <span class="timeline-bound">10:10 PM</span>
            <button class="cctv-anomaly-pill" id="cctv-jump-anomaly-btn" title="Jump directly to suspicious movement">
              <span style="color:#ef4444;">⚡</span> KEYFRAME ANOMALY (${initialCam.anomalyTimestamp})
            </button>
            <span class="timeline-bound">10:35 PM</span>
          </div>
        </div>

        <!-- Speed & Snapshot Controls -->
        <div class="cctv-action-btns">
          <button class="cctv-ctrl-btn speed-btn" id="cctv-speed-btn" title="Playback Speed">1.0x</button>
          <button class="cctv-ctrl-btn capture-btn" id="cctv-capture-btn" title="Capture Forensic Evidence Still">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            CAPTURE
          </button>
        </div>
      </div>

      <!-- Forensic Debrief Info -->
      <div class="cctv-intel-card">
        <div class="intel-tag">FORENSIC SECURITY ANALYSIS</div>
        <div class="intel-text" id="cctv-intel-desc">
          ${mysteryEvidenceItem.footageDescription || initialCam.description}
        </div>
        <div class="intel-subtext">
          💡 <strong>Detective Tip:</strong> Notice the timestamp where the figure appears (${initialCam.anomalyTimestamp}). Cross-reference this directly with each suspect's stated alibi!
        </div>
      </div>
    </div>
  `;

  // Start Canvas Render Loop
  initCctvCanvas();

  // Attach Event Listeners
  attachCctvEvents(container);
}

/**
 * Attach UI event handlers for the CCTV player
 */
function attachCctvEvents(container) {
  const playBtn = container.querySelector('#cctv-play-btn');
  const backBtn = container.querySelector('#cctv-back-btn');
  const fwdBtn = container.querySelector('#cctv-fwd-btn');
  const seekBar = container.querySelector('#cctv-seek-bar');
  const speedBtn = container.querySelector('#cctv-speed-btn');
  const jumpBtn = container.querySelector('#cctv-jump-anomaly-btn');
  const captureBtn = container.querySelector('#cctv-capture-btn');

  // Play / Pause
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      cctvState.isPlaying = !cctvState.isPlaying;
      updatePlayBtnIcon(playBtn);
    });
  }

  // Skip Back / Forward
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      cctvState.currentTimePercent = Math.max(0, cctvState.currentTimePercent - 8);
      if (seekBar) seekBar.value = cctvState.currentTimePercent;
    });
  }

  if (fwdBtn) {
    fwdBtn.addEventListener('click', () => {
      cctvState.currentTimePercent = Math.min(100, cctvState.currentTimePercent + 8);
      if (seekBar) seekBar.value = cctvState.currentTimePercent;
    });
  }

  // Seek Bar
  if (seekBar) {
    seekBar.addEventListener('input', (e) => {
      cctvState.currentTimePercent = parseFloat(e.target.value);
    });
  }

  // Jump to Anomaly
  if (jumpBtn) {
    jumpBtn.addEventListener('click', () => {
      const cam = CAMERAS[cctvState.activeCamera];
      cctvState.currentTimePercent = (cam.anomalyStart + cam.anomalyEnd) / 2;
      if (seekBar) seekBar.value = cctvState.currentTimePercent;
      cctvState.isPlaying = false;
      updatePlayBtnIcon(playBtn);
    });
  }

  // Speed Toggle (0.5x -> 1.0x -> 2.0x)
  if (speedBtn) {
    speedBtn.addEventListener('click', () => {
      if (cctvState.playbackSpeed === 1.0) cctvState.playbackSpeed = 2.0;
      else if (cctvState.playbackSpeed === 2.0) cctvState.playbackSpeed = 0.5;
      else cctvState.playbackSpeed = 1.0;
      speedBtn.textContent = `${cctvState.playbackSpeed}x`;
    });
  }

  // Camera Selector
  container.querySelectorAll('.cctv-cam-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.cctv-cam-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const camIdx = parseInt(btn.dataset.cam, 10);
      cctvState.activeCamera = camIdx;
      const cam = CAMERAS[camIdx];

      const hudTitle = container.querySelector('#cctv-hud-cam-title');
      const hudSub = container.querySelector('.hud-mono-sub');
      const jumpText = container.querySelector('#cctv-jump-anomaly-btn');
      const intelDesc = container.querySelector('#cctv-intel-desc');

      if (hudTitle) hudTitle.textContent = cam.label;
      if (hudSub) hudSub.textContent = cam.location;
      if (jumpText) jumpText.innerHTML = `<span style="color:#ef4444;">⚡</span> KEYFRAME ANOMALY (${cam.anomalyTimestamp})`;
      if (intelDesc) intelDesc.textContent = cam.description;
    });
  });

  // Vision Mode Selector
  container.querySelectorAll('.cctv-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.cctv-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cctvState.visionMode = btn.dataset.mode;
    });
  });

  // Capture Still Snapshot
  if (captureBtn) {
    captureBtn.addEventListener('click', () => {
      const canvas = container.querySelector('#cctv-canvas');
      if (!canvas) return;
      const stillDataUrl = canvas.toDataURL('image/jpeg', 0.85);

      // Flash effect on screen
      const glare = container.querySelector('.cctv-crt-glass-glare');
      if (glare) {
        glare.style.background = 'rgba(255, 255, 255, 0.45)';
        setTimeout(() => { glare.style.background = ''; }, 120);
      }

      // Visual feedback
      captureBtn.textContent = 'SAVED ✓';
      setTimeout(() => {
        captureBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> CAPTURE`;
      }, 1500);

      // Open in lightbox for inspection
      const lightboxModal = document.getElementById('lightbox-modal');
      const lightboxImg = document.getElementById('lightbox-img');
      const lightboxCap = document.getElementById('lightbox-caption');
      if (lightboxModal && lightboxImg && lightboxCap) {
        lightboxImg.src = stillDataUrl;
        lightboxCap.innerHTML = `
          <strong>FORENSIC CAPTURE // ${CAMERAS[cctvState.activeCamera].label}</strong><br>
          Recorded Timestamp: ${CAMERAS[cctvState.activeCamera].anomalyTimestamp} | Mode: ${cctvState.visionMode.toUpperCase()}<br>
          <span style="color: #ef4444; font-size: 0.82rem;">Suspect movement confirmed in primary sector.</span>
        `;
        lightboxModal.classList.add('open');
      }
    });
  }
}

function updatePlayBtnIcon(btn) {
  if (!btn) return;
  if (cctvState.isPlaying) {
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
  } else {
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
  }
}

/**
 * Canvas Render Engine: 15 FPS authentic surveillance camera simulation
 */
function initCctvCanvas() {
  if (cctvState.animationFrameId) {
    cancelAnimationFrame(cctvState.animationFrameId);
  }

  const canvas = document.getElementById('cctv-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let lastTimecodeSec = 0;

  function render(now) {
    const delta = (now - cctvState.lastFrameTime) / 1000;
    cctvState.lastFrameTime = now;

    // Advance playback if playing
    if (cctvState.isPlaying) {
      cctvState.currentTimePercent += (delta * 3.2 * cctvState.playbackSpeed);
      if (cctvState.currentTimePercent > 100) {
        cctvState.currentTimePercent = 0; // Loop recording
      }
      const seekBar = document.getElementById('cctv-seek-bar');
      if (seekBar) seekBar.value = cctvState.currentTimePercent;
    }

    const t = cctvState.currentTimePercent; // 0 to 100
    const cam = CAMERAS[cctvState.activeCamera];

    // Compute dynamic timestamp synchronized with crime timeline
    // 10:10:00 PM (t=0) to 10:35:00 PM (t=100)
    const baseMinutes = 10 + (t * 0.25);
    const m = Math.floor(baseMinutes);
    const s = Math.floor((baseMinutes - m) * 60);
    const ms = Math.floor((now % 1000) / 10);
    const timeStr = `OCT 24 22:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}.${ms < 10 ? '0' + ms : ms}`;

    const timestampEl = document.getElementById('cctv-hud-timestamp');
    if (timestampEl) timestampEl.textContent = timeStr;

    // Clear Canvas
    ctx.fillStyle = '#060709';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render Scene Perspective based on Active Camera
    drawCameraScene(ctx, canvas, cctvState.activeCamera, cctvState.visionMode);

    // Draw Silhouette if in anomaly window
    const inAnomaly = (t >= cam.anomalyStart && t <= cam.anomalyEnd);
    const reticleEl = document.getElementById('cctv-target-reticle');

    if (inAnomaly) {
      const progress = (t - cam.anomalyStart) / (cam.anomalyEnd - cam.anomalyStart);
      drawSuspectSilhouette(ctx, canvas, progress, cctvState.activeCamera, cctvState.visionMode);

      if (reticleEl) {
        reticleEl.style.display = 'block';
        // Position reticle over figure
        const screenX = (0.2 + progress * 0.6) * 100;
        reticleEl.style.left = `${screenX}%`;
        reticleEl.style.top = `38%`;
      }
    } else {
      if (reticleEl) reticleEl.style.display = 'none';
    }

    // Apply Vintage CRT Static & Noise Overlay
    applyCCTVNoise(ctx, canvas, cctvState.visionMode, now);

    cctvState.animationFrameId = requestAnimationFrame(render);
  }

  cctvState.animationFrameId = requestAnimationFrame(render);
}

/**
 * Draw 3D-perspective corridor / scene geometry
 */
function drawCameraScene(ctx, canvas, camIdx, mode) {
  const w = canvas.width;
  const h = canvas.height;

  // Palette based on Vision Mode
  let colFloor, colWall, colCeil, colLine, colGlow;

  if (mode === 'ir') {
    colFloor = '#0a1a0f';
    colWall = '#041008';
    colCeil = '#06160b';
    colLine = 'rgba(74, 222, 128, 0.25)';
    colGlow = 'rgba(74, 222, 128, 0.12)';
  } else if (mode === 'thermal') {
    colFloor = '#180728';
    colWall = '#25083a';
    colCeil = '#0f041a';
    colLine = 'rgba(236, 72, 153, 0.3)';
    colGlow = 'rgba(249, 115, 22, 0.18)';
  } else {
    // Classic B&W Noir
    colFloor = '#121417';
    colWall = '#090a0d';
    colCeil = '#0c0d10';
    colLine = 'rgba(255, 255, 255, 0.15)';
    colGlow = 'rgba(255, 255, 255, 0.08)';
  }

  if (camIdx === 0) {
    // CAM 01: Long Perspective Corridor
    const vanishingX = w * 0.5;
    const vanishingY = h * 0.42;

    // Floor
    ctx.fillStyle = colFloor;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w, h);
    ctx.lineTo(vanishingX + 70, vanishingY + 50);
    ctx.lineTo(vanishingX - 70, vanishingY + 50);
    ctx.closePath();
    ctx.fill();

    // Ceiling
    ctx.fillStyle = colCeil;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, 0);
    ctx.lineTo(vanishingX + 70, vanishingY - 30);
    ctx.lineTo(vanishingX - 70, vanishingY - 30);
    ctx.closePath();
    ctx.fill();

    // End Wall / Door
    ctx.fillStyle = colWall;
    ctx.fillRect(vanishingX - 70, vanishingY - 30, 140, 80);

    // Perspective floor tiles lines
    ctx.strokeStyle = colLine;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo(vanishingX, vanishingY + 50);
      ctx.lineTo((w / 6) * i, h);
      ctx.stroke();
    }

    // Doorway at end
    ctx.strokeStyle = colLine;
    ctx.strokeRect(vanishingX - 25, vanishingY - 15, 50, 65);

    // Wall sconce lights casting cones
    ctx.fillStyle = colGlow;
    ctx.beginPath();
    ctx.arc(w * 0.18, h * 0.35, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.82, h * 0.35, 45, 0, Math.PI * 2);
    ctx.fill();

  } else if (camIdx === 1) {
    // CAM 02: Study Vault Entrance
    ctx.fillStyle = colWall;
    ctx.fillRect(0, 0, w, h);

    // Floor
    ctx.fillStyle = colFloor;
    ctx.fillRect(0, h * 0.72, w, h * 0.28);

    // Large Heavy Mahogany Double Doors
    ctx.strokeStyle = colLine;
    ctx.lineWidth = 2;
    ctx.strokeRect(w * 0.3, h * 0.15, w * 0.4, h * 0.57);
    ctx.strokeRect(w * 0.3 + 6, h * 0.15 + 6, (w * 0.4) / 2 - 8, h * 0.57 - 12);
    ctx.strokeRect(w * 0.5 + 2, h * 0.15 + 6, (w * 0.4) / 2 - 8, h * 0.57 - 12);

    // Brass Lockset Highlight
    ctx.fillStyle = mode === 'ir' ? '#22c55e' : (mode === 'thermal' ? '#f59e0b' : '#d4af37');
    ctx.fillRect(w * 0.48, h * 0.44, 10, 18);

    // Study Nameplate
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(w * 0.4, h * 0.08, w * 0.2, 22);

  } else {
    // CAM 03: Service Fire Escape (Rainy exterior)
    ctx.fillStyle = colWall;
    ctx.fillRect(0, 0, w, h);

    // Exterior brick pattern lines
    ctx.strokeStyle = colLine;
    ctx.lineWidth = 1;
    for (let y = 30; y < h; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w * 0.65, y);
      ctx.stroke();
    }

    // Metal Fire Escape Diagonal Stairs
    ctx.strokeStyle = colLine;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.35, 0);
    ctx.lineTo(w * 0.85, h);
    ctx.stroke();

    // Railing rungs
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 10; i++) {
      const stepX = w * 0.35 + (i * (w * 0.5) / 10);
      const stepY = (i * h / 10);
      ctx.strokeRect(stepX - 25, stepY, 50, 4);
    }
  }
}

/**
 * Render Suspect Silhouette with realistic motion and trenchcoat contour
 */
function drawSuspectSilhouette(ctx, canvas, progress, camIdx, mode) {
  const w = canvas.width;
  const h = canvas.height;

  // Determine silhouette coordinates based on camera and progress (0 to 1)
  let posX, posY, scale;

  if (camIdx === 0) {
    // Moving from deep end of corridor toward foreground
    scale = 0.65 + (progress * 0.7); // Grows larger as it approaches
    posX = (w * 0.45) + ((progress - 0.5) * w * 0.35);
    posY = (h * 0.48) + (progress * h * 0.25);
  } else if (camIdx === 1) {
    // Moving across vault door, pausing at lock
    scale = 1.15;
    posX = w * 0.25 + (progress * w * 0.45);
    posY = h * 0.68;
  } else {
    // Descending fire escape
    scale = 0.95;
    posX = w * 0.4 + (progress * w * 0.35);
    posY = h * 0.25 + (progress * h * 0.45);
  }

  ctx.save();
  ctx.translate(posX, posY);
  ctx.scale(scale, scale);

  // Silhouette color based on vision mode
  if (mode === 'thermal') {
    // False color heat body (core hot yellow/red, extremities purple)
    const heatGrad = ctx.createRadialGradient(0, -60, 10, 0, -50, 80);
    heatGrad.addColorStop(0, '#fef08a'); // 37C Core Heat
    heatGrad.addColorStop(0.3, '#f97316'); // Orange
    heatGrad.addColorStop(0.7, '#ec4899'); // Magenta
    heatGrad.addColorStop(1, '#3b0764'); // Cold Purple edge
    ctx.fillStyle = heatGrad;
  } else if (mode === 'ir') {
    ctx.fillStyle = '#0f2915'; // Dark thermal block
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 12;
  } else {
    // Deep Noir Silhouette
    ctx.fillStyle = '#050608';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 16;
  }

  // Draw Figure: Fedora Hat, Coat, Collar, Walking Stride
  ctx.beginPath();
  // Hat Brim
  ctx.ellipse(0, -95, 26, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Hat Crown
  ctx.fillRect(-14, -115, 28, 20);

  // Head / Collar
  ctx.beginPath();
  ctx.arc(0, -80, 12, 0, Math.PI * 2);
  ctx.fill();

  // Trenchcoat Shoulders & Body
  ctx.beginPath();
  ctx.moveTo(-28, -65);
  ctx.lineTo(28, -65);
  ctx.lineTo(34, 15);
  ctx.lineTo(-34, 15);
  ctx.closePath();
  ctx.fill();

  // Legs / Walking animation based on progress
  const legSwing = Math.sin(progress * 28) * 12;
  ctx.lineWidth = 9;
  ctx.strokeStyle = ctx.fillStyle;
  // Left leg
  ctx.beginPath();
  ctx.moveTo(-12, 12);
  ctx.lineTo(-12 + legSwing, 60);
  ctx.stroke();
  // Right leg
  ctx.beginPath();
  ctx.moveTo(12, 12);
  ctx.lineTo(12 - legSwing, 60);
  ctx.stroke();

  // Gloved Hand reaching forward
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(22, -35);
  ctx.lineTo(38 + Math.cos(progress * 15) * 6, -20);
  ctx.stroke();

  ctx.restore();
}

/**
 * Apply Authentic CRT static, noise scanlines and rolling bar interference
 */
function applyCCTVNoise(ctx, canvas, mode, now) {
  const w = canvas.width;
  const h = canvas.height;

  // 1. Subtle Horizontal Rolling Tracking Bar
  const rollY = (now * 0.12) % h;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.fillRect(0, rollY, w, 24);

  // 2. Dynamic Random Noise Specks (Grain)
  ctx.fillStyle = mode === 'ir' ? 'rgba(74, 222, 128, 0.06)' : 'rgba(255, 255, 255, 0.06)';
  for (let i = 0; i < 90; i++) {
    const rx = Math.random() * w;
    const ry = Math.random() * h;
    ctx.fillRect(rx, ry, Math.random() * 2 + 1, 1);
  }

  // 3. Vignette & CRT edge barrel darkening
  const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.75);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

