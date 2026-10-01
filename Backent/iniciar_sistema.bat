@echo off
title Sistema HyS Control - Servidor Local
set "PHP_PATH=C:\Users\murqu\.gemini\antigravity\scratch\php82"
set "PATH=%PHP_PATH%;%PATH%"

echo ========================================================
echo   SISTEMA DE GESTION DE HIGIENE Y SEGURIDAD LABORAL (HyS Control)
echo ========================================================
echo.
echo Iniciando servidor local en http://127.0.0.1:8000 ...
echo Credenciales de prueba:
echo   - Administrador: admin@seguridad.local (password: password)
echo   - Inspector:    inspector@seguridad.local (password: password)
echo.
echo Abriendo navegador web...
start http://127.0.0.1:8000
"%PHP_PATH%\php.exe" artisan serve --port=8000
pause
