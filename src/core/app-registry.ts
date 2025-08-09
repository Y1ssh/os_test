// Application registry for managing app loading and lifecycle
import { eventBus } from './event-bus.js';
import { windowSystem, WindowConfig } from './window-system.js';
import { AppInterface, AppConfig } from '../types/app.js';

export type AppLoader = () => Promise<AppInterface>;

export interface AppInstance {
  id: string;
  config: AppConfig;
  windowId?: string;
  isRunning: boolean;
  element: HTMLElement;
}

export interface AppRegistryInterface {
  register(appId: string, loader: AppLoader): void;
  openApp(appId: string): Promise<AppInstance | null>;
  closeApp(appId: string): void;
  cleanup(): void;
}

class AppRegistry implements AppRegistryInterface {
  private loaders: Map<string, AppLoader> = new Map();
  private loadedApps: Map<string, AppInterface> = new Map();
  private instances: Map<string, AppInstance> = new Map();

  register(appId: string, loader: AppLoader): void {
    this.loaders.set(appId, loader);
    console.log(`📱 Registered app: ${appId}`);
  }

  async openApp(appId: string): Promise<AppInstance | null> {
    try {
      // Return existing instance if already running
      const existing = this.instances.get(appId);
      if (existing && existing.isRunning) {
        if (existing.windowId) {
          windowSystem.focusWindow(existing.windowId);
        }
        return existing;
      }

      // Load app if not cached
      let app = this.loadedApps.get(appId);
      if (!app) {
        const loader = this.loaders.get(appId);
        if (!loader) {
          console.error(`App loader not found: ${appId}`);
          return null;
        }
        
        console.log(`🚀 Loading app: ${appId}`);
        app = await loader();
        this.loadedApps.set(appId, app);
      }

      // Initialize app
      app.init();
      const content = app.render();

      // Create window with defaults
      const windowConfig: WindowConfig = {
        id: `${appId}-window`,
        title: app.config.title,
        width: 400,
        height: 300,
        ...app.config.windowConfig
      };

      const window = windowSystem.createWindow(windowConfig, content);

      // Create app instance
      const instance: AppInstance = {
        id: appId,
        config: app.config,
        windowId: window.id,
        isRunning: true,
        element: content
      };

      this.instances.set(appId, instance);
      eventBus.emit('app:opened', { appId, windowId: window.id });

      // Setup cleanup on window close
      eventBus.once('window:closed', (payload) => {
        if (payload.windowId === window.id) {
          this.closeApp(appId);
        }
      });

      return instance;
    } catch (error) {
      console.error(`Failed to open app ${appId}:`, error);
      return null;
    }
  }

  closeApp(appId: string): void {
    const instance = this.instances.get(appId);
    if (instance) {
      // Cleanup app if it has a cleanup method
      const app = this.loadedApps.get(appId);
      if (app && typeof app.cleanup === 'function') {
        app.cleanup();
      }

      instance.isRunning = false;
      this.instances.delete(appId);
      eventBus.emit('app:closed', { appId });
    }
  }

  cleanup(): void {
    this.instances.forEach((instance, appId) => {
      this.closeApp(appId);
    });
    this.loaders.clear();
    this.loadedApps.clear();
  }
}

export const appRegistry = new AppRegistry(); 