// Core window management system for Linux 95 Desktop
import { WindowConfig, WindowInstance, WindowState, WindowSystemInterface } from '../types/window.js';
import { eventBus } from './event-bus.js';
import { createElement, setStyles, addEventListenerWithCleanup } from '../utils/dom-helpers.js';

class WindowSystem implements WindowSystemInterface {
  private windows: Map<string, WindowInstance> = new Map();
  private highestZIndex = 100;
  private cleanupTasks: (() => void)[] = [];

  createWindow(config: WindowConfig, content?: HTMLElement): WindowInstance {
    const windowEl = this.createWindowElement(config);
    const state: WindowState = {
      id: config.id,
      isMinimized: false,
      isFocused: true,
      isMaximized: false,
      position: { x: config.x || 100, y: config.y || 100 },
      size: { width: config.width, height: config.height },
      zIndex: ++this.highestZIndex
    };

    const instance: WindowInstance = {
      id: config.id,
      element: windowEl,
      config,
      state,
      content
    };

    if (content) {
      const contentArea = windowEl.querySelector('.window-content') as HTMLElement;
      contentArea.appendChild(content);
    }

    this.setupWindowEvents(instance);
    this.windows.set(config.id, instance);
    this.applyWindowState(instance);
    
    document.body.appendChild(windowEl);
    eventBus.emit('window:created', { windowId: config.id });
    
    return instance;
  }

  private createWindowElement(config: WindowConfig): HTMLElement {
    const window = createElement('div', `window resizable ${config.className || ''}`);
    window.id = config.id;
    
    const titlebar = createElement('div', 'window-titlebar');
    const title = createElement('span', 'window-title', config.title);
    const controls = createElement('div', 'window-controls');
    
    if (config.minimizable !== false) {
      const minimize = createElement('div', 'window-minimize window-control-button', '−');
      controls.appendChild(minimize);
    }
    
    if (config.closable !== false) {
      const close = createElement('div', 'window-close window-control-button', '✕');
      controls.appendChild(close);
    }
    
    titlebar.appendChild(title);
    titlebar.appendChild(controls);
    
    const content = createElement('div', 'window-content');
    
    window.appendChild(titlebar);
    window.appendChild(content);
    
    return window;
  }

  private setupWindowEvents(instance: WindowInstance): void {
    const { element, config } = instance;
    const titlebar = element.querySelector('.window-titlebar') as HTMLElement;
    const minimizeBtn = element.querySelector('.window-minimize') as HTMLElement;
    const closeBtn = element.querySelector('.window-close') as HTMLElement;

    // Window dragging
    if (titlebar) {
      this.setupDragging(instance, titlebar);
    }

    // Control buttons
    if (minimizeBtn) {
      addEventListenerWithCleanup(minimizeBtn, 'click', () => this.minimizeWindow(config.id), this.cleanupTasks);
    }
    
    if (closeBtn) {
      addEventListenerWithCleanup(closeBtn, 'click', () => this.closeWindow(config.id), this.cleanupTasks);
    }

    // Focus on click
    addEventListenerWithCleanup(element, 'mousedown', () => this.focusWindow(config.id), this.cleanupTasks);
  }

  private setupDragging(instance: WindowInstance, titlebar: HTMLElement): void {
    let isDragging = false;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0;

    const startDrag = (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(instance.element.style.left) || 0;
      startTop = parseInt(instance.element.style.top) || 0;
      titlebar.style.cursor = 'grabbing';
    };

    const drag = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      this.moveWindow(instance.id, startLeft + deltaX, startTop + deltaY);
    };

    const stopDrag = () => {
      isDragging = false;
      titlebar.style.cursor = 'grab';
    };

    addEventListenerWithCleanup(titlebar, 'mousedown', startDrag, this.cleanupTasks);
    addEventListenerWithCleanup(document, 'mousemove', drag, this.cleanupTasks);
    addEventListenerWithCleanup(document, 'mouseup', stopDrag, this.cleanupTasks);
  }

  private applyWindowState(instance: WindowInstance): void {
    const { element, state } = instance;
    setStyles(element, {
      left: `${state.position.x}px`,
      top: `${state.position.y}px`,
      width: `${state.size.width}px`,
      height: `${state.size.height}px`,
      zIndex: state.zIndex.toString(),
      display: state.isMinimized ? 'none' : 'flex'
    });
  }

  closeWindow(windowId: string): void {
    const instance = this.windows.get(windowId);
    if (!instance) return;

    eventBus.emit('window:closing', { windowId });
    instance.element.remove();
    this.windows.delete(windowId);
    eventBus.emit('window:closed', { windowId });
  }

  minimizeWindow(windowId: string): void {
    const instance = this.windows.get(windowId);
    if (!instance) return;

    instance.state.isMinimized = !instance.state.isMinimized;
    this.applyWindowState(instance);
    eventBus.emit('window:minimized', { windowId, minimized: instance.state.isMinimized });
  }

  focusWindow(windowId: string): void {
    const instance = this.windows.get(windowId);
    if (!instance) return;

    // Unfocus all windows
    this.windows.forEach(w => {
      w.state.isFocused = false;
      w.element.classList.remove('active');
    });

    // Focus target window
    instance.state.isFocused = true;
    instance.state.zIndex = ++this.highestZIndex;
    instance.element.classList.add('active');
    this.applyWindowState(instance);
    
    eventBus.emit('window:focused', { windowId });
  }

  moveWindow(windowId: string, x: number, y: number): void {
    const instance = this.windows.get(windowId);
    if (!instance) return;

    instance.state.position = { x, y };
    this.applyWindowState(instance);
  }

  resizeWindow(windowId: string, width: number, height: number): void {
    const instance = this.windows.get(windowId);
    if (!instance) return;

    instance.state.size = { width, height };
    this.applyWindowState(instance);
  }

  getWindow(windowId: string): WindowInstance | null {
    return this.windows.get(windowId) || null;
  }

  getAllWindows(): WindowInstance[] {
    return Array.from(this.windows.values());
  }

  cleanup(): void {
    this.windows.forEach(instance => instance.element.remove());
    this.windows.clear();
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
}

export const windowSystem = new WindowSystem(); 