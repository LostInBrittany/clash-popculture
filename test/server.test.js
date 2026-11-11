import { test } from 'node:test';
import assert from 'node:assert/strict';
import { connectWithRetry } from '../src/server.js';

test('réessaie jusqu’au succès', async () => {
  let n = 0; const logs = [];
  const v = await connectWithRetry(async () => { if (++n < 3) throw new Error('ECONNREFUSED'); return 'ok'; },
    { log: m => logs.push(m), sleep: async () => {} });
  assert.equal(v, 'ok'); assert.equal(logs.length, 2); assert.ok(logs[0].includes('ECONNREFUSED'));
});
