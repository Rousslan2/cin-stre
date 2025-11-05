# 🎬 GUIDE SIMPLE - Upload de Vidéos MP4

## 📋 Étapes Simples

### 1️⃣ Ouvrir le Panneau Admin
```
1. Va sur: http://localhost:3000/admin.html
2. Connecte-toi avec:
   Email: admin@cinestream.com
   Mot de passe: admin123
```

### 2️⃣ Ajouter un Film
```
1. Clique sur "Films" dans le menu de gauche
2. Clique sur le bouton bleu "+ Ajouter un film"
```

### 3️⃣ Remplir les Infos du Film
```
✏️ Titre: Le nom du film
✏️ Année: 2024
✏️ Description: Synopsis du film
✏️ Genre: Action, Comédie, etc.
✏️ Durée: 2h 15min
✏️ URL Affiche: https://image.tmdb.org/...
✏️ Note: 8.5
```

### 4️⃣ Choisir Comment Ajouter la Vidéo

Il y a **3 OPTIONS** (onglets en haut) :

---

## 🎯 OPTION 1: Code Embed (⭐ RECOMMANDÉ)

**Pour:** Vidéos hébergées sur UpToStream, StreamTape, etc.

```
1. Clique sur l'onglet "📄 Code Embed"
2. Colle le code iframe complet:
   
   <iframe src='https://uptostream.com/embed-xxxxx.html' 
           frameborder='0' 
           allowfullscreen>
   </iframe>

3. C'est tout ! ✅
```

**Avantages:** Pas de limite de taille, streaming rapide

---

## 🎯 OPTION 2: URL Directe + Upload (💾 UPLOAD MP4)

**Pour:** Uploader un fichier MP4 depuis ton PC

### Voici ce que tu vas voir :

```
┌─────────────────────────────────────────────────┐
│ 🎥 URL de la vidéo (remplie automatiquement)   │
│ ┌─────────────────────────────────────────────┐ │
│ │ https://example.com/film.mp4 OU sera auto...│ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
            ⬇️ CHOISISSEZ UNE OPTION ⬇️

┌─────────────────────────────────────────────────┐
│ 📤 OPTION 1: Uploader depuis ton ordinateur    │
│ ┌─────────────────────────────────────────────┐ │
│ │      ☁️                                      │ │
│ │ Glisse ton fichier MP4 ici                  │ │
│ │           ou                                 │ │
│ │    [📁 Parcourir mes fichiers]              │ │
│ │                                              │ │
│ │ Formats: MP4, WebM, OGG (max 500MB)         │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                      OU
┌─────────────────────────────────────────────────┐
│ 🔗 OPTION 2: Entrer une URL directe            │
│ Si ton fichier est déjà hébergé ailleurs       │
│    [✏️ Entrer l'URL manuellement]              │
└─────────────────────────────────────────────────┘
```

### Pour UPLOADER un fichier MP4 :

```
1. Clique sur l'onglet "🔗 URL Directe"

2. Tu verras le champ "URL de la vidéo" EN HAUT
   (Il sera rempli automatiquement après l'upload)

3. DESCENDS jusqu'à la section bleue:
   "📤 OPTION 1: Uploader depuis ton ordinateur"

4. DEUX FAÇONS de faire:
   
   A) Glisse-dépose ton fichier MP4 dans la zone
   B) Clique sur "📁 Parcourir mes fichiers"
   
5. Sélectionne ton fichier MP4 (max 500MB)

6. Tu verras:
   ✅ nom_fichier.mp4 (15 MB) - Prêt pour l'upload
   
7. IMPORTANT: Le fichier n'est PAS ENCORE uploadé !
   Il sera uploadé quand tu cliques sur "Ajouter le film"

8. L'URL sera automatiquement remplie:
   ┌─────────────────────────────────────────────┐
   │ ℹ️ Vidéo prête: /uploads/video-12345.mp4   │
   └─────────────────────────────────────────────┘
```

### Ce qui se passe quand tu cliques "Ajouter le film" :

```
1. ⏳ Upload en cours... (message bleu)
2. ⏳ Le fichier s'uploade (peut prendre du temps)
3. ✅ Fichier uploadé avec succès! (message vert)
4. ✅ L'URL a été remplie automatiquement
5. ✅ Film ajouté à la base de données
```

---

## 🎯 OPTION 3: YouTube

**Pour:** Intégrer une vidéo YouTube directement

```
1. Clique sur l'onglet "▶️ YouTube"
2. Colle l'URL YouTube:
   https://www.youtube.com/watch?v=VIDEO_ID
3. C'est tout ! ✅
```

---

## ❓ Questions Fréquentes

### "Je ne vois pas mon fichier uploadé"
👉 L'upload se fait quand tu cliques sur "Ajouter le film"
👉 Attends le message vert "Fichier uploadé avec succès!"
👉 Regarde le champ "URL de la vidéo" - il sera rempli

### "Où est mon fichier après upload ?"
👉 Dans le dossier: `public/uploads/`
👉 Nom automatique: `video-1234567890-987654321.mp4`
👉 Accessible via: `/uploads/video-...mp4`

### "Mon fichier est trop gros (>500MB)"
👉 Solution 1: Compresse ton fichier MP4
👉 Solution 2: Utilise un hébergeur externe (UpToStream, etc.)
👉 Solution 3: Utilise YouTube

### "Le champ URL reste vide"
👉 Vérifie la console (F12) pour les erreurs
👉 Vérifie que tu es connecté en tant qu'admin
👉 Attends que l'upload soit terminé (message vert)

### "Comment voir si ça marche ?"
```
1. Ouvre la console (F12)
2. Tu verras:
   Début de l'upload du fichier: myvideo.mp4 video/mp4 15728640 bytes
   Réponse upload reçue, status: 200
   ✅ Fichier uploadé avec succès: /uploads/video-1234.mp4
   ✅ URL de la vidéo affichée: /uploads/video-1234.mp4
```

---

## 🎨 Résumé Visuel

```
AVANT L'UPLOAD:
┌─────────────────────────────────┐
│ URL: [vide ou manuel]           │
│                                 │
│ 📤 UPLOADER UN FICHIER         │
│  ┌────────────────────────┐    │
│  │ Glisse ton MP4 ici     │    │
│  └────────────────────────┘    │
└─────────────────────────────────┘

APRÈS LA SÉLECTION:
┌─────────────────────────────────┐
│ URL: [vide - sera rempli]       │
│                                 │
│ ✅ video.mp4 (15 MB)           │
│    Prêt pour l'upload          │
└─────────────────────────────────┘

APRÈS L'UPLOAD (clic sur "Ajouter"):
┌─────────────────────────────────┐
│ URL: /uploads/video-123.mp4     │
│ ℹ️ Vidéo prête: /uploads/...   │
│                                 │
│ ✅ video.mp4 (15 MB)           │
└─────────────────────────────────┘
```

---

## 🚀 Démarrage Rapide

**EN 30 SECONDES:**

1. Ouvre admin → Films → Ajouter un film
2. Remplis titre, année, description, genre
3. Va dans "URL Directe"
4. Glisse ton MP4 dans la zone bleue
5. Clique "Ajouter le film"
6. ✅ Attends le message vert
7. ✅ Ton film est ajouté !

**FINI !** 🎉

---

**Tu as encore des questions ?**
Ouvre la console (F12) pour voir les logs détaillés !
