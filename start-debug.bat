@echo off
echo ========================================
echo    CINESTREAM - DEMARRAGE
echo ========================================
echo.

cd /d %~dp0

echo Arret des anciens serveurs...
taskkill /F /IM node.exe 2>nul
timeout /t 1 >nul

echo.
echo Demarrage du serveur...
echo URL: http://localhost:3000
echo.
echo Appuyez sur Ctrl+C pour arreter
echo ========================================
echo.

node server.js

echo.
echo ========================================
echo ERREUR: Le serveur s'est arrete
echo ========================================
pause
