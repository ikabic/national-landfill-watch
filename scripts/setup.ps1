# scripts/setup.ps1
Param()

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$clientDir = Join-Path $root "client"
$serverDir = Join-Path $root "server"
$seedFile = Join-Path $root "scripts\seed.sql"

Write-Host "== National Landfill Watch — setup script (PowerShell) =="
Write-Host "Root: $root"

# Check for node & npm
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "node not found. Install Node.js (https://nodejs.org/) then re-run."
    exit 1
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm not found. Install Node.js/npm then re-run."
    exit 1
}

# Check for dotnet
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Error ".NET CLI not found. Install .NET SDK then re-run."
    exit 1
}

# Frontend install
if (Test-Path $clientDir) {
    Write-Host "-> Installing frontend dependencies..."
    Push-Location $clientDir
    npm install
    Pop-Location
} else {
    Write-Warning "client folder not found at $clientDir"
}

# Backend restore/build
if (Test-Path $serverDir) {
    Write-Host "-> Restoring and building backend..."
    Push-Location $serverDir
    dotnet restore
    dotnet build
    Pop-Location
} else {
    Write-Warning "server folder not found at $serverDir"
}

# Seed DB (optional)
if (Get-Command psql -ErrorAction SilentlyContinue) {
    $choice = Read-Host "Execute DB seed script to create landfill_db and insert stub data? (will prompt for postgres password) [Y/n]"
    if ($choice -eq "" -or $choice -match '^[Yy]') {
        Write-Host "Executing seed script via psql -U postgres -f $seedFile"
        psql -U postgres -f $seedFile
        Write-Host "DB seeded."
    } else {
        Write-Host "Skipping DB seed."
    }
} else {
    Write-Warning "psql not found in PATH — skipping DB seed step. You can run scripts/seed.sql manually via psql or pgAdmin."
}

Write-Host ""
Write-Host "Setup finished. Next steps:"
Write-Host " - Start backend: cd server && dotnet run"
Write-Host " - Start frontend: cd client && npm start"
