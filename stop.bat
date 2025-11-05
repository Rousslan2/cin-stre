@echo off
echo ========================================
echo    CINESTREAM - ARRET SERVEUR
echo ========================================
echo.

echo Recherche des serveurs Node.js...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Serveurs Node.js trouves, arret en cours...
    taskkill /F /IM node.exe
    echo Tous les serveurs Node.js ont ete arretes
) else (
    echo Aucun serveur Node.js en cours d'execution
)

echo.
echo ========================================
pause
