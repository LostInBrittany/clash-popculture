import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDb } from '../src/db.js';

// 10.255.255.1 ne répond pas : simule un add-on pas encore prêt.
test('connexion abandonnée vite si la base ne répond pas', async () => {
  const db = createDb('postgres://u:p@10.255.255.1:5432/x', { connectionTimeoutMillis: 300 });
  const start = Date.now();
  await assert.rejects(db.listDuels());
  assert.ok(Date.now() - start < 3000, `trop long : ${Date.now() - start} ms`);
  await db.close();
});
