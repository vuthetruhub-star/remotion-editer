# D1A Motion Editor — Windows setup script
# Usage: iex (iwr "https://raw.githubusercontent.com/vuthetruhub-star/remotion-editer/main/scripts/setup.ps1").Content
# Or run locally: .\scripts\setup.ps1 [ProjectName]

param(
    [string]$ProjectName = "d1a-motion-editor"
)

$DownloadsPath = [Environment]::GetFolderPath("MyDocuments") -replace "Documents", "Downloads"
$TargetPath = Join-Path $DownloadsPath $ProjectName

Write-Host "D1A Motion Editor Setup" -ForegroundColor Green
Write-Host "Cloning into: $TargetPath" -ForegroundColor Cyan

if (Test-Path $TargetPath) {
    Write-Host "Folder already exists: $TargetPath" -ForegroundColor Yellow
    Write-Host "Delete it first or choose a different name." -ForegroundColor Yellow
    exit 1
}

Set-Location $DownloadsPath
git clone https://github.com/vuthetruhub-star/remotion-editer.git $ProjectName

if (-not $?) {
    Write-Host "Git clone failed." -ForegroundColor Red
    exit 1
}

Set-Location $TargetPath
pnpm install

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Run: pnpm dev" -ForegroundColor Cyan
Write-Host "Then open: http://localhost:3000/edit" -ForegroundColor Cyan
