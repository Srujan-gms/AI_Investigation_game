/**
 * Lightbox Component for Forensic Image Inspection
 */
export function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close-btn');

  if (!modal) return;

  window.openLightbox = (src, title, notes = '') => {
    img.src = src;
    caption.innerHTML = `<strong>${title}</strong>${notes ? `<br><span style="font-family: var(--font-mono); font-size: 0.8rem; color: #a1a1aa;">${notes}</span>` : ''}`;
    modal.classList.add('open');
  };

  function close() {
    modal.classList.remove('open');
  }

  if (closeBtn) closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}
