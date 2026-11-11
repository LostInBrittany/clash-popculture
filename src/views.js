import { VOTE_MS } from './clock.js';

const FLASH = {
  'round-over': 'Trop tard, ce duel est terminé !',
  'unknown-duel': 'Oups, ton vote s’est perdu !',
};

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

const plural = n => `${n} vote${n > 1 ? 's' : ''}`;

export function renderPage(view, flash) {
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Clash de Pop Culture</title>
  <link rel="stylesheet" href="/style.css">
  <script src="/htmx.min.js"></script>
</head>
<body>
  <header><h1>Clash de Pop Culture</h1></header>
  <main>${renderDuel(view, flash)}</main>
</body>
</html>`;
}

// Le bloc du duel, rafraîchi par HTMX chaque seconde.
export function renderDuel(view, flash) {
  const inner = view.phase === 'vote' ? renderVote(view) : renderReveal(view);
  const message = FLASH[flash] ? `<p class="flash">${FLASH[flash]}</p>` : '';
  return `<section id="duel" class="duel phase-${view.phase}" hx-get="/duel" hx-trigger="every 1s" hx-swap="outerHTML">
  ${inner}
  ${message}
</section>`;
}

function renderVote({ round, secondsLeft, duel, myVote }) {
  const progress = (secondsLeft * 1000 / VOTE_MS).toFixed(2);
  const pick = side => `<button class="pick ${side}${myVote === side ? ' chosen' : ''}" name="side" value="${side}"${myVote ? ' disabled' : ''}>${escapeHtml(duel[side])}</button>`;
  return `<div class="tag">${escapeHtml(duel.category)} · Duel #${round % 10000}</div>
  <div class="timer">00:${String(secondsLeft).padStart(2, '0')}</div>
  <div class="bar"><div style="--p: ${progress}"></div></div>
  <form class="row" hx-post="/vote" hx-target="#duel" hx-swap="outerHTML">
    <input type="hidden" name="round" value="${round}">
    <input type="hidden" name="duelId" value="${duel.id}">
    ${pick('left')}
    <div class="vs">VS</div>
    ${pick('right')}
  </form>
  <div class="foot">${myVote ? '✔ Ton vote est enregistré · le score sera révélé à la fin' : 'Clique sur ton préféré !'}</div>`;
}

function renderReveal({ round, secondsLeft, duel, result }) {
  const next = `prochain duel dans ${secondsLeft} s`;
  if (result.total === 0) {
    return `<div class="tag">Résultat · Duel #${round % 10000}</div>
  <div class="win">${escapeHtml(duel.left)} <span class="vs">VS</span> ${escapeHtml(duel.right)}</div>
  <div class="foot">Aucun vote · ${next}</div>`;
  }
  const headline = result.winner === 'tie'
    ? 'ÉGALITÉ !'
    : `K.O. ! <span class="name">${escapeHtml(duel[result.winner])}</span> GAGNE`;
  return `<div class="tag">Résultat · Duel #${round % 10000}</div>
  <div class="win">${headline}</div>
  <div class="score">
    <div class="left" style="width: ${result.leftPct}%">${result.leftPct} %</div>
    <div class="right" style="width: ${result.rightPct}%">${result.rightPct} %</div>
  </div>
  <div class="names"><span>${escapeHtml(duel.left)}</span><span>${escapeHtml(duel.right)}</span></div>
  <div class="foot">${plural(result.total)} · ${next}</div>`;
}
