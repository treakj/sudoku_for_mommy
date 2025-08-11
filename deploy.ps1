# Script de Deploy para Firebase - Sudoku Game
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Deploy do Sudoku para Firebase" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Verificando se Firebase CLI está instalado..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version 2>$null
    Write-Host "Firebase CLI encontrado: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Firebase CLI não encontrado!" -ForegroundColor Red
    Write-Host "Instale com: npm install -g firebase-tools" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "Fazendo login no Firebase..." -ForegroundColor Yellow
firebase login

Write-Host ""
Write-Host "Fazendo deploy..." -ForegroundColor Yellow
firebase deploy

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "           Deploy Concluído!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Para ver informações do projeto:" -ForegroundColor Cyan
Write-Host "firebase projects:list" -ForegroundColor White
Write-Host ""
Write-Host "Para ver informações de hosting:" -ForegroundColor Cyan
Write-Host "firebase hosting:sites:list" -ForegroundColor White

Read-Host "Pressione Enter para sair"
