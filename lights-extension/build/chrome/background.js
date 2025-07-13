// Lights Extension - Background Script

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Lights Extension installed');
  
  // Set default settings
  chrome.storage.sync.set({
    lightsEnabled: true,
    colorMode: 0
  });
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getData') {
    // Handle data requests from content script
    handleDataRequest(request.type, request.query)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Will respond asynchronously
  }
  
  if (request.action === 'toggle') {
    // Forward toggle message to active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, request, sendResponse);
      }
    });
    return true;
  }
});

// Handle data requests
async function handleDataRequest(type, query) {
  try {
    switch (type) {
      case 'definition':
        return await fetchDefinition(query);
      case 'synonyms':
        return await fetchSynonyms(query);
      case 'story':
        return await fetchStory(query);
      case 'etymology':
        return await fetchEtymology(query);
      case 'examples':
        return await fetchExamples(query);
      default:
        throw new Error('Unknown data type');
    }
  } catch (error) {
    console.error('Background script error:', error);
    throw error;
  }
}

// API functions
async function fetchDefinition(word) {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!response.ok) throw new Error('Definition API request failed');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Definition fetch error:', error);
    throw error;
  }
}

async function fetchSynonyms(word) {
  try {
    const response = await fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=10`);
    if (!response.ok) throw new Error('Synonyms API request failed');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Synonyms fetch error:', error);
    throw error;
  }
}

async function fetchStory(word) {
  // Custom story generation or API integration
  const stories = {
    'light': 'The word "light" has illuminated human language for centuries. In ancient times, light was considered divine, and many cultures worshipped sun gods. The phrase "to see the light" originally referred to spiritual enlightenment.',
    'word': 'Words are the building blocks of human communication. The average person knows about 20,000-30,000 words, but uses only about 2,000-3,000 in daily conversation.',
    'extension': 'Browser extensions revolutionized how we interact with the web. The first browser extension was created in 1999 for Internet Explorer, changing the internet forever.',
    'computer': 'The word "computer" originally referred to a person who performed calculations. The first electronic computers were built in the 1940s and filled entire rooms.',
    'internet': 'The Internet was originally called ARPANET and was created in 1969. The first message sent was "LO" - they were trying to type "LOGIN" but the system crashed.',
    'mouse': 'The computer mouse was invented in 1964 by Douglas Engelbart. It was originally called an "X-Y Position Indicator for a Display System."',
    'default': `The word "${word}" carries its own unique history and significance. Words evolve over time, picking up new meanings and cultural significance as they travel through different communities and generations.`
  };
  
  return { story: stories[word.toLowerCase()] || stories['default'] };
}

async function fetchEtymology(word) {
  // Placeholder for etymology - you would integrate with etymology APIs
  return {
    etymology: `The word "${word}" has fascinating linguistic roots. Etymology is the study of how words change over time, tracing their origins through different languages and cultures.`
  };
}

async function fetchExamples(word) {
  // Placeholder for examples - you would integrate with examples APIs
  return {
    examples: [`Here are some examples of how "${word}" is used in context.`, `Understanding usage helps improve language comprehension and communication skills.`]
  };
}

// Handle browser action click
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
});

// Context menu integration (optional)
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'lightsToggle') {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
  }
});

// Create context menu item
chrome.runtime.onStartup.addListener(() => {
  chrome.contextMenus.create({
    id: 'lightsToggle',
    title: 'Toggle Lights Extension',
    contexts: ['selection', 'page']
  });
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Extension is ready to work on this tab
    console.log('Lights Extension ready for tab:', tab.url);
  }
});