// Lights Extension - Content Script
class LightsExtension {
  constructor() {
    this.currentHighlights = [];
    this.currentSelection = null;
    this.colorModes = ['default', 'green', 'blue', 'red', 'yellow', 'purple'];
    this.currentColorIndex = 0; // Start with 'default' (bright cream white)
    this.modal = null;
    this.isActive = true;
    this.debounceTimer = null;
    this.lastMousePosition = { x: 0, y: 0 };
    
    this.init();
  }

  init() {
    this.createModal();
    this.bindEvents();
    this.loadSettings();
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'lights-modal';
    this.modal.innerHTML = `
      <div class="lights-modal-content">
        <div class="lights-modal-header">
          <h3 class="lights-modal-title">Word Information</h3>
          <button class="lights-modal-close">&times;</button>
        </div>
        <div class="lights-modal-body">
          <div class="lights-loading">Loading...</div>
        </div>
      </div>
    `;
    document.body.appendChild(this.modal);

    // Close modal events
    this.modal.querySelector('.lights-modal-close').addEventListener('click', () => {
      this.hideModal();
    });
    
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hideModal();
      }
    });
  }

  bindEvents() {
    let isMouseDown = false;
    
    document.addEventListener('mousemove', (e) => {
      if (!this.isActive || isMouseDown) return;
      
      this.lastMousePosition = { x: e.clientX, y: e.clientY };
      
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      
      this.debounceTimer = setTimeout(() => {
        this.handleMouseMove(e);
      }, 50);
    });

    document.addEventListener('click', (e) => {
      if (!this.isActive) return;
      
      if (e.target.classList.contains('lights-highlight')) {
        e.preventDefault();
        this.handleWordClick(e);
      }
    });

    document.addEventListener('mousedown', () => {
      isMouseDown = true;
    });

    document.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideModal();
        this.clearHighlights();
      }
    });
  }

  handleMouseMove(e) {
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element || !this.isTextElement(element)) {
      this.clearHighlights();
      return;
    }

    const textNode = this.getTextNodeAtPoint(element, e.clientX, e.clientY);
    if (!textNode) {
      this.clearHighlights();
      return;
    }

    const wordInfo = this.getWordAtPosition(textNode, e.clientX, e.clientY);
    if (!wordInfo) {
      this.clearHighlights();
      return;
    }

    this.highlightWords(wordInfo, e.clientY);
  }

  isTextElement(element) {
    const tagName = element.tagName.toLowerCase();
    const excludedTags = ['script', 'style', 'input', 'textarea', 'button', 'select'];
    return !excludedTags.includes(tagName);
  }

  getTextNodeAtPoint(element, x, y) {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let textNode;
    while ((textNode = walker.nextNode())) {
      const range = document.createRange();
      range.selectNodeContents(textNode);
      const rect = range.getBoundingClientRect();
      
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return textNode;
      }
    }
    return null;
  }

  getWordAtPosition(textNode, x, y) {
    const text = textNode.textContent;
    const words = text.match(/\b\w+\b/g);
    if (!words) return null;

    let currentPos = 0;
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordStart = text.indexOf(word, currentPos);
      const wordEnd = wordStart + word.length;
      
      const range = document.createRange();
      range.setStart(textNode, wordStart);
      range.setEnd(textNode, wordEnd);
      
      const rect = range.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return {
          word: word,
          index: i,
          words: words,
          textNode: textNode,
          startPos: wordStart,
          endPos: wordEnd,
          rect: rect
        };
      }
      
      currentPos = wordEnd;
    }
    return null;
  }

  highlightWords(wordInfo, mouseY) {
    this.clearHighlights();
    
    const { word, index, words, textNode, rect } = wordInfo;
    const wordHeight = rect.height;
    const wordTop = rect.top;
    const wordBottom = rect.bottom;
    
    // Calculate how many additional words to highlight based on mouse position
    const relativeY = (mouseY - wordTop) / wordHeight;
    const additionalWords = Math.max(0, Math.floor((1 - relativeY) * 3)); // Max 3 additional words
    
    // Determine range of words to highlight
    const startIndex = Math.max(0, index - additionalWords);
    const endIndex = Math.min(words.length - 1, index + additionalWords);
    
    // Highlight the words
    const wordsToHighlight = words.slice(startIndex, endIndex + 1);
    this.highlightWordsInText(textNode, wordsToHighlight, startIndex);
    
    this.currentSelection = {
      words: wordsToHighlight,
      originalWord: word,
      startIndex: startIndex,
      endIndex: endIndex
    };
  }

  highlightWordsInText(textNode, wordsToHighlight, startIndex) {
    const text = textNode.textContent;
    const parent = textNode.parentNode;
    
    let currentPos = 0;
    let newHTML = '';
    
    const allWords = text.match(/\b\w+\b/g) || [];
    
    for (let i = 0; i < allWords.length; i++) {
      const word = allWords[i];
      const wordStart = text.indexOf(word, currentPos);
      const wordEnd = wordStart + word.length;
      
      // Add text before word
      newHTML += text.substring(currentPos, wordStart);
      
      // Add word with or without highlight
      if (i >= startIndex && i <= startIndex + wordsToHighlight.length - 1) {
        // Always start with default (bright cream white) color on hover
        const colorClass = `lights-highlight-${this.colorModes[0]}`; // Always use 'default' for hover
        newHTML += `<span class="lights-highlight ${colorClass}">${word}</span>`;
        this.currentHighlights.push(word);
      } else {
        newHTML += word;
      }
      
      currentPos = wordEnd;
    }
    
    // Add remaining text
    newHTML += text.substring(currentPos);
    
    // Replace the text node with highlighted HTML
    const wrapper = document.createElement('span');
    wrapper.innerHTML = newHTML;
    parent.replaceChild(wrapper, textNode);
    
    // Store reference for cleanup
    wrapper.setAttribute('data-lights-wrapper', 'true');
    
    // Reset color index to default for new selections
    this.currentColorIndex = 0;
  }

  clearHighlights() {
    // Remove all wrapper spans
    const wrappers = document.querySelectorAll('[data-lights-wrapper="true"]');
    wrappers.forEach(wrapper => {
      wrapper.replaceWith(document.createTextNode(wrapper.textContent));
    });
    
    this.currentHighlights = [];
    this.currentSelection = null;
  }

  handleWordClick(e) {
    if (!this.currentSelection) return;
    
    // Only cycle through colors if we're not in default mode
    // On first click, go from default to green, then cycle through the rest
    if (this.currentColorIndex === 0) {
      this.currentColorIndex = 1; // Go from default to green
    } else {
      this.currentColorIndex = (this.currentColorIndex + 1) % this.colorModes.length;
      // Skip default mode when cycling (only use it for hover)
      if (this.currentColorIndex === 0) {
        this.currentColorIndex = 1;
      }
    }
    
    // Update highlight colors
    const highlights = document.querySelectorAll('.lights-highlight');
    highlights.forEach(highlight => {
      // Remove old color classes
      this.colorModes.forEach(color => {
        highlight.classList.remove(`lights-highlight-${color}`);
      });
      // Add new color class
      highlight.classList.add(`lights-highlight-${this.colorModes[this.currentColorIndex]}`);
    });
    
    // Show modal with information (only show modal for non-default colors)
    if (this.currentColorIndex > 0) {
      this.showModal(e.clientX, e.clientY);
    }
  }

  showModal(x, y) {
    if (!this.currentSelection) return;
    
    const { words, originalWord } = this.currentSelection;
    const searchTerm = words.join(' ');
    const colorMode = this.colorModes[this.currentColorIndex];
    
    // Position modal
    this.modal.style.display = 'block';
    const modalContent = this.modal.querySelector('.lights-modal-content');
    
    // Position near cursor but keep within viewport
    const rect = modalContent.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = x + 10;
    let top = y + 10;
    
    if (left + rect.width > viewportWidth) {
      left = x - rect.width - 10;
    }
    if (top + rect.height > viewportHeight) {
      top = y - rect.height - 10;
    }
    
    modalContent.style.left = Math.max(10, left) + 'px';
    modalContent.style.top = Math.max(10, top) + 'px';
    
    // Update modal title
    const title = this.modal.querySelector('.lights-modal-title');
    title.innerHTML = `<span class="lights-color-indicator" style="background-color: ${this.getColorValue(colorMode)}"></span>${searchTerm}`;
    
    // Load content based on color mode
    this.loadModalContent(searchTerm, colorMode);
  }

  hideModal() {
    this.modal.style.display = 'none';
  }

  getColorValue(colorMode) {
    const colors = {
      default: '#fff8dc',
      green: '#22c55e',
      blue: '#3b82f6',
      red: '#ef4444',
      yellow: '#fbbf24',
      purple: '#a855f7'
    };
    return colors[colorMode] || '#fff8dc';
  }

  async loadModalContent(searchTerm, colorMode) {
    const modalBody = this.modal.querySelector('.lights-modal-body');
    modalBody.innerHTML = '<div class="lights-loading">Loading...</div>';
    
    try {
      let content;
      switch (colorMode) {
        case 'default':
          // Don't show modal for default hover state
          this.hideModal();
          return;
        case 'green':
          content = await this.getDefinition(searchTerm);
          break;
        case 'blue':
          content = await this.getSynonyms(searchTerm);
          break;
        case 'red':
          content = await this.getStory(searchTerm);
          break;
        case 'yellow':
          content = await this.getEtymology(searchTerm);
          break;
        case 'purple':
          content = await this.getExamples(searchTerm);
          break;
        default:
          content = await this.getDefinition(searchTerm);
      }
      
      modalBody.innerHTML = content;
    } catch (error) {
      modalBody.innerHTML = '<div class="lights-error">Failed to load information. Please try again.</div>';
      console.error('Lights Extension Error:', error);
    }
  }

  async getDefinition(word) {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      if (!data || !data[0]) throw new Error('No definition found');
      
      const entry = data[0];
      let html = '';
      
      if (entry.meanings && entry.meanings.length > 0) {
        entry.meanings.forEach((meaning, index) => {
          if (index < 3) { // Limit to first 3 meanings
            html += `<div class="lights-definition">`;
            if (meaning.partOfSpeech) {
              html += `<div class="lights-part-of-speech">${meaning.partOfSpeech}</div>`;
            }
            if (meaning.definitions && meaning.definitions[0]) {
              html += `<div class="lights-definition-text">${meaning.definitions[0].definition}</div>`;
            }
            html += `</div>`;
          }
        });
      }
      
      return html || '<div class="lights-no-results">No definition found</div>';
    } catch (error) {
      return '<div class="lights-no-results">Definition not available</div>';
    }
  }

  async getSynonyms(word) {
    try {
      const response = await fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=10`);
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      if (!data || data.length === 0) throw new Error('No synonyms found');
      
      let html = '<div class="lights-synonyms">';
      html += '<div class="lights-synonyms-title">Synonyms:</div>';
      html += '<div class="lights-synonyms-list">';
      
      data.forEach(synonym => {
        html += `<span class="lights-synonym">${synonym.word}</span>`;
      });
      
      html += '</div></div>';
      return html;
    } catch (error) {
      return '<div class="lights-no-results">Synonyms not available</div>';
    }
  }

  async getStory(word) {
    try {
      // This is a placeholder - you would integrate with a stories API or create custom stories
      const stories = {
        'light': 'The word "light" has illuminated human language for centuries. In ancient times, light was considered divine, and many cultures worshipped sun gods. The phrase "to see the light" originally referred to spiritual enlightenment.',
        'word': 'Words are the building blocks of human communication. The average person knows about 20,000-30,000 words, but uses only about 2,000-3,000 in daily conversation.',
        'extension': 'Browser extensions revolutionized how we interact with the web. The first browser extension was created in 1999 for Internet Explorer, changing the internet forever.',
        'default': `The word "${word}" carries its own unique history and significance. Words evolve over time, picking up new meanings and cultural significance as they travel through different communities and generations.`
      };
      
      const story = stories[word.toLowerCase()] || stories['default'];
      return `<div class="lights-story">
        <div class="lights-story-title">Did you know?</div>
        <div>${story}</div>
      </div>`;
    } catch (error) {
      return '<div class="lights-no-results">Story not available</div>';
    }
  }

  async getEtymology(word) {
    try {
      // Placeholder for etymology - you would integrate with etymology APIs
      return `<div class="lights-story">
        <div class="lights-story-title">Etymology</div>
        <div>The word "${word}" has fascinating linguistic roots. Etymology is the study of how words change over time, tracing their origins through different languages and cultures.</div>
      </div>`;
    } catch (error) {
      return '<div class="lights-no-results">Etymology not available</div>';
    }
  }

  async getExamples(word) {
    try {
      // Placeholder for examples - you would integrate with examples APIs
      return `<div class="lights-story">
        <div class="lights-story-title">Usage Examples</div>
        <div>Here are some examples of how "${word}" is used in context. Understanding usage helps improve language comprehension and communication skills.</div>
      </div>`;
    } catch (error) {
      return '<div class="lights-no-results">Examples not available</div>';
    }
  }

  async loadSettings() {
    // Load user preferences from storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      try {
        const result = await chrome.storage.sync.get(['lightsEnabled', 'colorMode']);
        this.isActive = result.lightsEnabled !== false;
        this.currentColorIndex = result.colorMode || 0;
      } catch (error) {
        console.log('Storage not available, using defaults');
      }
    }
  }

  async saveSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      try {
        await chrome.storage.sync.set({
          lightsEnabled: this.isActive,
          colorMode: this.currentColorIndex
        });
      } catch (error) {
        console.log('Could not save settings');
      }
    }
  }

  toggle() {
    this.isActive = !this.isActive;
    if (!this.isActive) {
      this.clearHighlights();
      this.hideModal();
    }
    this.saveSettings();
  }
}

// Initialize the extension
let lightsExtension;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    lightsExtension = new LightsExtension();
  });
} else {
  lightsExtension = new LightsExtension();
}

// Listen for messages from popup
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle') {
      lightsExtension.toggle();
      sendResponse({ status: 'toggled', active: lightsExtension.isActive });
    }
  });
}