import { slotAt } from './clock.js';
import { computeResult } from './results.js';
import { pickDuel, RECENT_LIMIT } from './picker.js';

// Le moteur du Clash : quel duel en ce moment, les votes, la clôture.
export function createGame({ store, duels, db, log, now = Date.now, random = Math.random }) {
  const byId = new Map(duels.map(d => [d.id, d]));
  const known = new Map(); // round -> Promise<duelId>
  const recent = [];
  let lastClosed = null;

  // Duel du créneau : tiré par cette instance, ou adopté via le store.
  function duelFor(round) {
    if (!known.has(round)) {
      known.set(round, (async () => {
        const candidate = pickDuel(duels, recent, random);
        const { duelId, imposed } = await store.claimDuel(round, candidate.id);
        recent.push(duelId);
        if (recent.length > RECENT_LIMIT) recent.shift();
        const d = byId.get(duelId);
        const how = store.mode === 'redis' ? (imposed ? ' (imposé)' : ' (adopté)') : '';
        log(`duel ${round} tiré : ${d.category} · ${d.left} vs ${d.right}${how}`);
        return duelId;
      })());
      known.get(round).catch(() => known.delete(round));
      for (const r of known.keys()) if (r < round - 4) known.delete(r);
    }
    return known.get(round);
  }

  async function close(round, duelId) {
    const scores = await store.getScores(round);
    if (computeResult(scores).total === 0) {
      log(`duel ${round} sans vote, non enregistré`);
      return;
    }
    const d = byId.get(duelId);
    const inserted = await db.saveResult({ round, duelId, left: scores.left, right: scores.right });
    log(inserted
      ? `résultat duel ${round} enregistré : ${d.left} ${scores.left} – ${scores.right} ${d.right}`
      : `résultat duel ${round} déjà enregistré par une autre instance`);
  }

  return {
    async tick() {
      const { round, phase } = slotAt(now());
      try {
        const duelId = await duelFor(round);
        if (phase === 'reveal' && lastClosed !== round) {
          lastClosed = round;
          await close(round, duelId);
        }
      } catch (err) {
        log(`erreur sur le duel ${round} : ${err.message}`);
      }
    },

    async view(viewerId) {
      const { round, phase, secondsLeft } = slotAt(now());
      const duelId = await duelFor(round);
      return {
        round, phase, secondsLeft,
        duel: byId.get(duelId),
        myVote: await store.getVote(round, viewerId),
        result: phase === 'reveal' ? computeResult(await store.getScores(round)) : null,
      };
    },

    async vote({ round, duelId, side, viewerId }) {
      const refuse = reason => {
        log(`vote refusé duel ${round} : ${reason}`);
        return { accepted: false, reason };
      };
      if (side !== 'left' && side !== 'right') return refuse('bad-side');
      const slot = slotAt(now());
      if (round !== slot.round || slot.phase !== 'vote') return refuse('round-over');
      if (duelId !== await duelFor(round)) return refuse('unknown-duel');
      if (!await store.castVote(round, viewerId, side)) return refuse('already-voted');
      log(`vote accepté duel ${round} : ${side}`);
      return { accepted: true };
    },
  };
}
