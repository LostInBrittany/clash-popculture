#!/bin/sh
# Démarre PostgreSQL et Redis pour la session (jamais en service permanent).
PGDATA="${PGDATA:-/opt/homebrew/var/postgresql@18}"
pg_ctl -D "$PGDATA" -l "$PGDATA/server.log" status >/dev/null 2>&1 \
  || pg_ctl -D "$PGDATA" -l "$PGDATA/server.log" -w start
redis-cli ping >/dev/null 2>&1 \
  || redis-server --daemonize yes --save "" --appendonly no >/dev/null
echo "PostgreSQL et Redis démarrés. Pense à 'npm run db:stop' en fin de session."
