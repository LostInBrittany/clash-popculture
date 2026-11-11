import os from 'node:os';

// Toute la configuration vient de l'environnement.
export function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT) || 8080,
    databaseUrl: env.DATABASE_URL || env.POSTGRESQL_ADDON_URI || 'postgres://localhost/popculture',
    redis: redisOptions(env),
    instanceId: (env.INSTANCE_ID || os.hostname()).slice(0, 6),
  };
}

function redisOptions(env) {
  if (env.REDIS_URL) return { url: env.REDIS_URL };
  // Materia KV expose hôte, port et jeton, en TLS.
  if (env.REDIS_HOST) {
    return {
      socket: { host: env.REDIS_HOST, port: Number(env.REDIS_PORT) || 6379, tls: true },
      password: env.REDIS_PASSWORD,
    };
  }
  return null;
}
