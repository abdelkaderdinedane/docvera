param([switch]$Apply)

$ErrorActionPreference = "Stop"
$repoRoot = (Get-Location).Path
$localePath = Join-Path $repoRoot "src-ui\src\locale"
$backupDir = Join-Path $repoRoot ".locale-backup"

if (-not (Test-Path $localePath)) {
    Write-Host "ERROR: Locale directory not found: $localePath" -ForegroundColor Red
    exit 1
}

$rules = @()
$rules += ,@('(?<=>)Paperless-ngx(?=<)', 'Docvera')
$rules += ,@('Paperless-ngx is running', 'Docvera is running')
$rules += ,@('configure Paperless-ngx', 'configure Docvera')
$rules += ,@('Paperless-ngx community', 'Docvera community')
$rules += ,@('welcome to Paperless-ngx', 'welcome to Docvera')
$rules += ,@('Welcome to Paperless-ngx', 'Welcome to Docvera')
$rules += ,@('Paperless will only process', 'Docvera will only process')
$rules += ,@('Paperless-ngx can automatically', 'Docvera can automatically')
$rules += ,@('Paperless-ngx Version', 'Docvera Version')
$rules += ,@('the Paperless-ngx PDF viewer', 'the Docvera PDF viewer')
$rules += ,@('added to Paperless-ngx', 'added to Docvera')
$rules += ,@('processed by Paperless-ngx', 'processed by Docvera')
$rules += ,@('thank you for using Paperless-ngx', 'thank you for using Docvera')
$rules += ,@('behavior of Paperless-ngx', 'behavior of Docvera')
$rules += ,@('install of Paperless-ngx', 'install of Docvera')
$rules += ,@('Paperless-ngx will start training', 'Docvera will start training')
$rules += ,@('Paperless will only process', 'Docvera will only process')

$guards = @('https?://', 'docs\.paperless-ngx\.com', 'github\.com/paperless-ngx', 'paperless-input-', 'PAPERLESS_[A-Z_]+', 'paperless_(mail|tesseract|text|tika)', 'Paperless(Task|Config|User)', '<context', 'src/app/', 'src-ui/')

$mode = "DRY RUN"
if ($Apply) { $mode = "APPLY" }

Write-Host ""
Write-Host "Docvera Locale Branding Pass - $mode" -ForegroundColor Cyan
Write-Host "Rules: $($rules.Count)  Guards: $($guards.Count)" -ForegroundColor Cyan
Write-Host ""

if ($Apply) {
    if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir | Out-Null }
}

$files = Get-ChildItem -Path $localePath -Filter "*.xlf" -File | Sort-Object Name
$totalFiles = 0
$totalReplacements = 0

foreach ($file in $files) {
    $original = [System.IO.File]::ReadAllText($file.FullName)
    $lines = $original -split "`n"
    $fileReplacements = 0
    $newLines = New-Object System.Collections.ArrayList

    foreach ($line in $lines) {
        $newLine = $line
        $isGuarded = $false
        foreach ($guard in $guards) {
            if ($line -match $guard) { $isGuarded = $true; break }
        }
        if (-not $isGuarded) {
            foreach ($rule in $rules) {
                if ($newLine -match $rule[0]) {
                    $before = $newLine
                    $newLine = $newLine -replace $rule[0], $rule[1]
                    if ($before -ne $newLine) { $fileReplacements++ }
                }
            }
        }
        [void]$newLines.Add($newLine)
    }

    if ($fileReplacements -gt 0) {
        $totalFiles++
        $totalReplacements += $fileReplacements
        Write-Host ("  {0,-32} {1,4} change(s)" -f $file.Name, $fileReplacements) -ForegroundColor Green
        if ($Apply) {
            Copy-Item $file.FullName (Join-Path $backupDir $file.Name) -Force
            [System.IO.File]::WriteAllText($file.FullName, ($newLines -join "`n"))
        }
    }
}

Write-Host ""
Write-Host "Files scanned  : $($files.Count)"
Write-Host "Files affected : $totalFiles"
Write-Host "Total changes  : $totalReplacements"
Write-Host ""

if ($Apply) { Write-Host "Changes written. Backups in .locale-backup" -ForegroundColor Green }
if (-not $Apply) { Write-Host "DRY RUN - re-run with -Apply to write." -ForegroundColor Yellow }