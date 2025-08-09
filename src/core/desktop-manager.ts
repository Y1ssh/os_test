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
  private selectedIcon: HTMLElement | null = null;
  private dragState = { isDragging: false, element: null as HTMLElement | null, startX: 0, startY: 0 };

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
    
    console.log('📱 Registered all Linux 95 applications');
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
    // Add trash icon if it doesn't exist
    this.addTrashIcon();

    // Setup icon interactions with drag and drop
    const iconElements = document.querySelectorAll('.icon[data-app]');
    iconElements.forEach(iconEl => {
      const icon = iconEl as HTMLElement;
      const appId = icon.dataset.app;
      if (!appId) return;

      // Make icon draggable
      this.makeIconDraggable(icon);

      // Single click selection
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectIcon(icon);
      });

      // Double-click to open
      icon.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.openApp(appId);
      });
    });

    // Desktop click to deselect icons
    const desktop = document.querySelector('.desktop');
    if (desktop) {
      desktop.addEventListener('click', (e) => {
        if (e.target === desktop) {
          this.deselectAllIcons();
        }
      });
    }
  }

  private makeIconDraggable(icon: HTMLElement): void {
    icon.style.position = 'absolute';
    icon.style.cursor = 'pointer';
    
    // Get initial position
    const rect = icon.getBoundingClientRect();
    const desktop = document.querySelector('.desktop') as HTMLElement;
    const desktopRect = desktop.getBoundingClientRect();
    
    icon.style.left = `${rect.left - desktopRect.left}px`;
    icon.style.top = `${rect.top - desktopRect.top}px`;

    icon.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left mouse button
      
      e.preventDefault();
      this.dragState.isDragging = true;
      this.dragState.element = icon;
      this.dragState.startX = e.clientX - parseInt(icon.style.left || '0');
      this.dragState.startY = e.clientY - parseInt(icon.style.top || '0');
      
      icon.style.zIndex = '1000';
      document.body.style.cursor = 'grabbing';
    });

    // Global mouse events for dragging
    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (!this.dragState.isDragging || this.dragState.element !== icon) return;
      
      e.preventDefault();
      const desktop = document.querySelector('.desktop') as HTMLElement;
      const desktopRect = desktop.getBoundingClientRect();
      
      let newX = e.clientX - this.dragState.startX;
      let newY = e.clientY - this.dragState.startY;
      
      // Keep icon within desktop bounds
      newX = Math.max(0, Math.min(newX, desktopRect.width - icon.offsetWidth));
      newY = Math.max(0, Math.min(newY, desktopRect.height - icon.offsetHeight));
      
      icon.style.left = `${newX}px`;
      icon.style.top = `${newY}px`;
    });

    document.addEventListener('mouseup', () => {
      if (this.dragState.element === icon) {
        this.dragState.isDragging = false;
        this.dragState.element = null;
        icon.style.zIndex = '';
        document.body.style.cursor = '';
      }
    });
  }

  private selectIcon(icon: HTMLElement): void {
    // Deselect previous icon
    this.deselectAllIcons();
    
    // Select new icon
    icon.classList.add('selected');
    this.selectedIcon = icon;
  }

  private deselectAllIcons(): void {
    const icons = document.querySelectorAll('.icon.selected');
    icons.forEach(icon => icon.classList.remove('selected'));
    this.selectedIcon = null;
  }

  private addTrashIcon(): void {
    const desktop = document.querySelector('.desktop');
    if (!desktop || document.querySelector('[data-app="trash"]')) return;

    const trashIcon = document.createElement('div');
    trashIcon.className = 'icon';
    trashIcon.dataset.app = 'trash';
    trashIcon.style.position = 'absolute';
    trashIcon.style.right = '20px';
    trashIcon.style.bottom = '60px';
    trashIcon.innerHTML = `
      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23C0C0C0' stroke='%23000' stroke-width='2'/%3E%3Crect x='12' y='16' width='24' height='24' fill='%23808080' stroke='%23000'/%3E%3Crect x='16' y='8' width='16' height='4' fill='%23A0A0A0' stroke='%23000'/%3E%3Cline x1='18' y1='20' x2='18' y2='32' stroke='%23000' stroke-width='2'/%3E%3Cline x1='24' y1='20' x2='24' y2='32' stroke='%23000' stroke-width='2'/%3E%3Cline x1='30' y1='20' x2='30' y2='32' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E" alt="Trash" />
      <span>Trash</span>
    `;

    // Make trash draggable too
    this.makeIconDraggable(trashIcon);

    // Add to icon setup
    trashIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectIcon(trashIcon);
    });

    trashIcon.addEventListener('dblclick', (e) => {
      e.stopPropagation();
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

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Delete key to open trash
      if (e.key === 'Delete' && this.selectedIcon?.dataset.app === 'trash') {
        this.openTrash();
      }
      // Enter key to open selected icon
      if (e.key === 'Enter' && this.selectedIcon) {
        const appId = this.selectedIcon.dataset.app;
        if (appId) {
          this.openApp(appId);
        }
      }
    });
  }

  private openTrash(): void {
    // Simple trash implementation - show empty folder
    const trashContent = document.createElement('div');
    trashContent.innerHTML = `
      <div class="x11-error">
        <div class="x11-error-title">Trash Can</div>
        <div class="x11-error-message">
          <p>The trash can is empty.</p>
          <p>Items deleted from the desktop will appear here.</p>
          <p><em>Note: This is a simulated trash can for demonstration purposes.</em></p>
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
      
      console.log(`🚀 Opening app: ${appId}`);
      await appRegistry.openApp(appId);
    } catch (error) {
      console.error(`Failed to open app ${appId}:`, error);
      
      // Show error dialog
      const errorDialog = document.createElement('div');
      errorDialog.innerHTML = `
        <div class="x11-error">
          <div class="x11-error-title">Application Error</div>
          <div class="x11-error-message">
            <p>Could not launch application: ${appId}</p>
            <p>The application may not be available or there was an error loading it.</p>
          </div>
          <div class="x11-error-buttons">
            <button onclick="this.closest('.x11-error').remove()">OK</button>
          </div>
        </div>
      `;
      
      errorDialog.style.position = 'fixed';
      errorDialog.style.top = '50%';
      errorDialog.style.left = '50%';
      errorDialog.style.transform = 'translate(-50%, -50())';
      errorDialog.style.zIndex = '2000';
      
      document.body.appendChild(errorDialog);
    }
  }

  cleanup(): void {
    this.fvwmPanel?.cleanup();
    this.contextMenu?.cleanup();
    appRegistry.cleanup();
    windowSystem.cleanup();
    
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
    this.isInitialized = false;
  }
}

export const desktopManager = new DesktopManager(); 