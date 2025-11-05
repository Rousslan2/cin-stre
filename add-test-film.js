const sqlite3 = require('sqlite3').verbose();

// Ouvrir la base de données
const db = new sqlite3.Database('./streaming.db', (err) => {
    if (err) {
        console.error('❌ Erreur connexion DB:', err);
        return;
    }
    console.log('✅ Connecté à la base de données\n');
});

// Code embed à insérer
const embedCode = '<iframe src="https://up4stream.com/embed-vf67ckmay1mq.html" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" width="720" height="430" allowfullscreen></iframe>';

// Insérer un film de test avec le code embed
db.run(`INSERT INTO movies (title, description, year, duration, genre, rating, poster, embed_code, premium) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
        'Test Embed Film',
        'Film de test pour vérifier que le code embed fonctionne correctement',
        2024,
        '1h 30min',
        'Test',
        8.5,
        'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
        embedCode,
        0 // Non premium
    ],
    function(err) {
        if (err) {
            console.error('❌ Erreur lors de l\'insertion:', err.message);
        } else {
            console.log('✅ Film de test ajouté avec succès !');
            console.log('   ID du film:', this.lastID);
            console.log('   Longueur du code embed:', embedCode.length, 'caractères');
            console.log('\n🎬 Vérification...\n');

            // Vérifier que le film a bien été inséré
            db.get(`SELECT id, title, LENGTH(embed_code) as embed_length, embed_code FROM movies WHERE id = ?`, 
                [this.lastID], 
                (err, row) => {
                    if (err) {
                        console.error('❌ Erreur vérification:', err);
                    } else if (row) {
                        console.log('✅ Film vérifié dans la DB:');
                        console.log('   ID:', row.id);
                        console.log('   Titre:', row.title);
                        console.log('   Longueur embed_code:', row.embed_length, 'caractères');
                        console.log('   Début du code:', row.embed_code.substring(0, 100) + '...');
                        console.log('\n🚀 Vous pouvez maintenant tester le film sur:');
                        console.log(`   http://localhost:3000/player.html?id=${row.id}`);
                    }

                    // Fermer la connexion
                    db.close();
                }
            );
        }
    }
);
