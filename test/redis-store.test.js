import { test } from 'node:test';
import { runStoreContract } from './store-contract.js';
import { createRedisStore } from '../src/stores/redis.js';

const url = process.env.REDIS_URL;
if (url) runStoreContract('redis store', () => createRedisStore({ url }));
else test('redis store', { skip: 'REDIS_URL non défini' }, () => {});
