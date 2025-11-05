# 🔧 BASE DE DONNÉES RAILWAY - CONFIGURATION COMPLETE

## 🚨 **Problème Identifié :**
"Service temporairement indisponible - Base de données non configurée"

## ✅ **Solution : Créer Base de Données PostgreSQL sur Railway**

### **1. Sur Railway Dashboard :**

**Allez dans votre projet Railway :**
1. **Onglet "Database"** (gauche)
2. **Cliquez "New Database"**
3. **Sélectionnez "PostgreSQL"**
4. **Nommez votre base** : `streaming-postgres`
5. **Créer** et **attendre 30 secondes**

### **2. Variables Automatic Gets Generated :**

Après création PostgreSQL, Railway **ajoute automatiquement** :
- ✅ `DATABASE_URL=postgresql://user:pass@host:5432/db`
- ✅ `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`

### **3. Relancer Application :**

**Sur Railway Dashboard :**
1. **Onglet "Settings"** 
2. **Section "Domains"** → Trouvez votre app
3. **Click sur votre domaine** pour relancer

### **4. Vérification dans Logs :**

Vous devriez voir :
```
PostgreSQL database connected successfully
Database tables initialized
Server running on port 3000
```

## 🚀 **Si DB n'apparaît pas automatiquement :**

### **Manually Add DATABASE_URL :**

**Variables Railway → Add Variable :**
```
DATABASE_URL=postgresql://railway:password@localhost:5432/railway
```

## 📋 **Vérification URL Base :**

**Trouvez votre DATABASE_URL :**
1. **Railway Dashboard** → **Database**
2. **Click sur votre PostgreSQL**
3. **Onglet "Connect"**
4. **Copiez la DATABASE_URL**

## 🎯 **Résultat Final :**

Après configuration PostgreSQL :
- ✅ **Application accessible**
- ✅ **Base de données connectée**
- ✅ **Site streaming fonctionnel**
- ✅ **Plus d'erreur "Service indisponible"**

## 🔄 **Pour créer nouvelle DB :**

**Si besoin de recréer :**
1. **Supprimez l'ancienne DB** (Railway Dashboard)
2. **Créez une nouvelle PostgreSQL**
3. **Attendez 30 secondes**
4. **Redémarrez l'application**

**Votre site streaming sera 100% opérationnel !** 🎬