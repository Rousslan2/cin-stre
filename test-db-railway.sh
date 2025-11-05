#!/bin/bash

# 🚀 SCRIPT DE TEST BASE DE DONNÉES RAILWAY
# Exécute ce script pour vérifier la configuration PostgreSQL

echo "🔍 DIAGNOSTIC BASE DE DONNÉES RAILWAY"
echo "====================================="

# Vérifier les variables d'environnement
echo "📋 VARIABLES RAILWAY:"
echo "DATABASE_URL: ${DATABASE_URL:+✅ PRÉSENTE} ${DATABASE_URL:-❌ ABSENTE}"
echo "PGHOST: ${PGHOST:+✅ PRÉSENTE} ${PGHOST:-❌ ABSENTE}"
echo "PGPORT: ${PGPORT:+✅ PRÉSENTE} ${PGPORT:-❌ ABSENTE}"
echo "PGUSER: ${PGUSER:+✅ PRÉSENTE} ${PGUSER:-❌ ABSENTE}"
echo "NODE_ENV: ${NODE_ENV:-Non définie}"
echo "SESSION_SECRET: ${SESSION_SECRET:+✅ PRÉSENTE} ${SESSION_SECRET:-❌ ABSENTE}"

echo ""
echo "🧪 TEST DE CONNEXION PostgreSQL..."

# Exécuter le test Node.js
node test-database-connection.js

echo ""
echo "🔧 SI ERREUR - ACTIONS REQUISES:"
echo "================================="
echo "1. Railway Dashboard → Database → New Database → PostgreSQL"
echo "2. Attendre 30 secondes pour génération DATABASE_URL"
echo "3. Redémarrer l'application Railway"
echo "4. Ajouter SESSION_SECRET et NODE_ENV si manquants"
echo ""
echo "📖 Voir aussi: DATABASE_URL_RAILWAY_CONFIG.md"