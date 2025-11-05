# Guide de Déploiement Progressif Railway - Solution 502

## 🚨 Solution pour l'Erreur 502 Railway

Ce guide résout le problème d'erreur 502 "Bad Gateway" en déployant progressivement l'application.

## 📋 Étapes de Résolution

### Étape 1 : Déploiement du Serveur de Test (Immédiat)

1. **Modifiez le package.json** pour utiliser le serveur de test :
```json
{
  "scripts": {
    "start": "node test-server.js"
  }
}
```

2. **Poussez vers GitHub** et redeployez sur Railway
3. **Vérifiez** que `https://votre-app.railway.app/health` fonctionne (doit retourner 200)

### Étape 2 : Ajout de PostgreSQL

1. **Dans Railway Dashboard** :
   - Cliquez sur "New" → "Database" → "PostgreSQL"
   - Attendez 3-5 minutes que le service soit "Ready"

2. **Ajoutez les variables d'environnement** :
```
NODE_ENV=production
SESSION_SECRET=streaming-secret-key-2024-votre-cle-aleatoire
```

3. **Passez au serveur complet** :
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### Étape 3 : Déploiement du Serveur Complet

1. **Poussez les changements** (maintenant que PostgreSQL est configuré)
2. **Surveillez les logs** - vous devriez voir :
   ```
   ✓ Connecté à la base de données PostgreSQL
   ✓ Test de connexion réussi
   ```

## 🛠️ Configuration Finale

### Variables d'Environnement Railway
```
DATABASE_URL=postgresql://... (automatique)
NODE_ENV=production
SESSION_SECRET=votre-cle-tres-secure
PORT=3000 (automatique)
```

### Test de Fonctionnement
- ✅ `https://votre-app.railway.app/` → Page d'accueil
- ✅ `https://votre-app.railway.app/health` → {"status":"OK"}
- ✅ `https://votre-app.railway.app/movies.html` → Liste des films
- ✅ `https://votre-app.railway.app/admin.html` → Panel admin (connexion requise)

## 📊 Monitoring

### Logs à Surveiller
- ✅ `✓ Connecté à la base de données PostgreSQL`
- ✅ `✓ Test de connexion réussi`
- ✅ `✓ Table users créée/vérifiée`
- ✅ `✓ Administrateur créé`

### Alertes à Éviter
- ❌ `DATABASE_URL environment variable is required`
- ❌ `connect ECONNREFUSED`
- ❌ `serveur s'arrête au démarrage`

## 🔧 Dépannage Rapide

### Si 502 Persiste
1. **Vérifiez les logs** dans Railway Dashboard
2. **Utilisez `test-server.js`** pour valider le déploiement
3. **Ajoutez PostgreSQL** avant le serveur complet

### Si Base de Données Non Connectée
1. **Attendez** 3-5 minutes après ajout PostgreSQL
2. **Redémarrez** le service si nécessaire
3. **Vérifiez** que `DATABASE_URL` est présente dans Variables

### Si API ne Fonctionne pas
1. **Testez** `/health` d'abord
2. **Vérifiez** que toutes les routes API ont `checkDatabase`
3. **Consultez** les logs pour erreurs spécifiques

## 🎯 Résultat Final

Après ces étapes, votre application sera :
- ✅ Accessible sans erreur 502
- ✅ Connectée à PostgreSQL
- ✅ Fonctionnelle avec toutes les API
- ✅ Prête pour les utilisateurs

**URLs de Test** :
- Application : `https://votre-app.railway.app`
- Health Check : `https://votre-app.railway.app/health`
- Admin : `https://votre-app.railway.app/admin.html`
- Connexion Admin : admin@cinestream.com / admin123