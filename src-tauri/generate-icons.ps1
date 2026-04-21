# Icon generation script for Tauri (PowerShell)
# This script generates all required icon sizes from the source logo
# Requires ImageMagick to be installed: choco install imagemagick

$SOURCE_ICON = "..\src\assets\stockflow-logo.png"
$OUTPUT_DIR = "icons"

# Create output directory if it doesn't exist
New-Item -ItemType Directory -Force -Path $OUTPUT_DIR | Out-Null

Write-Host "Generating icons from $SOURCE_ICON..." -ForegroundColor Green

# Generate PNG sizes
magick $SOURCE_ICON -resize 32x32 "$OUTPUT_DIR\32x32.png"
magick $SOURCE_ICON -resize 128x128 "$OUTPUT_DIR\128x128.png"
magick $SOURCE_ICON -resize 256x256 "$OUTPUT_DIR\128x128@2x.png"
magick $SOURCE_ICON -resize 512x512 "$OUTPUT_DIR\icon.png"

# Generate ICO for Windows
magick $SOURCE_ICON -define icon:auto-resize=256,128,64,48,32,16 "$OUTPUT_DIR\icon.ico"

Write-Host "Icons generated successfully in $OUTPUT_DIR\" -ForegroundColor Green
Write-Host "Files created:" -ForegroundColor Cyan
Get-ChildItem $OUTPUT_DIR | Select-Object Name, Length

Write-Host "" 
Write-Host "Note: For macOS ICNS generation, run this script on macOS or use the Bash script with WSL" -ForegroundColor Yellow
