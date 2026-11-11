import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

// Comportement attendu de tout store d'état du duel (mémoire ou Redis).
export function runStoreContract(name, makeStore) {
  describe(name, () => {
    let store, round;
    beforeEach(async () => { store = await makeStore(); round = Date.now() + Math.floor(Math.random() * 1e6); });
    afterEach(() => store.close());
    test('premier claim impose', async () => assert.deepEqual(await store.claimDuel(round, 7), { duelId: 7, imposed: true }));
    test('second claim adopte', async () => {
      await store.claimDuel(round, 7);
      assert.deepEqual(await store.claimDuel(round, 9), { duelId: 7, imposed: false });
      assert.equal(await store.getDuel(round), 7);
    });
    test('getDuel inconnu', async () => assert.equal(await store.getDuel(round), null));
    test('un vote par spectateur', async () => {
      assert.equal(await store.castVote(round, 'v1', 'left'), true);
      assert.equal(await store.castVote(round, 'v1', 'right'), false);
      await store.castVote(round, 'v2', 'right');
      assert.deepEqual(await store.getScores(round), { left: 1, right: 1 });
      assert.equal(await store.getVote(round, 'v1'), 'left');
      assert.equal(await store.getVote(round, 'v3'), null);
    });
    test('scores vides', async () => assert.deepEqual(await store.getScores(round), { left: 0, right: 0 }));
  });
}
