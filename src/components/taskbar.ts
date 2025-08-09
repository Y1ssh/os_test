// Taskbar component for Linux 95 Desktop
import { eventBus } from '../core/event-bus.js';
import { createElement, findElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';

export class Taskbar {
  private element: HTMLElement;
  private appsContainer: HTMLElement;
  private cleanupTasks: (() => void)[] = [];
  private appButtons: Map<string, HTMLElement> = new Map();

  constructor() {
    this.element = this.createTaskbar();
    this.appsContainer = this.element.querySelector('.taskbar-apps') as HTMLElement;
    this.setupEventListeners();
  }

  private createTaskbar(): HTMLElement {
    const taskbar = createElement('div', 'taskbar');
    
    const startButton = createElement('button', 'start-button', 'Start');
    const appsContainer = createElement('div', 'taskbar-apps');
    const clock = createElement('div', 'taskbar-clock');
    
    this.updateClock(clock);
    setInterval(() => this.updateClock(clock), 1000);
    
    taskbar.appendChild(startButton);
    taskbar.appendChild(appsContainer);
    taskbar.appendChild(clock);
    
    return taskbar;
  }

  private updateClock(clockElement: HTMLElement): void {
    const now = new Date();
    clockElement.textContent = now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  private setupEventListeners(): void {
    const startButton = this.element.querySelector('.start-button') as HTMLElement;
    
    addEventListenerWithCleanup(startButton, 'click', () => {
      eventBus.emit('start-menu:toggle');
    }, this.cleanupTasks);

    // Listen for app events
    eventBus.on('app:opened', ({ appId, windowId }) => {
      this.addAppButton(appId, windowId);
    });

    eventBus.on('app:closed', ({ appId }) => {
      this.removeAppButton(appId);
    });

    eventBus.on('window:minimized', ({ windowId, minimized }) => {
      this.updateAppButtonState(windowId, minimized);
    });
  }

  private addAppButton(appId: string, windowId: string): void {
    const button = createElement('div', 'taskbar-app');
    button.dataset.appId = appId;
    button.dataset.windowId = windowId;
    
    // Get app icon and title from registry or fallback
    const title = this.getAppTitle(appId);
    button.textContent = title;
    
    addEventListenerWithCleanup(button, 'click', () => {
      eventBus.emit('window:toggle', { windowId });
    }, this.cleanupTasks);

    this.appsContainer.appendChild(button);
    this.appButtons.set(appId, button);
  }

  private removeAppButton(appId: string): void {
    const button = this.appButtons.get(appId);
    if (button) {
      button.remove();
      this.appButtons.delete(appId);
    }
  }

  private updateAppButtonState(windowId: string, minimized: boolean): void {
    const button = this.appsContainer.querySelector(`[data-window-id="${windowId}"]`) as HTMLElement;
    if (button) {
      button.classList.toggle('minimized', minimized);
    }
  }

  private getAppTitle(appId: string): string {
    const titles: Record<string, string> = {
      terminal: 'XTerm',
      fileManager: 'File Manager',
      textEditor: 'Text Editor',
      minesweeper: 'XMines',
      browser: 'Netscape',
      aiChat: 'AI Assistant',
      audioPlayer: 'XMMS',
      imageViewer: 'XV Image'
    };
    return titles[appId] || appId;
  }

  getElement(): HTMLElement {
    return this.element;
  }

  cleanup(): void {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
    this.appButtons.clear();
  }
} 