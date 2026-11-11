import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderDuel } from '../src/views.js';

export const base = { round: 59814720, phase: 'vote', secondsLeft: 15, myVote: null, result: null,
  duel: { id: 3, category: 'Ciné', left: "L'Aile ou la Cuisse", right: '<b>"Soupe" & Choux</b>' } };

test('échappe les noms, y compris dans les attributs', () => {
  const html = renderDuel(base);
  assert.ok(!html.includes('<b>"Soupe"'));
  assert.ok(html.includes('&lt;b&gt;&quot;Soupe&quot; &amp; Choux&lt;/b&gt;'));
  assert.ok(html.includes('L&#39;Aile ou la Cuisse'));
});
test('pas de score pendant le vote', () => assert.ok(!renderDuel(base).includes('%')));
test('étiquette et chrono', () => { const h = renderDuel(base); assert.ok(h.includes('Ciné · Duel #4720')); assert.ok(h.includes('00:15')); });
test('vote enregistré', () => assert.ok(renderDuel({ ...base, myVote: 'left' }).includes('Ton vote est enregistré')));
test('révélation', () => {
  const h = renderDuel({ ...base, phase: 'reveal', secondsLeft: 3, result: { total: 137, leftPct: 38, rightPct: 62, winner: 'right' } });
  assert.ok(h.includes('K.O. !')); assert.ok(h.includes('62 %')); assert.ok(h.includes('137 votes · prochain duel dans 3 s'));
});
test('égalité', () => assert.ok(renderDuel({ ...base, phase: 'reveal', secondsLeft: 2, result: { total: 2, leftPct: 50, rightPct: 50, winner: 'tie' } }).includes('ÉGALITÉ !')));
test('message de refus', () => assert.ok(renderDuel(base, 'round-over').includes('Trop tard, ce duel est terminé !')));
test('fragment pollé chaque seconde', () => assert.ok(renderDuel(base).includes('hx-trigger="every 1s"')));
