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

## Piloter l'app avec un assistant de code

Pour partir d'une page blanche, chaque assistant peut démarrer avec un profil vide : pas de mémoire, pas de réglages, pas d'historique. Le skill [`clever-tools`](https://github.com/CleverCloud/clever-tools), qui apprend à l'assistant à utiliser la CLI `clever`, est supposé installé dans `~/.agents/skills/clever-tools`. Les commandes se lancent depuis le dossier de l'app.

### Claude Code

```sh
mkdir -p ~/claude-demo-profile/skills
cp -R ~/.agents/skills/clever-tools ~/claude-demo-profile/skills/
CLAUDE_CONFIG_DIR=~/claude-demo-profile claude
```

`CLAUDE_CONFIG_DIR` déplace toute la configuration de Claude Code (réglages, connexion, skills, mémoire, historique). Claude Code ne lit pas `~/.agents/skills` : on copie donc le skill dans le profil. Au premier lancement, il faut se reconnecter avec `/login`.

### Codex

```sh
mkdir -p ~/codex-demo-profile
CODEX_HOME=~/codex-demo-profile codex
```

`CODEX_HOME` (par défaut `~/.codex`) déplace la configuration, la connexion, les sessions et les skills. Codex lit directement `~/.agents/skills`, le skill y est donc disponible. Au premier lancement, il faut se reconnecter. Pour que la connexion reste dans le profil plutôt que dans le trousseau macOS, ajouter `cli_auth_credentials_store = "file"` dans `~/codex-demo-profile/config.toml`.

### Mistral Vibe

```sh
mkdir -p ~/vibe-demo-profile
VIBE_HOME=~/vibe-demo-profile vibe
```

`VIBE_HOME` (par défaut `~/.vibe`) déplace la configuration, l'historique, les logs et le cache. Vibe lit directement `~/.agents/skills`, le skill y est donc disponible. La connexion au compte Mistral reste dans le trousseau macOS : elle est reprise telle quelle.

### Bon à savoir

Aucune de ces variables ne touche à la CLI `clever`, qui garde sa connexion dans `~/.config/clever-cloud/`.

## Licence

MIT
