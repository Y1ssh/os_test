// Main desktop orchestration system for Linux 95 Desktop
import { eventBus } from './event-bus.js';
import { windowSystem } from './window-system.js';
import { appRegistry } from './app-registry.js';
import { Taskbar } from '../components/taskbar.js';
import { StartMenu } from '../components/start-menu.js';
import { aiService } from '../utils/ai-service.js';

export class DesktopManager {
  private taskbar!: Taskbar;
  private startMenu!: StartMenu;
  private isInitialized = false;
  private cleanupTasks: (() => void)[] = [];

  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize AI service
      await aiService.initialize();

      // Register all applications
      this.registerApplications();

      // Initialize UI components
      this.initializeComponents();

      // Setup desktop icons
      this.setupDesktopIcons();

      // Setup global event handlers
      this.setupGlobalEvents();

      this.isInitialized = true;
      eventBus.emit('desktop:ready');
      
      console.log('Linux 95 Desktop Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize desktop manager:', error);
    }
  }

  private registerApplications(): void {
    // Lazy-loaded app registrations
    appRegistry.register('terminal', () => import('../apps/terminal.js').then(m => new m.TerminalApp()));
    appRegistry.register('fileManager', () => import('../apps/file-manager.js').then(m => new m.FileManagerApp()));
    appRegistry.register('minesweeper', () => import('../apps/minesweeper.js').then(m => new m.MinesweeperApp()));
    appRegistry.register('textEditor', () => import('../apps/text-editor.js').then(m => new m.TextEditorApp()));
    appRegistry.register('aiChat', () => import('../apps/ai-chat.js').then(m => new m.AIChatApp()));
    appRegistry.register('browser', () => import('../apps/browser.js').then(m => new m.BrowserApp()));
    appRegistry.register('audioPlayer', () => import('../apps/audio-player.js').then(m => new m.AudioPlayerApp()));
    appRegistry.register('imageViewer', () => import('../apps/image-viewer.js').then(m => new m.ImageViewerApp()));
  }

  private initializeComponents(): void {
    // Create taskbar
    this.taskbar = new Taskbar();
    document.body.appendChild(this.taskbar.getElement());

    // Create start menu
    this.startMenu = new StartMenu();
    document.body.appendChild(this.startMenu.getElement());
  }

  private setupDesktopIcons(): void {
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

  private setupGlobalEvents(): void {
    // Handle window toggle from taskbar
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

    // Setup desktop click to hide start menu
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.start-menu') && !target.closest('.start-button')) {
        this.startMenu.hide();
      }
    });
  }

  async openApp(appId: string): Promise<void> {
    try {
      await appRegistry.openApp(appId);
    } catch (error) {
      console.error(`Failed to open app ${appId}:`, error);
    }
  }

  cleanup(): void {
    this.taskbar?.cleanup();
    this.startMenu?.cleanup();
    appRegistry.cleanup();
    windowSystem.cleanup();
    eventBus.cleanup();
    
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
    this.isInitialized = false;
  }
}

export const desktopManager = new DesktopManager(); 