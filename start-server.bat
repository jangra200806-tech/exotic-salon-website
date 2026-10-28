@echo off
title Exotic Salon - Local Server
cd /d "%~dp0"
echo.
echo   Starting Exotic Salon...
echo   Browser me kholo:  http://localhost:5500
echo.
start "" "http://localhost:5500"
node --env-file-if-exists=.env serve.js 5500
pause
