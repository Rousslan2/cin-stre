@echo off
cd /d %~dp0
taskkill /F /IM node.exe 2>nul
timeout /t 1 >nul
cls
echo CINESTREAM - Serveur demarre sur http://localhost:3000
echo Appuyez sur Ctrl+C pour arreter
echo.
npm start
pause
