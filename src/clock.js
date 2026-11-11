export const ROUND_MS = 30000;
export const VOTE_MS = 25000;

// Créneau courant : les duels sont calés sur l'horloge murale.
export function slotAt(nowMs) {
  const round = Math.floor(nowMs / ROUND_MS);
  const elapsed = nowMs % ROUND_MS;
  const phase = elapsed < VOTE_MS ? 'vote' : 'reveal';
  const phaseEnd = phase === 'vote' ? VOTE_MS : ROUND_MS;
  return { round, phase, secondsLeft: Math.ceil((phaseEnd - elapsed) / 1000) };
}
