// Script de vérification du système d'upload
const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification du système d\'upload...\n');

// 1. Vérifier le dossier uploads
const uploadsDir = path.join(__dirname, 'public', 'uploads');
console.log('📁 Vérification du dossier uploads...');
if (fs.existsSync(uploadsDir)) {
    console.log('✅ Le dossier public/uploads existe');
    
    // Vérifier les permissions
    try {
        fs.accessSync(uploadsDir, fs.constants.W_OK | fs.constants.R_OK);
        console.log('✅ Permissions de lecture/écriture OK');
    } catch (err) {
        console.log('❌ ERREUR: Permissions insuffisantes sur le dossier uploads');
        console.log('   Solution: Vérifiez les permissions du dossier');
    }
} else {
    console.log('⚠️  Le dossier uploads n\'existe pas');
    console.log('   Création du dossier...');
    try {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('✅ Dossier uploads créé avec succès');
    } catch (err) {
        console.log('❌ ERREUR lors de la création:', err.message);
    }
}

// 2. Vérifier les dépendances
console.log('\n📦 Vérification des dépendances...');
const dependencies = ['multer', 'express', 'sqlite3', 'bcryptjs'];
let allDepsOk = true;

dependencies.forEach(dep => {
    try {
        require.resolve(dep);
        console.log(`✅ ${dep} installé`);
    } catch (err) {
        console.log(`❌ ${dep} manquant`);
        allDepsOk = false;
    }
});

if (!allDepsOk) {
    console.log('\n⚠️  Installez les dépendances manquantes avec:');
    console.log('   npm install');
}

// 3. Vérifier la configuration Multer dans server.js
console.log('\n⚙️  Vérification de la configuration...');
const serverJs = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');

if (serverJs.includes('requireAdmin') && serverJs.includes('upload.single')) {
    console.log('✅ Configuration Multer correcte');
} else {
    console.log('⚠️  Configuration Multer à vérifier');
}

if (serverJs.includes('multer.MulterError')) {
    console.log('✅ Gestion des erreurs Multer OK');
} else {
    console.log('⚠️  Gestion des erreurs à améliorer');
}

// 4. Résumé
console.log('\n' + '='.repeat(50));
console.log('📊 RÉSUMÉ');
console.log('='.repeat(50));

if (fs.existsSync(uploadsDir) && allDepsOk) {
    console.log('✅ Système d\'upload prêt à l\'emploi!');
    console.log('\n🚀 Pour démarrer le serveur:');
    console.log('   node server.js');
    console.log('   ou: .\\start.bat (Windows)');
    console.log('\n🔐 Connexion admin:');
    console.log('   Email: admin@cinestream.com');
    console.log('   Mot de passe: admin123');
} else {
    console.log('⚠️  Configuration incomplète');
    console.log('   Consultez UPLOAD_VIDEO.md pour plus de détails');
}

console.log('='.repeat(50) + '\n');
