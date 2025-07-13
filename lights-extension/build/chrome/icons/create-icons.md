# Creating Extension Icons

You'll need to create the following icon files for the extension:

## Required Icons

1. **icon16.png** - 16x16 pixels - Used in the extension toolbar
2. **icon48.png** - 48x48 pixels - Used in the extension management page
3. **icon128.png** - 128x128 pixels - Used in the Chrome Web Store

## Design Guidelines

### Colors
- Primary: #3b82f6 (blue)
- Secondary: #22c55e (green)
- Accent: #f59e0b (yellow)

### Icon Concept
The icon should represent "lights" or "highlighting":
- A lightbulb with colorful rays
- A highlighter pen with light beams
- Text with a glowing effect
- A spotlight illuminating words

### Style
- Modern, clean design
- High contrast for visibility
- Recognizable at small sizes
- Consistent with the extension's color scheme

## Icon Creation Tools

### Online Tools
- **Canva**: Easy templates for icons
- **Figma**: Professional design tool
- **Adobe Express**: Quick icon creation
- **IconScout**: Icon maker and generator

### Software
- **Adobe Illustrator**: Vector graphics
- **Sketch**: UI design
- **GIMP**: Free image editor
- **Inkscape**: Free vector graphics

## Quick Icon Creation

If you need placeholder icons quickly:

1. **Use Emoji**: Convert 💡 or 🔦 emoji to PNG
2. **Text-based**: Create simple text icons with "L" or "Hi"
3. **Geometric**: Simple shapes like circles with light effects
4. **Color blocks**: Solid colors with the extension name

## Export Settings

- **Format**: PNG
- **Background**: Transparent
- **Quality**: High (300 DPI for creation, but final files should be optimized)
- **Size**: Exact pixel dimensions (16x16, 48x48, 128x128)

## Temporary Solution

For testing purposes, you can use simple colored squares:
- 16x16 blue square for icon16.png
- 48x48 green square for icon48.png  
- 128x128 yellow square for icon128.png

## Implementation

Once you have the icons:
1. Save them in the `icons/` folder
2. Ensure exact naming (icon16.png, icon48.png, icon128.png)
3. The manifest.json already references these files
4. Test the extension to ensure icons display correctly

## Icon Optimization

- Use PNG format for best compatibility
- Optimize file size without losing quality
- Test icons on different backgrounds
- Ensure they're visible in both light and dark themes