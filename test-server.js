const express = require('express');

console.log('🔧 Serveur de diagnostic Railway démarré...');

const app = express();
const PORT = process.env.PORT || 3000;

// Routes de diagnostic
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Serveur de diagnostic fonctionne'
    });
});

app.get('/env', (req, res) => {
    const envVars = {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL ? 'Présent (masqué)' : 'Absent',
        SESSION_SECRET: process.env.SESSION_SECRET ? 'Présent (masqué)' : 'Absent'
    };
    res.json(envVars);
});

app.get('/', (req, res) => {
    res.send(`
        <h1>🎬 Serveur de Test Railway</h1>
        <p><strong>Status:</strong> ✅ Fonctionne</p>
        <p><a href="/health">Health Check</a></p>
        <p><a href="/env">Variables d'Environnement</a></p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `);
});

// Gestion d'erreur globale
process.on('uncaughtException', (err) => {
    console.error('❌ Erreur non capturée:', err.message);
    console.error('Stack:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesse rejetée:', reason);
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`✅ Serveur de diagnostic démarré sur port ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`🗄️ Database URL: ${process.env.DATABASE_URL ? ' Présent' : ' Absent'}`);
    console.log(`🔐 Session Secret: ${process.env.SESSION_SECRET ? ' Présent' : ' Absent'}`);
});