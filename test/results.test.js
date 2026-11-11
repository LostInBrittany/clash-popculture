import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeResult } from '../src/results.js';

test('gagnant à droite', () => assert.deepEqual(computeResult({ left: 38, right: 62 }), { total: 100, leftPct: 38, rightPct: 62, winner: 'right' }));
test('égalité', () => assert.equal(computeResult({ left: 3, right: 3 }).winner, 'tie'));
test('aucun vote', () => assert.deepEqual(computeResult({ left: 0, right: 0 }), { total: 0, leftPct: 0, rightPct: 0, winner: 'tie' }));
test('arrondi à 100', () => { const r = computeResult({ left: 1, right: 2 }); assert.equal(r.leftPct + r.rightPct, 100); });
