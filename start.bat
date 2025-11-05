@echo off
echo ========================================
echo    CINESTREAM - DEMARRAGE SERVEUR
echo ========================================
echo.

REM Aller dans le dossier du script
cd /d %~dp0

echo Verification des serveurs Node.js en cours...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Serveurs Node.js detectes, arret en cours...
    taskkill /F /IM node.exe >NUL 2>&1
    echo Anciens serveurs arretes
    timeout /t 2 >nul
) else (
    echo Aucun serveur en cours
)

echo.
echo Demarrage du serveur CineStream...
echo URL: http://localhost:3000
echo.
echo Pour arreter le serveur: Appuyez sur Ctrl+C
echo ========================================
echo.

npm start

pause
