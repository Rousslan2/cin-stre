# 📁 Instructions pour déplacer le projet vers Windows

## Votre chemin demandé
Vous avez demandé de créer le projet dans:
```
C:\Users\Rousslan\Desktop\teqst
```

## Comment procéder

### Méthode 1: Télécharger et déplacer (Recommandé)

1. **Téléchargez le dossier `streaming-site`** depuis votre interface Claude

2. **Créez le dossier de destination** sur votre bureau Windows:
   - Ouvrez l'Explorateur Windows
   - Allez sur votre Bureau
   - Créez un dossier nommé `teqst` (s'il n'existe pas déjà)
   - Chemin final: `C:\Users\Rousslan\Desktop\teqst`

3. **Copiez le projet**:
   - Déplacez tout le contenu du dossier `streaming-site` téléchargé
   - Vers: `C:\Users\Rousslan\Desktop\teqst`
   
   Vous devriez avoir cette structure:
   ```
   C:\Users\Rousslan\Desktop\teqst\
   ├── public\
   ├── server.js
   ├── package.json
   ├── README.md
   └── autres fichiers...
   ```

### Méthode 2: Via la ligne de commande Windows

1. **Ouvrez PowerShell ou CMD** en tant qu'administrateur

2. **Naviguez vers votre Bureau**:
   ```cmd
   cd C:\Users\Rousslan\Desktop
   ```

3. **Créez le dossier** (si nécessaire):
   ```cmd
   mkdir teqst
   ```

4. **Copiez les fichiers téléchargés**:
   ```cmd
   xcopy /E /I "chemin\vers\streaming-site" "C:\Users\Rousslan\Desktop\teqst"
   ```

## Après le déplacement

### 1. Ouvrir le projet
```cmd
cd C:\Users\Rousslan\Desktop\teqst
```

### 2. Installer les dépendances
```cmd
npm install
```

### 3. Lancer le serveur
```cmd
npm start
```

### 4. Ouvrir dans le navigateur
```
http://localhost:3000
```

## Vérification

Pour vérifier que tout est bien en place, vous devriez avoir:

```
C:\Users\Rousslan\Desktop\teqst\
├── public\
│   ├── css\
│   │   ├── style.css
│   │   ├── auth.css
│   │   ├── movies.css
│   │   ├── player.css
│   │   └── subscription.css
│   ├── js\
│   │   ├── main.js
│   │   ├── auth.js
│   │   ├── movies.js
│   │   ├── player.js
│   │   └── subscription.js
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── movies.html
│   ├── player.html
│   └── subscription.html
├── server.js
├── package.json
├── README.md
├── DEMARRAGE_RAPIDE.md
└── FONCTIONNALITES.md
```

## ⚠️ Important

**Node.js requis**: Assurez-vous d'avoir Node.js installé sur votre PC Windows
- Téléchargez depuis: https://nodejs.org/
- Version recommandée: LTS (Long Term Support)
- Vérifiez l'installation: `node --version` et `npm --version`

## 🆘 En cas de problème

**Le serveur ne démarre pas:**
- Vérifiez que Node.js est installé
- Essayez de réinstaller les dépendances: `npm install`
- Vérifiez que le port 3000 n'est pas déjà utilisé

**Erreur de permissions:**
- Exécutez CMD/PowerShell en tant qu'administrateur
- Vérifiez les permissions du dossier

**Modules manquants:**
```cmd
npm install
```

## ✅ Tout est prêt !

Une fois les fichiers dans `C:\Users\Rousslan\Desktop\teqst`, vous pouvez:
1. Installer les dépendances
2. Lancer le serveur
3. Commencer à utiliser votre site de streaming !

Consultez `DEMARRAGE_RAPIDE.md` pour les instructions détaillées.

---

**Bon développement ! 🚀**
