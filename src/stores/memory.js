// État du duel en mémoire : propre à chaque instance.
// Avec plusieurs instances, chacune a donc son propre état.
export function createMemoryStore() {
  const rounds = new Map();

  function slot(round) {
    if (!rounds.has(round)) rounds.set(round, { duelId: null, voters: new Map(), left: 0, right: 0 });
    return rounds.get(round);
  }

  return {
    mode: 'memoire',

    async claimDuel(round, duelId) {
      for (const r of rounds.keys()) if (r < round - 4) rounds.delete(r);
      const s = slot(round);
      if (s.duelId !== null) return { duelId: s.duelId, imposed: false };
      s.duelId = duelId;
      return { duelId, imposed: true };
    },

    async getDuel(round) {
      return rounds.get(round)?.duelId ?? null;
    },

    async castVote(round, viewerId, side) {
      const s = slot(round);
      if (s.voters.has(viewerId)) return false;
      s.voters.set(viewerId, side);
      s[side] += 1;
      return true;
    },

    async getVote(round, viewerId) {
      return rounds.get(round)?.voters.get(viewerId) ?? null;
    },

    async getScores(round) {
      const s = rounds.get(round);
      return { left: s?.left ?? 0, right: s?.right ?? 0 };
    },

    close() {},
  };
}
