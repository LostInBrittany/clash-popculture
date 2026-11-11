import { runStoreContract } from './store-contract.js';
import { createMemoryStore } from '../src/stores/memory.js';

runStoreContract('memory store', async () => createMemoryStore());
