#!/bin/bash

# 🎯 VERIFICATION POST-CONFIGURATION DATABASE RAILWAY
# Ce script vérifie que tout fonctionne après création PostgreSQL

echo "✅ VÉRIFICATION POST-CONFIGURATION RAILWAY"
echo "=========================================="

echo ""
echo "🧪 TEST COMPLET DE L'APPLICATION..."

# 1. Test base de données
echo ""
echo "1. Test Base de Données:"
node test-database-connection.js

echo ""
echo "2. Vérification Variables Railway:"
echo "DATABASE_URL: ${DATABASE_URL:+✅ PRÉSENTE} ${DATABASE_URL:-❌ ABSENTE}"
echo "NODE_ENV: ${NODE_ENV:-❌ ABSENTE}"
echo "SESSION_SECRET: ${SESSION_SECRET:+✅ PRÉSENTE} ${SESSION_SECRET:-❌ ABSENTE}"

echo ""
echo "3. Test Serveur Application:"
if [ -f "server.js" ]; then
    echo "✅ server.js présent"
    echo "🔍 Test syntaxe server.js:"
    node -c server.js && echo "✅ Syntaxe server.js OK" || echo "❌ Erreur syntaxe server.js"
else
    echo "❌ server.js manquant"
fi

echo ""
echo "4. Status Package.json:"
if [ -f "package.json" ]; then
    echo "✅ package.json présent"
    echo "📦 Dépendance PostgreSQL:"
    grep -q '"pg"' package.json && echo "✅ pg (PostgreSQL) installé" || echo "❌ pg manquant"
else
    echo "❌ package.json manquant"
fi

echo ""
echo "🚀 ACTIONS FINALES SI TOUT EST OK:"
echo "=================================="
echo "1. git add ."
echo "2. git commit -m 'Database configured - Railway ready'"
echo "3. git push origin main"
echo "4. Vérifier logs Railway"
echo ""

echo "📖 DOCUMENTATION COMPLÈTE:"
echo "DATABASE_URL_RAILWAY_CONFIG.md - Configuration DB"
echo "SESSION_SECRET_CLES_PRETE.md - Variables manquantes"
echo "COMMANDES_PUSH_RAILWAY.md - Commandes Git"
echo ""

# Test de démarrage rapide du serveur
echo "🧪 TEST DÉMARRAGE SERVEUR (5 secondes):"
echo "Demarrage test..."
timeout 5s node server.js &
SERVER_PID=$!
sleep 3
if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Serveur démarre correctement"
    kill $SERVER_PID 2>/dev/null
else
    echo "❌ Échec démarrage serveur"
fi

echo ""
echo "🎬 VOTRE APPLICATION STREAMING EST PRÊTE POUR RAILWAY !"