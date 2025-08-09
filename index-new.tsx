// Linux 95 Desktop Simulator - Modular Entry Point
import { desktopManager } from './src/core/desktop-manager.js';

// Main application initialization
async function initializeDesktop(): Promise<void> {
  try {
    console.log('🐧 Initializing Linux 95 Desktop...');
    
    // Initialize the desktop manager
    await desktopManager.init();
    
    console.log('✅ Linux 95 Desktop ready!');
  } catch (error) {
    console.error('❌ Failed to initialize desktop:', error);
    
    // Show error message to user
    document.body.innerHTML = `
      <div style="color: white; text-align: center; padding: 50px; font-family: monospace;">
        <h1>Linux 95 Desktop - Initialization Error</h1>
        <p>Failed to start the desktop environment.</p>
        <p>Please check the console for details.</p>
        <button onclick="location.reload()" style="padding: 8px 16px; margin-top: 20px;">
          Retry
        </button>
      </div>
    `;
  }
}

// Handle page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDesktop);
} else {
  initializeDesktop();
}

// Handle page unload
window.addEventListener('beforeunload', () => {
  desktopManager.cleanup();
});

// Export for potential external use
export { desktopManager }; 