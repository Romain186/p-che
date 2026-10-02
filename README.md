# Loire Pêche 42 — site vitrine

Site vitrine pour le magasin Loire Pêche 42 à Balbigny, avec des fondations serveur Next.js, PostgreSQL et Prisma pour les actualités et les avis.

## Lancer le projet

```bash
npm install
npm run dev
```

Puis ouvrir `http://localhost:3000`.

Sans `DATABASE_URL`, le mode développement utilise automatiquement les données locales de démonstration.

## Base de données

Copier `.env.example` vers `.env`, puis renseigner une URL PostgreSQL :

```env
DATABASE_URL=postgresql://utilisateur:mot-de-passe@localhost:5432/loire_peche_42
```

Initialiser le schéma et les données de développement :

```bash
npm run db:migrate -- --name init
npm run db:seed
```

Le seed crée trois actualités et trois avis fictifs clairement identifiés comme données de développement. Aucune connexion Facebook ou Google réelle n’est active par défaut.

## Synchronisation Facebook

Le backend de synchronisation Facebook est préparé mais désactivé par défaut. Il ne contacte pas Meta tant que :

```env
FACEBOOK_INTEGRATION_ENABLED=false
```

La configuration manuelle restante est documentée dans [`docs/facebook-integration.md`](docs/facebook-integration.md).

## Vérifications

```bash
npm run lint
npm run test
npm run typecheck
npm run build
```

## Structure

- `src/app` : pages et routes Next.js App Router
- `src/components` : composants d'interface réutilisables
- `src/lib/data` : couche serveur d’accès aux actualités et aux avis
- `src/lib/facebook` : client Graph API, normalisation, webhook et synchronisation
- `src/data` : fallback local de développement
- `prisma` : schéma PostgreSQL et seed de développement
- `public/images` : visuels locaux générés pour la maquette

Les actualités, marques, avis et photographies sont des contenus de démonstration. L'adresse exacte et les informations commerciales devront être confirmées avec le magasin avant mise en production.

Cette étape ne contient volontairement ni synchronisation Facebook/Google, ni authentification, ni back-office, ni paiement.
