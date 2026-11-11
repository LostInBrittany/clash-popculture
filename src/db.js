import pg from 'pg';

// PostgreSQL : le catalogue des duels et l'historique des résultats.
export function createDb(databaseUrl, { connectionTimeoutMillis = 5000 } = {}) {
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 3, connectionTimeoutMillis });
  pool.on('error', err => console.error(`postgres : ${err.message}`));

  return {
    // Crée le schéma si besoin et insère les duels absents du catalogue.
    async init(catalogue) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS duels (
          id SERIAL PRIMARY KEY,
          category TEXT NOT NULL,
          left_name TEXT NOT NULL,
          right_name TEXT NOT NULL,
          UNIQUE (left_name, right_name)
        );
        CREATE TABLE IF NOT EXISTS resultats (
          round BIGINT PRIMARY KEY,
          duel_id INTEGER NOT NULL REFERENCES duels(id),
          votes_left INTEGER NOT NULL,
          votes_right INTEGER NOT NULL,
          ended_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );`);
      await pool.query(
        `INSERT INTO duels (category, left_name, right_name)
         SELECT * FROM unnest($1::text[], $2::text[], $3::text[])
         ON CONFLICT (left_name, right_name) DO NOTHING`,
        [catalogue.map(d => d.category), catalogue.map(d => d.left), catalogue.map(d => d.right)],
      );
    },

    async listDuels() {
      const { rows } = await pool.query(
        'SELECT id, category, left_name AS "left", right_name AS "right" FROM duels ORDER BY id');
      return rows;
    },

    // Un seul résultat par duel, même si deux instances le clôturent.
    async saveResult({ round, duelId, left, right }) {
      const { rowCount } = await pool.query(
        `INSERT INTO resultats (round, duel_id, votes_left, votes_right)
         VALUES ($1, $2, $3, $4) ON CONFLICT (round) DO NOTHING`,
        [round, duelId, left, right]);
      return rowCount === 1;
    },

    close() {
      return pool.end();
    },
  };
}
