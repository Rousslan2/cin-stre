const sqlite3 = require('sqlite3').verbose();

// Ouvrir la base de données
const db = new sqlite3.Database('./streaming.db', (err) => {
    if (err) {
        console.error('❌ Erreur connexion DB:', err);
        return;
    }
    console.log('✅ Connecté à la base de données\n');
});

// Vérifier les films avec embed_code
db.all(`SELECT id, title, CASE 
    WHEN embed_code IS NULL THEN 'NULL'
    WHEN embed_code = '' THEN 'VIDE'
    WHEN LENGTH(embed_code) < 50 THEN 'TROP COURT (' || LENGTH(embed_code) || ' chars)'
    ELSE 'OK (' || LENGTH(embed_code) || ' chars)'
END as embed_status,
SUBSTR(embed_code, 1, 100) as embed_preview
FROM movies ORDER BY id`, [], (err, rows) => {
    if (err) {
        console.error('❌ Erreur requête:', err);
        db.close();
        return;
    }

    console.log('📊 STATUT DES CODES EMBED DANS LA BASE DE DONNÉES\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    rows.forEach(row => {
        console.log(`🎬 Film #${row.id}: ${row.title}`);
        console.log(`   Status: ${row.embed_status}`);
        if (row.embed_preview && row.embed_preview !== 'NULL') {
            console.log(`   Début: ${row.embed_preview}...`);
        }
        console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════\n');

    // Fermer la connexion
    db.close((err) => {
        if (err) {
            console.error('❌ Erreur fermeture DB:', err);
        } else {
            console.log('✅ Connexion fermée');
        }
    });
});
