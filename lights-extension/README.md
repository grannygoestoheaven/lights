# Lights Extension

A smart word highlighting browser extension that provides contextual information about words and phrases as you browse the web.

## Features

- **Smart Highlighting**: Hover over words to highlight them in bright cream white with subtle borders
- **Vertical Mouse Control**: Move mouse up/down to highlight more or fewer consecutive words
- **Color-coded Information**: Click to cycle through different types of information:
  - 🟤 **Cream White**: Hover state (default)
  - 🟢 **Green**: Word definitions
  - 🔵 **Blue**: Synonyms and related words
  - 🔴 **Red**: Interesting stories and facts
  - 🟡 **Yellow**: Etymology and word origins
  - 🟣 **Purple**: Usage examples
- **Cross-browser Support**: Works in Chrome and Firefox
- **Responsive Design**: Adapts to different screen sizes and layouts

## Installation

### Chrome
1. Download the extension files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `lights-extension` folder

### Firefox
1. Download the extension files
2. Rename `manifest-firefox.json` to `manifest.json`
3. Open Firefox and go to `about:debugging`
4. Click "This Firefox" → "Load Temporary Add-on"
5. Select the `manifest.json` file

## Usage

1. **Hover**: Move your mouse over any word on a webpage
2. **Adjust Selection**: Move mouse up to highlight more words, down to highlight fewer
3. **Get Information**: Click on highlighted words to see information
4. **Cycle Colors**: Keep clicking to cycle through different information types
5. **Close**: Press Escape or click outside to close the information popup

## Technical Details

### Architecture
- **Content Script**: Handles text interaction and highlighting
- **Background Script**: Manages API calls and data processing
- **Popup Interface**: Provides settings and controls
- **Modular Design**: Easy to extend with new information types

### APIs Used
- Dictionary API for definitions
- Datamuse API for synonyms
- Custom story database for interesting facts
- Extensible for additional data sources

### Performance
- Debounced mouse events for smooth interaction
- Efficient text parsing and highlighting
- Minimal DOM manipulation
- Smart caching of API responses

## Development

### Project Structure
```
lights-extension/
├── manifest.json              # Chrome extension manifest
├── manifest-firefox.json     # Firefox extension manifest
├── content.js                # Main content script
├── content.css               # Styling for highlights and modal
├── background.js             # Background service worker
├── popup.html               # Extension popup interface
├── popup.css                # Popup styling
├── popup.js                 # Popup functionality
└── README.md                # This file
```

### Adding New Information Types

1. **Add Color Mode**: Add new color to `colorModes` array in `content.js`
2. **Create Handler**: Add new case in `loadModalContent()` method
3. **Implement API**: Add corresponding fetch function in `background.js`
4. **Update UI**: Add color indicator in `popup.html`

### Customization

#### Adding New APIs
```javascript
// In background.js
async function fetchNewDataType(word) {
  try {
    const response = await fetch(`https://api.example.com/data/${word}`);
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}
```

#### Custom Styling
Modify `content.css` to change highlight colors, modal appearance, or animations.

#### Settings
Extension settings are stored in `chrome.storage.sync` and can be accessed from both content and popup scripts.

## Browser Compatibility

- **Chrome**: Version 88+ (Manifest V3)
- **Firefox**: Version 89+ (Manifest V2)
- **Edge**: Compatible with Chrome version
- **Safari**: Not currently supported

## Privacy

- No data collection or tracking
- API calls are made directly to public services
- All settings stored locally in browser storage
- No server-side components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in both Chrome and Firefox
5. Submit a pull request

## License

MIT License - feel free to use and modify as needed.

## Support

For issues and feature requests, please create an issue in the project repository.

## Roadmap

- [ ] Offline mode with cached definitions
- [ ] Custom word lists and categories
- [ ] Integration with note-taking apps
- [ ] Voice pronunciation
- [ ] Multiple language support
- [ ] Advanced keyboard shortcuts
- [ ] Customizable themes
- [ ] Export highlighted words
- [ ] Learning progress tracking