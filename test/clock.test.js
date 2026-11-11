import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slotAt } from '../src/clock.js';

test('début de créneau', () => assert.deepEqual(slotAt(30000 * 1000), { round: 1000, phase: 'vote', secondsLeft: 25 }));
test('milieu du vote', () => assert.deepEqual(slotAt(30000 * 1000 + 10500), { round: 1000, phase: 'vote', secondsLeft: 15 }));
test('dernière ms du vote', () => assert.equal(slotAt(30000 * 1000 + 24999).phase, 'vote'));
test('début de révélation', () => assert.deepEqual(slotAt(30000 * 1000 + 25000), { round: 1000, phase: 'reveal', secondsLeft: 5 }));
test('créneau suivant', () => assert.equal(slotAt(30000 * 1001).round, 1001));
