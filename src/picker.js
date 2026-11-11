export const RECENT_LIMIT = 20;

// Tire un duel au hasard en évitant les plus récents.
export function pickDuel(duels, recentIds, random = Math.random) {
  const recent = new Set(recentIds.slice(-RECENT_LIMIT));
  const fresh = duels.filter(d => !recent.has(d.id));
  const pool = fresh.length > 0 ? fresh : duels;
  return pool[Math.floor(random() * pool.length)];
}
