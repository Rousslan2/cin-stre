const sqlite3 = require('sqlite3').verbose();

console.log('========================================');
console.log('  MIGRATION - AJOUT COLONNE EMBED_CODE');
console.log('========================================\n');

// Ouvrir la base de données
const db = new sqlite3.Database('./streaming.db', (err) => {
    if (err) {
        console.error('❌ Erreur connexion DB:', err);
        process.exit(1);
    }
    console.log('✅ Connecté à la base de données\n');
});

// Vérifier si la colonne existe déjà
db.get(`PRAGMA table_info(movies)`, [], (err, row) => {
    if (err) {
        console.error('❌ Erreur vérification table:', err);
        db.close();
        return;
    }

    // Vérifier toutes les colonnes
    db.all(`PRAGMA table_info(movies)`, [], (err, columns) => {
        if (err) {
            console.error('❌ Erreur lecture colonnes:', err);
            db.close();
            return;
        }

        console.log('📋 Colonnes actuelles de la table movies:');
        columns.forEach(col => {
            console.log(`   - ${col.name} (${col.type})`);
        });
        console.log('');

        // Vérifier si embed_code existe
        const hasEmbedCode = columns.some(col => col.name === 'embed_code');

        if (hasEmbedCode) {
            console.log('✅ La colonne embed_code existe déjà !\n');
            console.log('La base de données est à jour.');
            db.close();
        } else {
            console.log('⚠️  La colonne embed_code n\'existe PAS\n');
            console.log('🔧 Ajout de la colonne embed_code...\n');

            // Ajouter la colonne
            db.run(`ALTER TABLE movies ADD COLUMN embed_code TEXT`, (err) => {
                if (err) {
                    console.error('❌ Erreur ajout colonne:', err);
                    db.close();
                    return;
                }

                console.log('✅ Colonne embed_code ajoutée avec succès !\n');
                
                // Vérifier que ça a marché
                db.all(`PRAGMA table_info(movies)`, [], (err, newColumns) => {
                    if (err) {
                        console.error('❌ Erreur vérification:', err);
                    } else {
                        console.log('📋 Nouvelles colonnes de la table movies:');
                        newColumns.forEach(col => {
                            const indicator = col.name === 'embed_code' ? ' ← NOUVEAU!' : '';
                            console.log(`   - ${col.name} (${col.type})${indicator}`);
                        });
                        console.log('');
                        console.log('========================================');
                        console.log('✅ MIGRATION TERMINÉE AVEC SUCCÈS !');
                        console.log('========================================');
                        console.log('\nVous pouvez maintenant:');
                        console.log('1. Redémarrer votre serveur (start.bat)');
                        console.log('2. Ajouter des films avec codes embed');
                        console.log('3. Tester avec: node add-test-film.js\n');
                    }
                    db.close();
                });
            });
        }
    });
});
