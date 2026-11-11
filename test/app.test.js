import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

const base = { round: 59814720, phase: 'vote', secondsLeft: 15, myVote: null, result: null,
  duel: { id: 3, category: 'Ciné', left: 'Star Wars', right: 'Star Trek' } };

test('cookie viewer posé et vote transmis', async () => {
  const calls = [];
  const fake = { view: async () => base, vote: async a => { calls.push(a); return { accepted: false, reason: 'round-over' }; } };
  const server = createApp(fake).listen(0); const url = `http://localhost:${server.address().port}`;
  try {
    const r1 = await fetch(`${url}/`); assert.match(r1.headers.get('set-cookie'), /viewer=[\w-]+;.*HttpOnly/i);
    const cookie = r1.headers.get('set-cookie').split(';')[0];
    const r2 = await fetch(`${url}/vote`, { method: 'POST', headers: { cookie, 'content-type': 'application/x-www-form-urlencoded' }, body: 'round=59814720&duelId=3&side=left' });
    assert.equal(r2.status, 200); assert.ok((await r2.text()).includes('Trop tard'));
    assert.deepEqual(calls[0], { round: 59814720, duelId: 3, side: 'left', viewerId: cookie.split('=')[1] });
    assert.equal((await fetch(`${url}/htmx.min.js`)).status, 200);
  } finally { server.close(); }
});
