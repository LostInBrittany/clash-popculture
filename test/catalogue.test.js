import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const duels = JSON.parse(readFileSync(new URL('../data/duels.json', import.meta.url)));

test('catalogue valide', () => {
  const cats = new Set(['Musique', 'Séries', 'Ciné', 'Jeux vidéo', 'Dessins animés', 'Télé', 'Dev']);
  assert.ok(duels.length >= 130);
  for (const d of duels) { assert.ok(cats.has(d.category), d.category); assert.ok(d.left && d.right); }
  assert.equal(new Set(duels.map(d => `${d.left}|${d.right}`)).size, duels.length);
});
