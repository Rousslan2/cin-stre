const { Client } = require('pg');
require('dotenv').config();

async function testDatabaseConnection() {
    console.log('🔍 TEST DE CONNEXION BASE DE DONNÉES RAILWAY\n');
    
    // Vérifier toutes les variables d'environnement
    console.log('📋 VARIABLES D\'ENVIRONNEMENT DISPONIBLES:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Présente' : '❌ Absente');
    console.log('PGHOST:', process.env.PGHOST ? '✅ Présente' : '❌ Absente');
    console.log('PGPORT:', process.env.PGPORT ? '✅ Présente' : '❌ Absente');
    console.log('PGUSER:', process.env.PGUSER ? '✅ Présente' : '❌ Absente');
    console.log('PGPASSWORD:', process.env.PGPASSWORD ? '✅ Présente' : '❌ Absente');
    console.log('PGDATABASE:', process.env.PGDATABASE ? '✅ Présente' : '❌ Absente');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'Non définie');
    console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ Présente' : '❌ Absente\n');
    
    // Vérifier la connexion si DATABASE_URL existe
    if (process.env.DATABASE_URL) {
        console.log('🌐 TEST DE CONNEXION PostgreSQL...');
        
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        try {
            await client.connect();
            console.log('✅ Connexion PostgreSQL RÉUSSIE !');
            
            // Test simple requête
            const result = await client.query('SELECT NOW()');
            console.log('📅 Date/Heure serveur DB:', result.rows[0].now);
            
            // Vérifier si les tables existent
            const tablesResult = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            `);
            
            console.log('📊 TABLES EXISTANTES:', tablesResult.rows.length > 0 ? tablesResult.rows.map(r => r.table_name) : 'Aucune');
            
            await client.end();
            console.log('🎯 BASE DE DONNÉES CONFIGURÉE CORRECTEMENT !\n');
            
        } catch (error) {
            console.log('❌ ERREUR DE CONNEXION PostgreSQL:');
            console.log('Code:', error.code);
            console.log('Message:', error.message);
            
            if (error.code === 'ECONNREFUSED') {
                console.log('\n🚨 PROBLÈME: PostgreSQL non accessible');
                console.log('SOLUTION: Créer base de données PostgreSQL sur Railway Dashboard');
            } else if (error.code === 'ENOTFOUND') {
                console.log('\n🚨 PROBLÈME: HOST non trouvé');
                console.log('SOLUTION: Vérifier DATABASE_URL dans variables Railway');
            } else if (error.message.includes('invalid')) {
                console.log('\n🚨 PROBLÈME: DATABASE_URL invalide');
                console.log('SOLUTION: Régénérer DATABASE_URL sur Railway Dashboard');
            }
        }
    } else {
        console.log('❌ ERREUR CRITIQUE: DATABASE_URL ABSENTE');
        console.log('\n🚨 SOLUTION OBLIGATOIRE:');
        console.log('1. Aller sur Railway Dashboard');
        console.log('2. Onglet "Database" → "New Database" → "PostgreSQL"');
        console.log('3. Créer DB PostgreSQL');
        console.log('4. Attendre 30 secondes');
        console.log('5. Redémarrer l\'application\n');
    }
}

testDatabaseConnection();