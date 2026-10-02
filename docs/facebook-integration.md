# Intégration Facebook — préparation technique

L’intégration est implémentée côté serveur mais reste désactivée tant que `FACEBOOK_INTEGRATION_ENABLED` vaut `false`. Aucun identifiant Meta réel n’est présent dans le repository.

## Architecture

```text
Page Facebook
  → webhook Meta signé
  → /api/webhooks/facebook
  → récupération Graph API
  → normalizeFacebookPost()
  → upsert Prisma par externalId
  → NewsPost
  → accueil et /actualites
```

Les suppressions Facebook ne suppriment pas les données : l’actualité correspondante passe au statut `ARCHIVED`.

## Variables serveur

Copier `.env.example` vers un fichier local non versionné, puis renseigner :

```env
FACEBOOK_INTEGRATION_ENABLED=false
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_PAGE_ID=
FACEBOOK_PAGE_ACCESS_TOKEN=
FACEBOOK_VERIFY_TOKEN=
FACEBOOK_SYNC_SECRET=
GRAPH_API_VERSION=
```

- `FACEBOOK_VERIFY_TOKEN` : valeur aléatoire choisie localement, saisie aussi dans l’écran de configuration du webhook Meta.
- `FACEBOOK_SYNC_SECRET` : valeur aléatoire distincte, utilisée uniquement pour protéger la synchronisation initiale.
- `GRAPH_API_VERSION` : version explicitement choisie dans Meta, au format `vXX.X`. Le code n’en impose aucune.
- Aucune variable n’utilise le préfixe `NEXT_PUBLIC_` : les secrets restent donc côté serveur.

## Étapes manuelles restantes dans Meta

Ces actions ne sont pas encore réalisées :

1. Créer ou sélectionner une Meta App adaptée à la Page Loire Pêche 42.
2. Ajouter le produit Webhooks et connecter la Page Facebook concernée.
3. Obtenir un Page Access Token autorisé à lire les publications de cette Page. Vérifier dans la documentation Meta courante les permissions et éventuelles étapes de revue exigées pour l’application.
4. Choisir la version Graph API, puis renseigner `GRAPH_API_VERSION` sans la coder en dur.
5. Déployer le site sur une URL HTTPS publique. Meta ne peut pas appeler un webhook limité à `localhost`.
6. Configurer l’URL de callback : `https://votre-domaine/api/webhooks/facebook`.
7. Saisir dans Meta exactement le même `FACEBOOK_VERIFY_TOKEN` que dans l’environnement serveur.
8. Abonner la Page au champ webhook `feed`, puis associer la Page à l’application.
9. Renseigner tous les secrets sur l’hébergeur, activer `FACEBOOK_INTEGRATION_ENABLED=true`, puis redéployer.
10. Déclencher la première synchronisation protégée.

## Première synchronisation

Une fois PostgreSQL et les variables Meta configurés :

```bash
curl -X POST https://votre-domaine/api/admin/facebook/sync \
  -H "Authorization: Bearer VOTRE_FACEBOOK_SYNC_SECRET"
```

La route récupère les publications récentes, les normalise et effectue un `upsert` sur `NewsPost.externalId`. Un même événement reçu plusieurs fois ne crée donc pas de doublon.

## Sécurité et comportement désactivé

- Les appels Graph API utilisent un en-tête `Authorization`; le Page Access Token n’est pas placé dans l’URL.
- Les requêtes webhook actives exigent une signature `X-Hub-Signature-256` valide calculée avec `FACEBOOK_APP_SECRET`.
- La route de synchronisation exige `FACEBOOK_SYNC_SECRET` dans un Bearer token ou dans `X-Facebook-Sync-Secret`.
- Aucun secret n’est journalisé.
- Quand l’intégration est désactivée, le site et son fallback fonctionnent normalement, les routes Facebook répondent `503` et aucune connexion Meta n’est tentée.

## Vérifications locales

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

Les tests locaux utilisent des réponses Graph API et un dépôt en mémoire. Ils ne nécessitent ni compte Meta, ni Page Access Token, ni PostgreSQL.
