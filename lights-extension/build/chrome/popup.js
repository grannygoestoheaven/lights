// Popup Script
document.addEventListener('DOMContentLoaded', async () => {
  const toggleExtension = document.getElementById('toggleExtension');
  const statusIndicator = document.getElementById('statusIndicator');
  const enableShortcuts = document.getElementById('enableShortcuts');
  const showTooltips = document.getElementById('showTooltips');
  const resetSettings = document.getElementById('resetSettings');
  const saveSettings = document.getElementById('saveSettings');

  // Load current settings
  await loadSettings();

  // Toggle extension on/off
  toggleExtension.addEventListener('change', async () => {
    const isEnabled = toggleExtension.checked;
    
    // Send message to content script
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
      
      // Update UI
      updateStatusIndicator(isEnabled);
      
      // Save setting
      await chrome.storage.sync.set({ lightsEnabled: isEnabled });
      
      showNotification(isEnabled ? 'Extension enabled' : 'Extension disabled');
    } catch (error) {
      console.error('Error toggling extension:', error);
      toggleExtension.checked = !isEnabled; // Revert toggle
      showNotification('Error: Please refresh the page', 'error');
    }
  });

  // Save settings
  saveSettings.addEventListener('click', async () => {
    const settings = {
      lightsEnabled: toggleExtension.checked,
      enableShortcuts: enableShortcuts.checked,
      showTooltips: showTooltips.checked
    };
    
    try {
      await chrome.storage.sync.set(settings);
      showNotification('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Error saving settings', 'error');
    }
  });

  // Reset settings
  resetSettings.addEventListener('click', async () => {
    const defaultSettings = {
      lightsEnabled: true,
      enableShortcuts: true,
      showTooltips: true,
      colorMode: 0
    };
    
    try {
      await chrome.storage.sync.set(defaultSettings);
      await loadSettings();
      showNotification('Settings reset to default');
    } catch (error) {
      console.error('Error resetting settings:', error);
      showNotification('Error resetting settings', 'error');
    }
  });

  // Load settings from storage
  async function loadSettings() {
    try {
      const settings = await chrome.storage.sync.get({
        lightsEnabled: true,
        enableShortcuts: true,
        showTooltips: true,
        colorMode: 0
      });
      
      toggleExtension.checked = settings.lightsEnabled;
      enableShortcuts.checked = settings.enableShortcuts;
      showTooltips.checked = settings.showTooltips;
      
      updateStatusIndicator(settings.lightsEnabled);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  // Update status indicator
  function updateStatusIndicator(isEnabled) {
    statusIndicator.style.background = isEnabled ? '#10b981' : '#ef4444';
    statusIndicator.style.boxShadow = isEnabled ? 
      '0 0 0 2px rgba(16, 185, 129, 0.2)' : 
      '0 0 0 2px rgba(239, 68, 68, 0.2)';
  }

  // Show notification
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.background = type === 'error' ? '#ef4444' : '#10b981';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Check if extension is working on current tab
  async function checkTabCompatibility() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url.startsWith('chrome://') || 
          tab.url.startsWith('chrome-extension://') ||
          tab.url.startsWith('moz-extension://') ||
          tab.url.startsWith('about:')) {
        showNotification('Extension cannot work on this page', 'error');
        document.querySelector('.popup-content').classList.add('disabled');
      }
    } catch (error) {
      console.error('Error checking tab compatibility:', error);
    }
  }

  // Check compatibility on load
  await checkTabCompatibility();

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.close();
    }
    
    if (e.key === ' ' || e.key === 'Enter') {
      if (e.target === toggleExtension) {
        e.preventDefault();
        toggleExtension.click();
      }
    }
  });

  // Add click handlers for color mode items (for future enhancement)
  document.querySelectorAll('.color-mode-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      // Remove active class from all items
      document.querySelectorAll('.color-mode-item').forEach(i => i.classList.remove('active'));
      
      // Add active class to clicked item
      item.classList.add('active');
      
      // Save color mode preference
      chrome.storage.sync.set({ colorMode: index });
    });
  });

  // Load and highlight current color mode
  try {
    const { colorMode } = await chrome.storage.sync.get({ colorMode: 0 });
    document.querySelectorAll('.color-mode-item')[colorMode]?.classList.add('active');
  } catch (error) {
    console.error('Error loading color mode:', error);
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updatePopup') {
    // Update popup based on content script state
    if (request.status) {
      document.getElementById('toggleExtension').checked = request.status.active;
      updateStatusIndicator(request.status.active);
    }
  }
});

// Add CSS for active color mode
const style = document.createElement('style');
style.textContent = `
  .color-mode-item.active {
    background: #e0e7ff;
    border-color: #3b82f6;
    color: #1e40af;
  }
  
  .color-mode-item.active .color-indicator {
    box-shadow: 0 0 0 2px white, 0 0 0 4px currentColor;
  }
`;
document.head.appendChild(style);