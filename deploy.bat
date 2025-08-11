@echo off
echo ========================================
echo    Deploy do Sudoku para Firebase
echo ========================================
echo.

echo Verificando se Firebase CLI esta instalado...
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Firebase CLI nao encontrado!
    echo Instale com: npm install -g firebase-tools
    pause
    exit /b 1
)

echo Firebase CLI encontrado!
echo.

echo Fazendo login no Firebase...
firebase login

echo.
echo Fazendo deploy...
firebase deploy

echo.
echo ========================================
echo           Deploy Concluido!
echo ========================================
echo.
echo Sua aplicacao esta disponivel em:
firebase hosting:channel:list --only hosting 2>nul | findstr "Live Channel"

pause
