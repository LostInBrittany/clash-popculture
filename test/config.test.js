import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/config.js';

test('défauts', () => {
  const c = loadConfig({});
  assert.equal(c.port, 8080);
  assert.equal(c.databaseUrl, 'postgres://localhost/popculture');
  assert.equal(c.redis, null);
});
test('add-on PostgreSQL Clever', () => assert.equal(loadConfig({ POSTGRESQL_ADDON_URI: 'postgres://x' }).databaseUrl, 'postgres://x'));
test('DATABASE_URL prioritaire', () => assert.equal(loadConfig({ DATABASE_URL: 'postgres://a', POSTGRESQL_ADDON_URI: 'postgres://b' }).databaseUrl, 'postgres://a'));
test('REDIS_URL', () => assert.deepEqual(loadConfig({ REDIS_URL: 'redis://h:6379' }).redis, { url: 'redis://h:6379' }));
test('Materia KV en TLS', () => assert.deepEqual(
  loadConfig({ REDIS_HOST: 'kv.example', REDIS_PORT: '6379', REDIS_PASSWORD: 'tok' }).redis,
  { socket: { host: 'kv.example', port: 6379, tls: true }, password: 'tok' }));
test('instance Clever', () => assert.equal(loadConfig({ INSTANCE_ID: 'abcdef123456' }).instanceId, 'abcdef'));
