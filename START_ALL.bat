@echo off
echo ============================================
echo   NeuroMarket 2.0 - Iniciando todos los servicios
echo ============================================

set BASE=C:\Users\heria\OneDrive\Documentos\ProyectoG\Social Listening\Social Listening v2

echo [1/3] Iniciando Python Engine (puerto 5000)...
start "NeuroMarket Engine :5000" cmd /k "cd /d "%BASE%\engine" && python main.py"

timeout /t 3 /nobreak >nul

echo [2/3] Iniciando Node.js API (puerto 3000)...
start "NeuroMarket API :3000" cmd /k "cd /d "%BASE%\server-api" && node src/index.js"

timeout /t 2 /nobreak >nul

echo [3/3] Iniciando Frontend React (puerto 5173)...
start "NeuroMarket Frontend :5173" cmd /k "cd /d "%BASE%\web-portal" && npm run dev"

echo.
echo =============================================
echo  Servicios levantados. Mantén estas ventanas
echo  abiertas mientras usas la plataforma.
echo  Abre: http://localhost:5173
echo =============================================
pause
