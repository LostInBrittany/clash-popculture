import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickDuel } from '../src/picker.js';

test('évite les récents', () => {
  const duels = [1, 2, 3].map(id => ({ id }));
  for (let i = 0; i < 50; i++) assert.equal(pickDuel(duels, [1, 2]).id, 3);
});
test('tout est récent : retombe sur le catalogue complet', () => {
  const duels = [1, 2].map(id => ({ id }));
  assert.ok([1, 2].includes(pickDuel(duels, [1, 2]).id));
});
test('random injectable', () => assert.equal(pickDuel([{ id: 1 }, { id: 2 }], [], () => 0.99).id, 2));
