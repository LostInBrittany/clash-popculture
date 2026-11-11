import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/game.js';
import { createMemoryStore } from '../src/stores/memory.js';

const T0 = 30000 * 1000;
function setup({ saveResult = async () => true } = {}) {
  let t = T0; const logs = []; const saved = [];
  const game = createGame({
    store: createMemoryStore(),
    duels: [{ id: 1, category: 'Ciné', left: 'Star Wars', right: 'Star Trek' }, { id: 2, category: 'Dev', left: 'Vim', right: 'Emacs' }],
    db: { saveResult: async r => { saved.push(r); return saveResult(r); } },
    log: m => logs.push(m), now: () => t, random: () => 0,
  });
  return { game, logs, saved, at: ms => { t = T0 + ms; } };
}
const voteOn = (game, v, side, viewerId = 'a') => game.vote({ round: v.round, duelId: v.duel.id, side, viewerId });

test('vote accepté puis refusé en double', async () => {
  const { game } = setup(); const v = await game.view('a');
  assert.deepEqual(await voteOn(game, v, 'left'), { accepted: true });
  assert.deepEqual(await voteOn(game, v, 'right'), { accepted: false, reason: 'already-voted' });
  assert.equal((await game.view('a')).myVote, 'left');
});
test('score caché pendant le vote, révélé ensuite', async () => {
  const { game, at } = setup(); const v = await game.view('a');
  await voteOn(game, v, 'left');
  assert.equal((await game.view('a')).result, null);
  at(26000); assert.equal((await game.view('a')).result.winner, 'left');
});
test('vote après 25 s refusé', async () => {
  const { game, at } = setup(); const v = await game.view('a'); at(25000);
  assert.equal((await voteOn(game, v, 'left')).reason, 'round-over');
});
test('vote pour un créneau passé refusé', async () => {
  const { game, at } = setup(); const v = await game.view('a'); at(31000);
  assert.equal((await voteOn(game, v, 'left')).reason, 'round-over');
});
test('vote pour un duel inconnu refusé et journalisé', async () => {
  const { game, logs } = setup(); const v = await game.view('a');
  assert.equal((await game.vote({ round: v.round, duelId: 999, side: 'left', viewerId: 'a' })).reason, 'unknown-duel');
  assert.ok(logs.some(l => l.includes('unknown-duel')));
});
test('côté invalide refusé', async () => {
  const { game } = setup(); const v = await game.view('a');
  assert.equal((await voteOn(game, v, 'milieu')).reason, 'bad-side');
});
test('clôture : un seul enregistrement par instance', async () => {
  const { game, saved, at } = setup(); const v = await game.view('a');
  await voteOn(game, v, 'right');
  at(25500); await game.tick(); at(26500); await game.tick();
  assert.deepEqual(saved, [{ round: v.round, duelId: v.duel.id, left: 0, right: 1 }]);
});
test('duel sans vote non enregistré', async () => {
  const { game, saved, logs, at } = setup(); await game.tick(); at(26000); await game.tick();
  assert.equal(saved.length, 0); assert.ok(logs.some(l => l.includes('sans vote')));
});
test('résultat déjà enregistré par une autre instance', async () => {
  const { game, logs, at } = setup({ saveResult: async () => false }); const v = await game.view('a');
  await voteOn(game, v, 'left');
  at(26000); await game.tick();
  assert.ok(logs.some(l => l.includes('déjà enregistré')));
});
test('erreur de base journalisée, pas levée', async () => {
  const { game, logs, at } = setup({ saveResult: async () => { throw new Error('boom'); } }); const v = await game.view('a');
  await voteOn(game, v, 'left');
  at(26000); await game.tick();
  assert.ok(logs.some(l => l.includes('boom')));
});
test('duel suivant différent du précédent', async () => {
  const { game, at } = setup(); const a = await game.view('x'); at(30000);
  assert.notEqual((await game.view('x')).duel.id, a.duel.id);
});
