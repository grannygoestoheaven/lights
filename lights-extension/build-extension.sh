#!/bin/bash

# Build script for Lights Extension
echo "Building Lights Extension..."

# Create build directories
mkdir -p build/chrome
mkdir -p build/firefox

# Copy common files to both builds
cp content.js content.css background.js popup.html popup.css popup.js README.md build/chrome/
cp content.js content.css background.js popup.html popup.css popup.js README.md build/firefox/

# Copy Chrome manifest
cp manifest.json build/chrome/

# Copy Firefox manifest
cp manifest-firefox.json build/firefox/manifest.json

# Create icons directory in builds
mkdir -p build/chrome/icons
mkdir -p build/firefox/icons

# Copy icons if they exist
if [ -d "icons" ]; then
    cp icons/* build/chrome/icons/ 2>/dev/null || echo "No icons found - you'll need to create them"
    cp icons/* build/firefox/icons/ 2>/dev/null || echo "No icons found - you'll need to create them"
fi

# Create zip files for distribution
cd build

# Create Chrome extension zip
cd chrome
zip -r ../lights-extension-chrome.zip .
cd ..

# Create Firefox extension zip
cd firefox
zip -r ../lights-extension-firefox.zip .
cd ..

echo "Build complete!"
echo "Chrome extension: build/lights-extension-chrome.zip"
echo "Firefox extension: build/lights-extension-firefox.zip"
echo ""
echo "To install:"
echo "Chrome: Load unpacked extension from build/chrome folder"
echo "Firefox: Load temporary add-on from build/firefox/manifest.json"