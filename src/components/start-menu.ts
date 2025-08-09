// Start menu component for Linux 95 Desktop
import { eventBus } from '../core/event-bus.js';
import { appRegistry } from '../core/app-registry.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';

export class StartMenu {
  private element: HTMLElement;
  private isVisible = false;
  private cleanupTasks: (() => void)[] = [];

  constructor() {
    this.element = this.createStartMenu();
    this.setupEventListeners();
  }

  private createStartMenu(): HTMLElement {
    const menu = createElement('div', 'start-menu');
    menu.style.display = 'none';
    
    const menuItems = [
      { id: 'terminal', title: 'XTerm', icon: '💻' },
      { id: 'fileManager', title: 'File Manager', icon: '📁' },
      { id: 'textEditor', title: 'Text Editor', icon: '📝' },
      { id: 'browser', title: 'Netscape', icon: '🌐' },
      { id: 'aiChat', title: 'AI Assistant', icon: '🤖' },
      { id: 'minesweeper', title: 'XMines', icon: '💣' },
      { id: 'audioPlayer', title: 'XMMS', icon: '🎵' },
      { id: 'imageViewer', title: 'XV Image', icon: '🖼️' }
    ];

    menuItems.forEach(item => {
      const menuItem = createElement('div', 'start-menu-item');
      menuItem.innerHTML = `<span class="menu-icon">${item.icon}</span>${item.title}`;
      
      addEventListenerWithCleanup(menuItem, 'click', () => {
        this.launchApp(item.id);
        this.hide();
      }, this.cleanupTasks);
      
      menu.appendChild(menuItem);
    });

    return menu;
  }

  private setupEventListeners(): void {
    eventBus.on('start-menu:toggle', () => {
      this.toggle();
    });

    // Hide menu when clicking outside
    addEventListenerWithCleanup(document, 'click', (e) => {
      const target = e.target as HTMLElement;
      if (this.isVisible && 
          !this.element.contains(target) && 
          !target.classList.contains('start-button')) {
        this.hide();
      }
    }, this.cleanupTasks);
  }

  private async launchApp(appId: string): Promise<void> {
    try {
      await appRegistry.openApp(appId);
    } catch (error) {
      console.error(`Failed to launch app ${appId}:`, error);
    }
  }

  show(): void {
    this.isVisible = true;
    this.element.style.display = 'block';
    eventBus.emit('start-menu:shown');
  }

  hide(): void {
    this.isVisible = false;
    this.element.style.display = 'none';
    eventBus.emit('start-menu:hidden');
  }

  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  getElement(): HTMLElement {
    return this.element;
  }

  cleanup(): void {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
} 