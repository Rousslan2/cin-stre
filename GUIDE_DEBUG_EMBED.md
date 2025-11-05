# 🔍 GUIDE DE DÉBOGAGE - CODE EMBED NON SAUVEGARDÉ

## Étape 1 : Vérifier la base de données

Exécutez cette commande dans votre terminal :

```bash
node test-embed.js
```

Cela vous montrera si le code embed est bien sauvegardé dans la base de données.

---

## Étape 2 : Tester l'ajout d'un film avec embed

1. **Allez sur la page admin** : http://localhost:3000/admin.html
2. **Cliquez sur "Ajouter un film"**
3. **Remplissez UNIQUEMENT ces champs** :
   - Titre : `Test Embed`
   - Description : `Test de code embed`
   - Année : `2024`
   - Genre : `Test`
   - Code Embed : 
     ```html
     <iframe src="https://up4stream.com/embed-vf67ckmay1mq.html" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" width="720" height="430" allowfullscreen></iframe>
     ```
4. **Cliquez sur "Ajouter"**
5. **Ouvrez la console du navigateur** (F12) et regardez les erreurs

---

## Étape 3 : Vérifier la requête réseau

1. **Ouvrez les DevTools** (F12)
2. **Allez dans l'onglet "Network" (Réseau)**
3. **Ajoutez un nouveau film avec le code embed**
4. **Cherchez la requête** `/api/admin/movies` (POST)
5. **Cliquez dessus et regardez** :
   - **Payload (charge utile)** : Le code embed est-il présent ?
   - **Response (réponse)** : Y a-t-il une erreur ?

---

## Étape 4 : Si le code embed est bien envoyé mais pas sauvegardé

Le problème peut venir de :

### A. Limitation de taille SQLite

SQLite TEXT peut stocker jusqu'à 1 milliard de caractères, donc ce n'est normalement pas le problème.

### B. Caractères spéciaux non échappés

Le code contient des `<`, `>`, `"` qui peuvent poser problème. Mais avec les paramètres préparés (`?`), cela devrait fonctionner.

### C. SOLUTION RECOMMANDÉE : Encoder le code embed

**Modifiez votre fichier admin.js** pour encoder le code embed avant de l'envoyer :

```javascript
// Dans la fonction saveMovie(), avant fetch
const movieData = {
    title,
    description,
    year: parseInt(year),
    duration,
    genre,
    rating: parseFloat(rating) || 0,
    poster,
    trailer,
    video_url,
    // ENCODER LE CODE EMBED EN BASE64
    embed_code: embed_code ? btoa(encodeURIComponent(embed_code)) : '',
    premium: premiumCheckbox ? premiumCheckbox.checked : false
};
```

**Et modifiez player.js** pour décoder :

```javascript
// Dans loadMovieData(), quand on reçoit le film
if (movie.embed_code && movie.embed_code.trim()) {
    // DECODER LE CODE EMBED
    const decodedEmbed = decodeURIComponent(atob(movie.embed_code));
    console.log('✅ Code embed décodé:', decodedEmbed.substring(0, 100));
    showEmbedCode(decodedEmbed);
}
```

---

## Étape 5 : Vérifier que le film s'affiche

1. Allez sur la page des films : http://localhost:3000/movies.html
2. Cherchez le film "Test Embed"
3. Cliquez dessus
4. **Ouvrez la console** (F12) et regardez les messages :
   - `✅ Code embed détecté` = OK
   - `❌ Aucune source vidéo disponible` = Problème

---

## 🚨 SOLUTION RAPIDE SI RIEN NE FONCTIONNE

Si le code embed n'est toujours pas sauvegardé, créez un nouveau film MANUELLEMENT dans la base de données :

```bash
node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./streaming.db');

const embedCode = '<iframe src=\"https://up4stream.com/embed-vf67ckmay1mq.html\" frameborder=\"0\" width=\"720\" height=\"430\" allowfullscreen></iframe>';

db.run(\`INSERT INTO movies (title, description, year, genre, embed_code, premium) 
        VALUES (?, ?, ?, ?, ?, ?)\`,
    ['Test Manual Embed', 'Test d\\'ajout manuel', 2024, 'Test', embedCode, 0],
    function(err) {
        if (err) console.error('❌ Erreur:', err);
        else console.log('✅ Film ajouté avec ID:', this.lastID);
        db.close();
    }
);
"
```

---

## 📊 TABLEAU DE DIAGNOSTIC

| Symptôme | Cause probable | Solution |
|----------|---------------|----------|
| Console : "❌ Aucune source vidéo disponible" | Le code embed n'est pas sauvegardé dans la DB | Vérifier avec `test-embed.js` |
| Console : "✅ Code embed détecté" mais vidéo ne s'affiche pas | Le code embed est corrompu ou l'URL est invalide | Vérifier l'URL de l'iframe |
| Aucune erreur mais iframe vide | L'hébergeur bloque l'intégration iframe | Essayer un autre hébergeur |
| Erreur "mixed content" | HTTPS/HTTP mixé | Utiliser uniquement HTTPS |

---

## 📞 BESOIN D'AIDE ?

1. Exécutez `node test-embed.js`
2. Copiez le résultat
3. Montrez-le moi pour diagnostic précis !
