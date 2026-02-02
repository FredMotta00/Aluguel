@echo off
REM Script para corrigir mapeamento de produtos BOS

echo Corrigindo mapeamento de produtos...

REM Backup
copy src\pages\Home.tsx src\pages\Home.tsx.bak

REM Substituir linha do preço (linha 93-97 vira uma linha)
powershell -Command "(Get-Content src\pages\Home.tsx) -replace 'const dailyRate = data\.rental\?\.dailyRate \|\|.*?100; \/\/ Fallback', 'const dailyRate = data.rentPrice || 0; // BOS price field' | Set-Content src\pages\Home.tsx"

REM Substituir linha do nome (linha 105)
powershell -Command "(Get-Content src\pages\Home.tsx) -replace 'nome: firstAccessory\.name \|\| data\.name \|\| data\.nome \|\| \"Equipamento\"', 'nome: (data.tags && data.tags[0]) || \"Equipamento\" // BOS uses tags for kit name' | Set-Content src\pages\Home.tsx"

echo Correção concluída!
pause
