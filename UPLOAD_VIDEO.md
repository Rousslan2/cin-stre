# 🎬 Guide d'Upload de Vidéos MP4

## ✅ Problèmes corrigés

1. ✅ Ajout du middleware `requireAdmin` pour sécuriser l'upload
2. ✅ Gestion des erreurs Multer avec messages clairs
3. ✅ Amélioration des logs de débogage côté client
4. ✅ Ajout d'un feedback visuel pendant l'upload
5. ✅ Support de multiples formats vidéo (MP4, WebM, OGG, AVI, MKV)

## 📋 Comment uploader un fichier MP4

### 1. Connexion Admin
- Connectez-vous avec un compte administrateur
- URL: http://localhost:3000/admin.html
- Par défaut: admin@cinestream.com / admin123

### 2. Ajouter un film
1. Cliquez sur **"Films"** dans le menu latéral
2. Cliquez sur le bouton **"+ Ajouter un film"**
3. Remplissez les informations du film:
   - Titre
   - Année
   - Description
   - Genre
   - Durée
   - Poster (URL de l'image)
   - Note

### 3. Options vidéo disponibles

#### Option A: Code Embed (Recommandé)
- Collez le code iframe d'un hébergeur vidéo
- Exemple: YouTube, Vimeo, Dailymotion, etc.

#### Option B: URL Directe + Upload
1. **Upload de fichier local:**
   - Cliquez sur la zone d'upload ou glissez-déposez votre fichier
   - Formats acceptés: MP4, WebM, OGG, AVI, MKV
   - Taille max: 500MB
   - Le fichier sera uploadé automatiquement

2. **URL directe:**
   - Entrez l'URL d'une vidéo hébergée
   - Exemple: https://example.com/videos/film.mp4

#### Option C: YouTube
- Collez l'URL YouTube complète
- Exemple: https://www.youtube.com/watch?v=...

### 4. Valider
- Cochez "Premium" si le film nécessite un abonnement
- Cliquez sur **"Ajouter le film"**

## 🔧 Paramètres techniques

### Configuration Multer
```javascript
Taille max: 500MB
Formats: .mp4, .webm, .ogg, .avi, .mkv
Dossier: public/uploads/
```

### Structure des fichiers uploadés
```
public/
└── uploads/
    └── video-1699123456789-987654321.mp4
```

### URL d'accès
Les fichiers uploadés sont accessibles via:
```
/uploads/video-[timestamp]-[random].mp4
```

## ⚠️ Important

1. **Permissions:** Seuls les administrateurs peuvent uploader
2. **Taille:** Limite de 500MB par fichier
3. **Format:** Privilégiez MP4 pour la compatibilité
4. **Hébergement:** Pour les gros fichiers, utilisez un hébergeur externe

## 🐛 Débogage

### Vérifier les logs
Ouvrez la console du navigateur (F12) pour voir:
- Les informations du fichier sélectionné
- La progression de l'upload
- Les éventuelles erreurs

### Messages d'erreur courants

| Erreur | Solution |
|--------|----------|
| "Non authentifié" | Connectez-vous avec un compte admin |
| "Fichier trop volumineux" | Réduisez la taille (max 500MB) |
| "Format non supporté" | Utilisez MP4, WebM, OGG, AVI ou MKV |
| "Erreur lors de l'upload" | Vérifiez les permissions du dossier uploads |

## 🎯 Conseils

1. **Optimisez vos vidéos** avant upload:
   - Utilisez H.264 pour MP4
   - Résolution recommandée: 720p ou 1080p
   - Bitrate: 2-5 Mbps

2. **Pour les gros fichiers:**
   - Utilisez un hébergeur externe (Vimeo, AWS S3, etc.)
   - Collez l'URL dans "URL Directe"

3. **Pour YouTube:**
   - Uploadez sur YouTube
   - Utilisez l'option "YouTube" avec l'URL

## 📞 Support

Si vous rencontrez des problèmes:
1. Vérifiez la console du navigateur
2. Vérifiez les logs du serveur
3. Assurez-vous que le dossier `public/uploads` existe et est accessible

## 🔄 Redémarrer le serveur

Après les modifications, redémarrez le serveur:
```bash
# Windows
.\start.bat

# Ou manuellement
node server.js
```

---

**Date de mise à jour:** 5 novembre 2025
**Version:** 1.1
