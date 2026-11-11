#!/bin/sh
# Arrête PostgreSQL et Redis démarrés par db-start.sh.
PGDATA="${PGDATA:-/opt/homebrew/var/postgresql@18}"
pg_ctl -D "$PGDATA" status >/dev/null 2>&1 && pg_ctl -D "$PGDATA" -w stop
redis-cli ping >/dev/null 2>&1 && redis-cli shutdown nosave
echo "PostgreSQL et Redis arrêtés."
