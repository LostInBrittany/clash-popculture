import { readFileSync } from 'node:fs';
import { setTimeout as wait } from 'node:timers/promises';
import { loadConfig } from './config.js';
import { createLogger } from './log.js';
import { createMemoryStore } from './stores/memory.js';
import { createRedisStore } from './stores/redis.js';
import { createDb } from './db.js';
import { createGame } from './game.js';
import { createApp } from './app.js';

const errorText = err => err.message || err.code || String(err);

// Réessaie indéfiniment : l'app ne plante pas en boucle si la base est injoignable.
export async function connectWithRetry(fn, { log, delayMs = 5000, sleep = wait }) {
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      log(`base injoignable, nouvel essai dans ${delayMs / 1000} s : ${errorText(err)}`);
      await sleep(delayMs);
    }
  }
}

async function main() {
  const config = loadConfig();
  const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  const catalogue = JSON.parse(readFileSync(new URL('../data/duels.json', import.meta.url)));
  const mode = config.redis ? 'redis' : 'memoire';
  const log = createLogger({ instanceId: config.instanceId, mode });

  let store;
  try {
    store = config.redis ? await createRedisStore(config.redis, err => log(`redis : ${errorText(err)}`)) : createMemoryStore();
  } catch (err) {
    log(`connexion Redis impossible, arrêt : ${errorText(err)}`);
    process.exit(1);
  }

  const db = createDb(config.databaseUrl);
  const duels = await connectWithRetry(async () => {
    await db.init(catalogue);
    return db.listDuels();
  }, { log });

  const game = createGame({ store, duels, db, log });
  setInterval(() => game.tick(), 1000);
  createApp(game).listen(config.port, () => {
    log(`démarrage : version ${version}, mode ${mode}, ${duels.length} duels au catalogue, port ${config.port}`);
  });
}

if (import.meta.main) main();
