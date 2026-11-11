import { createClient } from 'redis';

const TTL = { expiration: { type: 'EX', value: 120 } };

// État du duel partagé dans Redis : toutes les instances voient le même duel.
export async function createRedisStore(options, onError = err => console.error(`redis : ${err.message}`)) {
  const client = createClient(options);
  client.on('error', onError);
  await client.connect();

  return {
    mode: 'redis',

    // SET NX : seule la première instance écrit, les autres adoptent son duel.
    async claimDuel(round, duelId) {
      const ok = await client.set(`duel:${round}`, String(duelId), { ...TTL, condition: 'NX' });
      if (ok === 'OK') return { duelId, imposed: true };
      return { duelId: Number(await client.get(`duel:${round}`)), imposed: false };
    },

    async getDuel(round) {
      const value = await client.get(`duel:${round}`);
      return value === null ? null : Number(value);
    },

    // Une clé par spectateur : SET NX garantit un seul vote, puis INCR du compteur.
    async castVote(round, viewerId, side) {
      const ok = await client.set(`vote:${round}:${viewerId}`, side, { ...TTL, condition: 'NX' });
      if (ok !== 'OK') return false;
      const key = `score:${round}:${side}`;
      await client.incr(key);
      await client.expire(key, 120);
      return true;
    },

    async getVote(round, viewerId) {
      return client.get(`vote:${round}:${viewerId}`);
    },

    async getScores(round) {
      const [left, right] = await Promise.all([
        client.get(`score:${round}:left`),
        client.get(`score:${round}:right`),
      ]);
      return { left: Number(left ?? 0), right: Number(right ?? 0) };
    },

    close() {
      client.destroy();
    },
  };
}
