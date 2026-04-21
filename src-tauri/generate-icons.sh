#!/bin/bash
# Icon generation script for Tauri
# This script generates all required icon sizes from the source logo

# Requires ImageMagick to be installed
# Install on Windows: choco install imagemagick
# Install on macOS: brew install imagemagick
# Install on Linux: sudo apt install imagemagick

SOURCE_ICON="../src/assets/stockflow-logo.png"
OUTPUT_DIR="icons"

# Create output directory if it doesn't exist
mkdir -p $OUTPUT_DIR

echo "Generating icons from $SOURCE_ICON..."

# Generate various sizes
convert $SOURCE_ICON -resize 32x32 $OUTPUT_DIR/32x32.png
convert $SOURCE_ICON -resize 128x128 $OUTPUT_DIR/128x128.png
convert $SOURCE_ICON -resize 256x256 $OUTPUT_DIR/128x128@2x.png
convert $SOURCE_ICON -resize 512x512 $OUTPUT_DIR/icon.png

# Generate ICO for Windows
convert $SOURCE_ICON -define icon:auto-resize=256,128,64,48,32,16 $OUTPUT_DIR/icon.ico

# Generate ICNS for macOS (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Generating ICNS for macOS..."
    # Create iconset
    mkdir -p $OUTPUT_DIR/icon.iconset
    sips -z 16 16 $SOURCE_ICON --out $OUTPUT_DIR/icon.iconset/icon_16x16.png
    sips -z 32 32 $SOURCE_ICON --out $OUTPUT_DIR/icon.iconset/icon_16x16@2x.png
    sips -z 32 32 $SOURCE_ICON --out $OUTPUT_DIR/icon.iconset/icon_32x32.png
    sips -z 64 64 $SOURCE_ICON --out $OUTPUT_DIR/icon.iconset/icon_32x32@2x.png
    sips -z 128 128 $SOURCE_ICON --out $OUTPUT_DIR/icon.iconset/icon_128x128.png
    sips -z 256 256 $SOURCE_ICON --out $OUTPUT_DIR/icon.iconset/icon_128x128@2x.png
    sips -z 256 256 $SOURCE_ICON --out $OUTPUT_DIR/icon.iconset/icon_256x256.png
    sips -z 512 512 $SOURCE_ICON --out $OUTPUT_DIR/icon.iconset/icon_256x256@2x.png
    sips -z 512 512 $SOURCE_ICON --out $OUTPUT_DIR/icon.iconset/icon_512x512.png
    iconutil -c icns $OUTPUT_DIR/icon.iconset -o $OUTPUT_DIR/icon.icns
    rm -rf $OUTPUT_DIR/icon.iconset
fi

echo "Icons generated successfully in $OUTPUT_DIR/"
echo "Files created:"
ls -la $OUTPUT_DIR/
