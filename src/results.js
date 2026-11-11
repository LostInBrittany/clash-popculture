export function computeResult({ left, right }) {
  const total = left + right;
  if (total === 0) return { total: 0, leftPct: 0, rightPct: 0, winner: 'tie' };
  const leftPct = Math.round((left / total) * 100);
  const winner = left > right ? 'left' : right > left ? 'right' : 'tie';
  return { total, leftPct, rightPct: 100 - leftPct, winner };
}
