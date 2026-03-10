@echo off
echo ========================================
echo   NeuroMarket 2.0 - Bootstrap Script
echo ========================================
echo.
cd /d "%~dp0"
python bootstrap.py
echo.
echo ========================================
echo   Presiona cualquier tecla para cerrar
echo ========================================
pause > nul
