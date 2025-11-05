# 🚀 GUIDE DE DÉMARRAGE RAPIDE - CinéStream

## ⚡ Installation Rapide (3 étapes)

### Étape 1: Ouvrir le projet
1. Téléchargez le dossier `streaming-site`
2. Ouvrez un terminal/invite de commandes
3. Naviguez vers le dossier:
   ```bash
   cd streaming-site
   ```

### Étape 2: Installer les dépendances
```bash
npm install
```
⏱️ Cela prendra 1-2 minutes

### Étape 3: Lancer le site
```bash
npm start
```

✅ Le serveur démarre sur: **http://localhost:3000**

## 🌐 Ouvrir le Site

Ouvrez votre navigateur et allez sur:
```
http://localhost:3000
```

## 🎬 Tester le Site

1. **Page d'accueil**: Découvrez le design moderne avec effets 3D
2. **S'inscrire**: Créez un compte (utilisez n'importe quel email)
3. **Catalogue**: Explorez les films disponibles
4. **Lecteur**: Cliquez sur un film pour voir le lecteur vidéo
5. **Abonnements**: Consultez les différents plans

## 🔑 Fonctionnalités Clés

- ✨ Design moderne avec animations 3D
- 🎥 Lecteur vidéo personnalisé
- 🔍 Recherche et filtrage de films
- 💳 Système d'abonnement (3 plans)
- 🔐 Authentification sécurisée
- 📱 100% Responsive

## 🛠️ Commandes Utiles

**Démarrer le serveur:**
```bash
npm start
```

**Arrêter le serveur:**
`Ctrl + C` dans le terminal

**Mode développement (avec rechargement auto):**
```bash
npm run dev
```
(Note: nécessite nodemon - installez avec `npm install -g nodemon`)

## 📱 Raccourcis Clavier (Lecteur Vidéo)

- `Espace` ou `K` = Play/Pause
- `→` = Avancer de 10 secondes
- `←` = Reculer de 10 secondes
- `↑` = Augmenter le volume
- `↓` = Diminuer le volume
- `F` = Plein écran
- `M` = Mute/Unmute

## 🎨 Personnalisation Rapide

### Changer les couleurs principales
Éditez `/public/css/style.css` ligne 1-8:
```css
:root {
    --primary: #e50914;    /* Couleur principale */
    --secondary: #f40612;   /* Couleur secondaire */
    --dark: #0a0a0a;       /* Fond sombre */
}
```

### Ajouter des films
Éditez `server.js` ligne 45-57 (section movies)

### Modifier le port
Éditez `server.js` ligne 11:
```javascript
const PORT = 3000;  // Changez à 8080 par exemple
```

## ⚠️ Problèmes Courants

**Le serveur ne démarre pas:**
- Vérifiez que Node.js est installé: `node --version`
- Vérifiez que le port 3000 n'est pas utilisé
- Réinstallez les dépendances: `npm install`

**Erreur "Cannot find module":**
```bash
npm install
```

**Le site ne s'affiche pas:**
- Vérifiez que le serveur est bien démarré
- Essayez: `http://127.0.0.1:3000`
- Videz le cache du navigateur (Ctrl+F5)

## 📁 Structure Simplifiée

```
streaming-site/
├── public/              # Tous les fichiers front-end (HTML, CSS, JS)
├── server.js            # Le serveur back-end
├── package.json         # Configuration et dépendances
└── README.md            # Documentation complète
```

## 🎯 Prochaines Étapes

1. ✅ Testez toutes les pages
2. 🎨 Personnalisez les couleurs et textes
3. 🎬 Ajoutez vos propres films
4. 💳 Configurez un vrai système de paiement (Stripe)
5. 🚀 Déployez en ligne (Vercel, Heroku, etc.)

## 💡 Astuce Pro

Pour un développement plus rapide, gardez toujours deux terminaux ouverts:
1. Terminal 1: Le serveur (`npm start`)
2. Terminal 2: Pour les commandes git, npm, etc.

## 🎉 C'est Tout !

Votre site de streaming moderne est opérationnel ! 

**Besoin d'aide?** Consultez le README.md complet dans le projet.

---

**Bon streaming ! 🍿**
