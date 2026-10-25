/**
 * Strips sensitive culprit and answer data from Mystery object before
 * sending to the client during active investigations.
 * As specified in spec.md Section 8.2 and 11.
 */
export function sanitizeMysteryForClient(mystery) {
  if (!mystery) return null;

  const sanitized = JSON.parse(JSON.stringify(mystery));

  // Strip top-level answers
  delete sanitized.culpritId;
  delete sanitized.motive;
  delete sanitized.explanation;

  // Sanitize suspects: remove isCulprit flag
  if (Array.isArray(sanitized.suspects)) {
    sanitized.suspects = sanitized.suspects.map(suspect => {
      const { isCulprit, ...safeSuspect } = suspect;
      return safeSuspect;
    });
  }

  // Sanitize evidence: remove isRedHerring flag
  if (Array.isArray(sanitized.evidence)) {
    sanitized.evidence = sanitized.evidence.map(item => {
      const { isRedHerring, ...safeItem } = item;
      return safeItem;
    });
  }

  return sanitized;
}
