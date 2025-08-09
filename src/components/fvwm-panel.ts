// FVWM panel component - Authentic Linux desktop panel
import { eventBus } from '../core/event-bus.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';

export class FVWMPanel {
  private element: HTMLElement;
  private appsContainer: HTMLElement;
  private pager: HTMLElement;
  private cleanupTasks: (() => void)[] = [];
  private appButtons: Map<string, HTMLElement> = new Map();
  private currentDesktop = 0;

  constructor() {
    this.element = this.createPanel();
    this.appsContainer = this.element.querySelector('.panel-apps') as HTMLElement;
    this.pager = this.element.querySelector('.panel-pager') as HTMLElement;
    this.setupEventListeners();
    this.updateClock();
  }

  private createPanel(): HTMLElement {
    const panel = createElement('div', 'fvwm-panel');
    
    // Virtual desktop pager
    const pager = createElement('div', 'panel-pager');
    for (let i = 0; i < 4; i++) {
      const desktop = createElement('div', 'virtual-desktop');
      if (i === 0) desktop.classList.add('active');
      desktop.dataset.desktop = i.toString();
      pager.appendChild(desktop);
    }
    
    // Application buttons container
    const appsContainer = createElement('div', 'panel-apps');
    
    // Clock
    const clock = createElement('div', 'panel-clock');
    
    panel.appendChild(pager);
    panel.appendChild(appsContainer);
    panel.appendChild(clock);
    
    return panel;
  }

  private setupEventListeners(): void {
    // Virtual desktop switching
    const desktops = this.pager.querySelectorAll('.virtual-desktop');
    desktops.forEach((desktop, index) => {
      addEventListenerWithCleanup(desktop, 'click', () => {
        this.switchDesktop(index);
      }, this.cleanupTasks);
    });

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

    eventBus.on('window:focused', ({ windowId }) => {
      this.updateAppButtonFocus(windowId);
    });

    // Update clock every minute
    setInterval(() => this.updateClock(), 60000);
  }

  private switchDesktop(desktopIndex: number): void {
    if (desktopIndex === this.currentDesktop) return;

    // Update pager appearance
    const desktops = this.pager.querySelectorAll('.virtual-desktop');
    desktops.forEach((desktop, index) => {
      desktop.classList.toggle('active', index === desktopIndex);
    });

    this.currentDesktop = desktopIndex;
    eventBus.emit('desktop:switched', { desktop: desktopIndex });
  }

  private addAppButton(appId: string, windowId: string): void {
    const button = createElement('div', 'panel-app');
    button.dataset.appId = appId;
    button.dataset.windowId = windowId;
    
    // Get app title
    const title = this.getAppTitle(appId);
    button.textContent = title;
    
    addEventListenerWithCleanup(button, 'click', () => {
      eventBus.emit('window:toggle', { windowId });
    }, this.cleanupTasks);

    // Add middle-click to close
    addEventListenerWithCleanup(button, 'auxclick', (e) => {
      const mouseEvent = e as MouseEvent;
      if (mouseEvent.button === 1) { // Middle button
        eventBus.emit('window:close-request', { windowId });
      }
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

  private updateAppButtonFocus(windowId: string): void {
    // Remove active state from all buttons
    const buttons = this.appsContainer.querySelectorAll('.panel-app');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Add active state to focused window's button
    const button = this.appsContainer.querySelector(`[data-window-id="${windowId}"]`) as HTMLElement;
    if (button) {
      button.classList.add('active');
    }
  }

  private getAppTitle(appId: string): string {
    const titles: Record<string, string> = {
      terminal: 'xterm',
      fileManager: 'Files',
      textEditor: 'xedit',
      minesweeper: 'xmines',
      browser: 'Mosaic',
      mosaic: 'Mosaic',
      aiChat: 'Chat',
      audioPlayer: 'Audio',
      imageViewer: 'xv',
      xeyes: 'xeyes',
      xcalc: 'xcalc',
      pine: 'pine'
    };
    return titles[appId] || appId;
  }

  private updateClock(): void {
    const clock = this.element.querySelector('.panel-clock') as HTMLElement;
    const now = new Date();
    
    // Format like classic Unix systems
    const timeStr = now.toLocaleTimeString([], { 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    clock.innerHTML = `${dateStr}<br>${timeStr}`;
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