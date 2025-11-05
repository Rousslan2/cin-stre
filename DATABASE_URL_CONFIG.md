# Configuration DATABASE_URL Railway

## 📋 Comment DATABASE_URL est Créée

### Option 1 : Automatique (Recommandée)
1. **Ajoutez PostgreSQL** dans Railway Dashboard
2. Railway **crée automatiquement** `DATABASE_URL`
3. La variable est **visible** dans Railway Dashboard > Variables

### Option 2 : Manuelle (Si nécessaire)
Si `DATABASE_URL` n'apparaît pas :

1. **Copiez l'URL PostgreSQL** depuis Railway Dashboard
   - Cliquez sur votre service PostgreSQL
   - Copiez la connection string (exemple) :
   ```
   postgresql://postgres:password@hostname:port/database
   ```

2. **Ajoutez manuellement** dans Variables :
   ```
   DATABASE_URL=postgresql://postgres:password@hostname:port/database
   ```

## 🔍 Vérification

### Dans Railway Dashboard :
- Allez dans votre projet → "Variables" tab
- Recherchez `DATABASE_URL`
- **Doit être présente** après ajout PostgreSQL

### Valeur de DATABASE_URL :
- ✅ Format : `postgresql://user:password@host:port/database`
- ✅ Variable **masquée** (security)
- ✅ Mise à jour **automatique** si vous redémarrez PostgreSQL

## ⚠️ Important
- **Ne jamais hardcoder** DATABASE_URL dans le code
- **Railway la fournit** automatiquement
- **Requis** pour le serveur complet (pas pour test-server.js)

## 🧪 Test
Une fois DATABASE_URL présente :
```bash
# Visitez votre health endpoint
https://votre-app.railway.app/env
# Doit montrer : "DATABASE_URL: Présent (masqué)"