// Application registry with lazy loading for Linux 95 Desktop
import { AppInterface, AppInstance, AppConfig, AppRegistryInterface, AppLoader } from '../types/app.js';
import { WindowConfig } from '../types/window.js';
import { eventBus } from './event-bus.js';
import { windowSystem } from './window-system.js';

class AppRegistry implements AppRegistryInterface {
  private loaders: Map<string, AppLoader> = new Map();
  private instances: Map<string, AppInstance> = new Map();
  private loadedApps: Map<string, AppInterface> = new Map();

  register(appId: string, loader: AppLoader): void {
    this.loaders.set(appId, loader);
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
    if (!instance) return;

    const app = this.loadedApps.get(appId);
    if (app) {
      app.cleanup();
    }

    if (instance.windowId) {
      windowSystem.closeWindow(instance.windowId);
    }

    instance.isRunning = false;
    this.instances.delete(appId);
    eventBus.emit('app:closed', { appId });
  }

  getApp(appId: string): AppInstance | null {
    return this.instances.get(appId) || null;
  }

  getAllApps(): AppInstance[] {
    return Array.from(this.instances.values());
  }

  isAppRunning(appId: string): boolean {
    const instance = this.instances.get(appId);
    return instance?.isRunning || false;
  }

  cleanup(): void {
    this.instances.forEach((_, appId) => this.closeApp(appId));
    this.instances.clear();
    this.loadedApps.clear();
  }
}

export const appRegistry = new AppRegistry(); 