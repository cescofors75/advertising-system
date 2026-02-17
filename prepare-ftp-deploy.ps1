# PowerShell version of prepare-ftp-deploy.sh
# Stop on errors
$ErrorActionPreference = "Stop"

Write-Host "Building Next.js with standalone output..." -ForegroundColor Green
# npm install
npm run build

Write-Host "Preparing deployment folder..." -ForegroundColor Green

# Clean and create deployment folder
if (Test-Path "ftp-deploy") {
    Remove-Item -Recurse -Force "ftp-deploy"
}
New-Item -ItemType Directory -Path "ftp-deploy" -Force | Out-Null

# Copy standalone (includes minimal node_modules)
if (Test-Path ".next\standalone") {
    Copy-Item -Recurse ".next\standalone\*" "ftp-deploy\"
} else {
    Write-Host ".next\standalone folder not found. Make sure to run 'npm run build' first!" -ForegroundColor Red
    exit 1
}

# Copy static files
New-Item -ItemType Directory -Path "ftp-deploy\.next\static" -Force | Out-Null
if (Test-Path ".next\static") {
    Copy-Item -Recurse ".next\static\*" "ftp-deploy\.next\static\"
}

# Copy public folder if it exists
if (Test-Path "public") {
    Copy-Item -Recurse "public" "ftp-deploy\"
}

# Note: No need to copy full node_modules, standalone already includes minimal dependencies
Write-Host "Using standalone node_modules (already optimized)..." -ForegroundColor Green

Write-Host "Deploy folder ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Files to upload (ftp-deploy/ folder):" -ForegroundColor Cyan
Get-ChildItem "ftp-deploy" -Recurse | Measure-Object -Property Length -Sum | ForEach-Object {
    Write-Host "Total files: $($_.Count)"
    Write-Host "Total size: $([math]::Round($_.Sum / 1MB, 2)) MB"
}
Write-Host ""
Write-Host "Now upload ALL content from ftp-deploy/ to /site/wwwroot/ via FTP" -ForegroundColor Yellow
Write-Host ""
Write-Host "FTP Upload Instructions:" -ForegroundColor Green
Write-Host "1. Connect to your FTP server" -ForegroundColor White
Write-Host "2. Navigate to /site/wwwroot/" -ForegroundColor White
Write-Host "3. Upload ALL files from ftp-deploy/ folder" -ForegroundColor White
Write-Host "4. Make sure to upload the .next folder and all its contents" -ForegroundColor White
Write-Host "5. Set Node.js to run: node server.js" -ForegroundColor White
