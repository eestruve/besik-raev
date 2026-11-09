# scripts/setup-assets.ps1
# Setup media assets for 20_Сайт_Беслана from 17_Бесроллинг and generate mp3 & poster via ffmpeg

$ErrorActionPreference = "Stop"

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }
$targetDir = (Resolve-Path (Join-Path $scriptDir "..")).Path
$parentDir = (Resolve-Path (Join-Path $targetDir "..")).Path
$sourceDir = (Get-ChildItem -Path $parentDir -Directory | Where-Object { $_.Name -like "*17_*" } | Select-Object -First 1).FullName

Write-Host "Target: $targetDir"
Write-Host "Source: $sourceDir"

Write-Host "Creating target directories..."
New-Item -ItemType Directory -Force -Path "$targetDir\public\assets\easter_egg" | Out-Null

Write-Host "Copying core media assets..."
Copy-Item "$sourceDir\public\assets\beslan.mp4" "$targetDir\public\assets\beslan.mp4" -Force
Copy-Item "$sourceDir\public\assets\beslan_avatar.jpg" "$targetDir\public\assets\beslan_avatar.jpg" -Force
if (Test-Path "$sourceDir\public\assets\beslan_avatar.png") {
    Copy-Item "$sourceDir\public\assets\beslan_avatar.png" "$targetDir\public\assets\beslan_avatar.png" -Force
}

Write-Host "Copying favicons..."
Copy-Item "$sourceDir\public\favicon.ico" "$targetDir\public\favicon.ico" -Force
Copy-Item "$sourceDir\public\favicon.png" "$targetDir\public\favicon.png" -Force

Write-Host "Copying easter egg animations..."
Get-ChildItem -Path "$sourceDir\public\assets\kolobok_*.gif" | ForEach-Object {
    Copy-Item $_.FullName "$targetDir\public\assets\$($_.Name)" -Force
    Copy-Item $_.FullName "$targetDir\public\assets\easter_egg\$($_.Name)" -Force
}

Write-Host "Checking ffmpeg..."
$ffmpegCmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
if ($ffmpegCmd) {
    Write-Host "Extracting beslan.mp3 audio..."
    ffmpeg -y -i "$targetDir\public\assets\beslan.mp4" -vn -ab 192k -ar 44100 "$targetDir\public\assets\beslan.mp3"

    Write-Host "Extracting beslan_poster.jpg..."
    ffmpeg -y -ss 00:00:02 -i "$targetDir\public\assets\beslan.mp4" -vframes 1 -q:v 2 "$targetDir\public\assets\beslan_poster.jpg"
} else {
    Write-Warning "ffmpeg command not found in PATH."
}

Write-Host "Verifying generated assets in public/assets:"
Get-ChildItem -Path "$targetDir\public\assets" -File | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
Get-ChildItem -Path "$targetDir\public" -File | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
Write-Host "Asset setup complete!"
