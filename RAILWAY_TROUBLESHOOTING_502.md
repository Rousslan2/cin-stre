# Guide de Dépannage - Erreur 502 Railway

## 🚨 Erreur 502 - Server Error

L'erreur 502 signifie que votre serveur s'est écrasé au démarrage. Voici les causes principales et leurs solutions.

## 🔍 Diagnostic Rapide

### 1. Vérifiez les Logs Railway
1. Allez dans votre projet Railway
2. Cliquez sur "Deployments" 
3. Sélectionnez le dernier déploiement
4. Cliquez sur "View Logs"
5. Cherchez les messages d'erreur commençant par ❌

### 2. Testez l'Endpoint de Santé
Visitez `https://votre-app.railway.app/health` (remplacez par votre URL)
- ✅ Si ça fonctionne : Le serveur démarre mais il y a un problème d'API
- ❌ Si ça ne fonctionne pas : Le serveur ne démarre pas du tout

## 🛠️ Solutions aux Erreurs 502

### Problème #1 : DATABASE_URL Manquant

**Symptôme dans les logs :**
```
❌ Erreur de configuration de la base de données: DATABASE_URL environment variable is required in production
```

**Solution :**
1. **Ajoutez un service PostgreSQL :**
   - Dans Railway Dashboard, cliquez sur "New"
   - Sélectionnez "Database" → "PostgreSQL"
   - Attendez 2-3 minutes pour que le service soit prêt

2. **Vérifiez que DATABASE_URL existe :**
   - Allez dans votre projet → "Variables" tab
   - Recherchez `DATABASE_URL` (créé automatiquement)
   - Si absent, ajoutez-le manuellement avec l'URL fournie par Railway

### Problème #2 : Échec de Connexion PostgreSQL

**Symptôme dans les logs :**
```
❌ Échec du test de connexion à la base de données: connect ECONNREFUSED
❌ Connecté à la base de données PostgreSQL
```

**Solutions :**
1. **Attendez que PostgreSQL soit prêt :**
   - Le service peut prendre 2-3 minutes à s'initialiser
   - Redéployez après 5 minutes d'attente

2. **Redémarrez le service :**
   - Railway Dashboard → Votre service PostgreSQL → "Restart"

### Problème #3 : Erreurs JavaScript Non Capturées

**Symptôme dans les logs :**
```
❌ Erreur non capturée: [erreur spécifique]
```

**Solutions :**
1. **Vérifiez les dépendances :**
   ```bash
   npm install
   npm audit fix
   ```

2. **Validez votre package.json :**
   - Assurez-vous que `pg` est présent (pas `sqlite3`)
   - Supprimez `package-lock.json` et `node_modules`, puis réinstallez

## 🚀 Étapes de Résolution Recommandées

### Étape 1 : Nettoyage Complet
```bash
# Supprimez les anciens fichiers SQLite
rm -f streaming.db

# Réinstallez les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Étape 2 : Vérification Locale
```bash
# Testez en local avec une base PostgreSQL locale
export DATABASE_URL="postgresql://postgres:password@localhost:5432/test"
npm start
```

### Étape 3 : Déploiement Railway
1. Poussez les changements vers GitHub
2. Attendez le déploiement Railway
3. Vérifiez les logs en temps réel
4. Testez l'endpoint `/health`

## 🔧 Configuration Railway Optimale

### Variables d'Environnement Requises
```bash
NODE_ENV=production
SESSION_SECRET=streaming-secret-key-2024-$(openssl rand -hex 32)
PORT=3000
# DATABASE_URL sera créé automatiquement par Railway
```

### Ordre de Création (IMPORTANT)
1. **Créez d'abord le service PostgreSQL**
2. **Attendez 3-5 minutes** pour l'initialisation
3. **Puis déployez votre application**
4. **Ajoutez les variables d'environnement**

## 🆘 Si Rien Ne Fonctionne

### Test de Déploiement Minimal
Créez un `test-server.js` simple :
```javascript
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.send('Test de serveur fonctionne !');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Serveur test démarré sur port ${PORT}`);
});
```

### Déploiement Étape par Étape
1. Déployez d'abord ce serveur de test
2. Vérifiez qu'il fonctionne (status 200)
3. Puis ajoutez votre application complète

## 📞 Support Final

Si le problème persiste :
1. **Partagez les logs complets** du déploiement échoué
2. **Indiquez votre URL Railway** pour diagnostic
3. **Vérifiez que PostgreSQL service est "Ready"** (vert) dans Railway

Votre application devrait fonctionner après ces corrections ! 🎬