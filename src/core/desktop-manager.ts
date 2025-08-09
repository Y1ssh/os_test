// Main desktop orchestration system for Authentic 1995 Linux Desktop
import { eventBus } from './event-bus.js';
import { windowSystem } from './window-system.js';
import { appRegistry } from './app-registry.js';
import { FVWMPanel } from '../components/fvwm-panel.js';
import { DesktopContextMenu } from '../components/desktop-context-menu.js';
import { aiService } from '../utils/ai-service.js';

export class DesktopManager {
  private fvwmPanel!: FVWMPanel;
  private contextMenu!: DesktopContextMenu;
  private isInitialized = false;
  private cleanupTasks: (() => void)[] = [];

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize AI service
      await aiService.initialize();

      // Register all authentic Linux applications
      this.registerLinuxApplications();

      // Initialize authentic Linux UI components
      this.initializeLinuxComponents();

      // Setup desktop icons for authentic Linux apps
      this.setupLinuxDesktopIcons();

      // Setup global event handlers for Linux desktop
      this.setupLinuxDesktopEvents();

      this.isInitialized = true;
      eventBus.emit('desktop:ready');
      
      console.log('🐧 Authentic Linux 95 Desktop initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Linux desktop manager:', error);
    }
  }

  private registerLinuxApplications(): void {
    // Register authentic 1995 Linux applications with lazy loading
    appRegistry.register('terminal', () => import('../apps/terminal.js').then(m => new m.TerminalApp()));
    appRegistry.register('fileManager', () => import('../apps/file-manager.js').then(m => new m.FileManagerApp()));
    appRegistry.register('textEditor', () => import('../apps/text-editor.js').then(m => new m.TextEditorApp()));
    appRegistry.register('imageViewer', () => import('../apps/image-viewer.js').then(m => new m.ImageViewerApp()));
    
    // Authentic Linux X11 applications
    appRegistry.register('xeyes', () => import('../apps/xeyes.js').then(m => new m.XEyesApp()));
    appRegistry.register('xcalc', () => import('../apps/xcalc.js').then(m => new m.XCalcApp()));
    appRegistry.register('mosaic', () => import('../apps/mosaic.js').then(m => new m.MosaicApp()));
    appRegistry.register('pine', () => import('../apps/pine.js').then(m => new m.PineApp()));
    
    // Keep minesweeper as it existed in 1995
    appRegistry.register('minesweeper', () => import('../apps/minesweeper.js').then(m => new m.MinesweeperApp()));
  }

  private initializeLinuxComponents(): void {
    // Remove any Windows elements that might exist
    this.removeWindowsElements();

    // Create FVWM panel (replaces Windows taskbar)
    this.fvwmPanel = new FVWMPanel();
    document.body.appendChild(this.fvwmPanel.getElement());

    // Create desktop context menu (replaces Start menu)
    this.contextMenu = new DesktopContextMenu();
  }

  private removeWindowsElements(): void {
    // Remove Windows-specific elements
    const windowsElements = [
      '.start-button',
      '.start-menu', 
      '.taskbar'
    ];
    
    windowsElements.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
  }

  private setupLinuxDesktopIcons(): void {
    // Update desktop icons to authentic Linux applications
    const iconMappings = [
      { selector: '[data-app="netscape"]', newApp: 'mosaic', newTitle: 'NCSA Mosaic' },
      { selector: '[data-app="aiChat"]', newApp: 'pine', newTitle: 'Pine Mail' },
      { selector: '[data-app="audioPlayer"]', newApp: 'xcalc', newTitle: 'Calculator' },
      { selector: '[data-app="xmines"]', newApp: 'xeyes', newTitle: 'XEyes' }
    ];

    iconMappings.forEach(mapping => {
      const icon = document.querySelector(mapping.selector) as HTMLElement;
      if (icon) {
        icon.dataset.app = mapping.newApp;
        const span = icon.querySelector('span');
        if (span) span.textContent = mapping.newTitle;
      }
    });

    // Add trash icon if it doesn't exist
    this.addTrashIcon();

    // Setup double-click handlers for desktop icons
    const iconElements = document.querySelectorAll('.icon[data-app]');
    iconElements.forEach(iconEl => {
      const appId = (iconEl as HTMLElement).dataset.app;
      if (appId) {
        iconEl.addEventListener('dblclick', () => {
          this.openApp(appId);
        });
      }
    });
  }

  private addTrashIcon(): void {
    const desktop = document.querySelector('.desktop');
    if (!desktop || document.querySelector('[data-app="trash"]')) return;

    const trashIcon = document.createElement('div');
    trashIcon.className = 'icon';
    trashIcon.dataset.app = 'trash';
    trashIcon.innerHTML = `
      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23C0C0C0' stroke='%23000' stroke-width='2'/%3E%3Crect x='12' y='16' width='24' height='24' fill='%23808080' stroke='%23000'/%3E%3Crect x='16' y='8' width='16' height='4' fill='%23A0A0A0' stroke='%23000'/%3E%3Cline x1='18' y1='20' x2='18' y2='32' stroke='%23000' stroke-width='2'/%3E%3Cline x1='24' y1='20' x2='24' y2='32' stroke='%23000' stroke-width='2'/%3E%3Cline x1='30' y1='20' x2='30' y2='32' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E" alt="Trash" />
      <span>Trash</span>
    `;

    trashIcon.addEventListener('dblclick', () => {
      this.openTrash();
    });

    desktop.appendChild(trashIcon);
  }

  private setupLinuxDesktopEvents(): void {
    // Handle window toggle from panel
    eventBus.on('window:toggle', ({ windowId }) => {
      const window = windowSystem.getWindow(windowId);
      if (window) {
        if (window.state.isMinimized || !window.state.isFocused) {
          window.state.isMinimized = false;
          windowSystem.focusWindow(windowId);
        } else {
          windowSystem.minimizeWindow(windowId);
        }
      }
    });

    // Handle window close requests
    eventBus.on('window:close-request', ({ windowId }) => {
      windowSystem.closeWindow(windowId);
    });

    // Handle virtual desktop switching (placeholder)
    eventBus.on('desktop:switched', ({ desktop }) => {
      console.log(`Switched to virtual desktop ${desktop + 1}`);
    });
  }

  private openTrash(): void {
    // Simple trash implementation - show empty folder
    const trashContent = document.createElement('div');
    trashContent.innerHTML = `
      <div class="x11-error">
        <div class="x11-error-title">Trash</div>
        <div class="x11-error-message">
          <p>The trash is empty.</p>
          <p>Drag files here to delete them.</p>
        </div>
        <div class="x11-error-buttons">
          <button onclick="this.closest('.x11-error').remove()">OK</button>
        </div>
      </div>
    `;
    
    trashContent.style.position = 'fixed';
    trashContent.style.top = '50%';
    trashContent.style.left = '50%';
    trashContent.style.transform = 'translate(-50%, -50%)';
    trashContent.style.zIndex = '2000';
    
    document.body.appendChild(trashContent);
  }

  async openApp(appId: string): Promise<void> {
    try {
      if (appId === 'trash') {
        this.openTrash();
        return;
      }
      await appRegistry.openApp(appId);
    } catch (error) {
      console.error(`Failed to open app ${appId}:`, error);
    }
  }

  cleanup(): void {
    this.fvwmPanel?.cleanup();
    this.contextMenu?.cleanup();
    appRegistry.cleanup();
    windowSystem.cleanup();
    eventBus.cleanup();
    
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
    this.isInitialized = false;
  }
}

export const desktopManager = new DesktopManager(); 