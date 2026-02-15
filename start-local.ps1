# Deploy local - MelhorPreço.net (Windows PowerShell)
# Execute no terminal: .\start-local.ps1

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "MelhorPreco.net - Deploy local" -ForegroundColor Cyan
Write-Host ""

# 1. Docker: subir Postgres + Redis (se Docker estiver instalado)
try {
    $docker = Get-Command docker -ErrorAction SilentlyContinue
    if ($docker) {
        Write-Host "Docker encontrado. Iniciando Postgres e Redis..." -ForegroundColor Yellow
        docker-compose up -d 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Aguardando Postgres ficar pronto (5s)..." -ForegroundColor Gray
            Start-Sleep -Seconds 5
        }
    }
} catch {
    Write-Host "Docker nao encontrado ou erro. Se nao tiver Postgres/Redis, inicie manualmente." -ForegroundColor Yellow
}

# 2. Prisma
Write-Host ""
Write-Host "Gerando cliente Prisma e aplicando schema..." -ForegroundColor Yellow
npx prisma generate
npx prisma db push

# 3. Servidor
Write-Host ""
Write-Host "Iniciando servidor de desenvolvimento..." -ForegroundColor Green
Write-Host "Acesse: http://localhost:3000" -ForegroundColor Green
Write-Host ""
npm run dev
