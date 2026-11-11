import express from 'express';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { renderPage, renderDuel } from './views.js';

const htmxFile = fileURLToPath(new URL('../node_modules/htmx.org/dist/htmx.min.js', import.meta.url));
const publicDir = fileURLToPath(new URL('../public', import.meta.url));

// Un spectateur = une fenêtre de navigateur, identifiée par un cookie.
function viewer(req, res, next) {
  const match = /(?:^|;\s*)viewer=([\w-]{1,64})/.exec(req.headers.cookie ?? '');
  req.viewerId = match?.[1] ?? randomUUID();
  if (!match) {
    res.setHeader('Set-Cookie', `viewer=${req.viewerId}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`);
  }
  next();
}

export function createApp(game) {
  const app = express();
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(publicDir));
  app.get('/htmx.min.js', (req, res) => res.sendFile(htmxFile));
  app.use(viewer);
  app.use((req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });

  app.get('/', async (req, res) => res.send(renderPage(await game.view(req.viewerId))));
  app.get('/duel', async (req, res) => res.send(renderDuel(await game.view(req.viewerId))));
  app.post('/vote', async (req, res) => {
    const { reason } = await game.vote({
      round: Number(req.body.round),
      duelId: Number(req.body.duelId),
      side: String(req.body.side),
      viewerId: req.viewerId,
    });
    res.send(renderDuel(await game.view(req.viewerId), reason));
  });

  app.use((err, req, res, next) => {
    console.error(`erreur HTTP : ${err.message}`);
    res.status(500).send('Oups, le serveur a trébuché.');
  });
  return app;
}
