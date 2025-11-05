# Déploiement sur Railway

Ce guide explique comment déployer votre application de streaming sur Railway.

## Problème résolu

L'erreur `invalid ELF header` était causée par l'incompatibilité des binaires SQLite avec l'environnement Linux de Railway. Nous avons migré vers PostgreSQL pour un déploiement fluide.

## Étapes de déploiement

### 1. Préparation du projet

1. **Vérifiez que votre code est à jour** avec les modifications PostgreSQL
2. **Supprimez le fichier `streaming.db`** s'il existe (il n'est plus nécessaire)
3. **Validez votre `package.json`** - il doit contenir `pg` au lieu de `sqlite3`

### 2. Création du projet Railway

1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur "New Project"
4. Sélectionnez "Deploy from GitHub repo"
5. Choisissez votre repository contenant le projet

### 3. Ajout de la base de données PostgreSQL

1. Dans votre projet Railway, cliquez sur "New"
2. Sélectionnez "Database" → "PostgreSQL"
3. Attendez que la base de données soit créée
4. Railway génère automatiquement la variable `DATABASE_URL`

### 4. Configuration des variables d'environnement

Dans la section "Variables" de votre projet Railway :

1. **Ajoutez `NODE_ENV=production`**
2. **Générez une clé secrète sécurisée pour `SESSION_SECRET`** :
   - Exemple : `SESSION_SECRET=streaming-secret-key-2024-$(openssl rand -hex 32)`
3. **La `DATABASE_URL` est déjà configurée automatiquement**
4. **Le `PORT` sera défini automatiquement par Railway**

### 5. Déploiement

1. Railway détectera automatiquement les modifications
2. Le déploiement démarre automatiquement
3. Surveillez les logs en temps réel
4. Attendez que le statut passe à "Success"

### 6. Test du déploiement

1. **Accédez à votre application** via l'URL fournie par Railway
2. **Vérifiez l'inscription** d'un nouvel utilisateur
3. **Testez la connexion** avec admin@cinestream.com / admin123
4. **Vérifiez l'affichage des films**

## Fonctionnalités importantes

### Base de données migrée
- ✅ Tables utilisateurs, films et watchlist créées automatiquement
- ✅ Utilisateur administrateur créé : admin@cinestream.com / admin123
- ✅ 6 films d'exemple ajoutés (tous premium)
- ✅ Toutes les requêtes converties vers PostgreSQL

### Gestion des erreurs
- ✅ Connexions PostgreSQL avec gestion d'erreurs
- ✅ Support SSL en production
- ✅ Variables d'environnement sécurisées

## Dépannage

### Erreur de connexion base de données
- Vérifiez que `DATABASE_URL` est bien définie
- Assurez-vous que le service PostgreSQL est actif
- Consultez les logs pour les détails d'erreur

### Erreur de session
- Vérifiez que `SESSION_SECRET` est définie
- Redémarrez l'application si nécessaire

### Erreur de fichiers uploadés
- Railway supporte les uploads de fichiers
- Les fichiers sont stockés temporairement
- Pour la production, utilisez un service de stockage dédié

## Configuration Production

### Variables recommandées
```bash
NODE_ENV=production
SESSION_SECRET=votre-cle-secrete-tres-longue-et-aleatoire
DATABASE_URL=postgresql://... (automatique)
PORT=3000 (automatique)
```

### Optimisations
- Railway gère automatiquement la compression
- Le cache statique est configuré automatiquement
- HTTPS est activé automatiquement

## Support

Après le déploiement, votre application sera accessible publiquement avec :
- URL d'accès fournie par Railway
- Base de données PostgreSQL gérée automatiquement
- SSL/HTTPS activé automatiquement

Le site de streaming est maintenant prêt pour la production ! 🎬