# Clash de Pop Culture

Toutes les 30 secondes, un duel entre deux rivaux de la pop culture : Star Wars ou Star Trek ? Megadrive ou SNES ? Vim ou Emacs ?

Les spectateurs votent pendant 25 secondes, sans voir le score. Les 5 dernières secondes révèlent le gagnant.

## Stack

- Node.js 26 et Express 5, HTML rendu côté serveur.
- HTMX côté navigateur : le bloc du duel est rafraîchi chaque seconde. Pas de build, pas de framework front.
- PostgreSQL pour le catalogue des duels (`data/duels.json`, recopié au démarrage) et l'historique des résultats.

## Lancer en local

Il faut PostgreSQL installé et une base `popculture` (`createdb popculture`).

```sh
npm install
npm run db:start     # démarre la base pour la session
npm start            # http://localhost:8080
npm test
npm run db:stop
```

Par défaut, l'app écoute sur le port `8080` (variable `PORT`) et se connecte à `postgres://localhost/popculture` (variable `DATABASE_URL`).

## Licence

MIT
