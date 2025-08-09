// Desktop context menu component - Replaces Windows Start menu with authentic Linux right-click menu
import { eventBus } from '../core/event-bus.js';
import { appRegistry } from '../core/app-registry.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';

export class DesktopContextMenu {
  private element: HTMLElement | null = null;
  private isVisible = false;
  private cleanupTasks: (() => void)[] = [];

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Show context menu on right-click
    addEventListenerWithCleanup(document, 'contextmenu', (e) => {
      const mouseEvent = e as MouseEvent;
      const target = mouseEvent.target as HTMLElement;
      if (target.classList.contains('desktop') || target.closest('.desktop')) {
        mouseEvent.preventDefault();
        this.show(mouseEvent.clientX, mouseEvent.clientY);
      }
    }, this.cleanupTasks);

    // Hide context menu on left-click elsewhere
    addEventListenerWithCleanup(document, 'click', (e) => {
      const target = e.target as HTMLElement;
      if (this.isVisible && !target.closest('.desktop-menu')) {
        this.hide();
      }
    }, this.cleanupTasks);

    // Hide on escape key
    addEventListenerWithCleanup(document, 'keydown', (e) => {
      const keyEvent = e as KeyboardEvent;
      if (keyEvent.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    }, this.cleanupTasks);
  }

  private createMenu(): HTMLElement {
    const menu = createElement('div', 'desktop-menu');
    
    const menuItems = [
      { id: 'terminal', title: 'Open XTerm', icon: '💻' },
      { id: 'fileManager', title: 'File Manager', icon: '📁' },
      { separator: true },
      { id: 'xcalc', title: 'Calculator', icon: '🧮' },
      { id: 'xeyes', title: 'XEyes', icon: '👀' },
      { separator: true },
      { id: 'mosaic', title: 'NCSA Mosaic', icon: '🌐' },
      { id: 'pine', title: 'Pine Mail', icon: '📧' },
      { separator: true },
      { id: 'textEditor', title: 'Text Editor', icon: '📝' },
      { id: 'imageViewer', title: 'Image Viewer', icon: '🖼️' },
      { id: 'minesweeper', title: 'XMines', icon: '💣' },
      { separator: true },
      { action: 'properties', title: 'Desktop Properties...', icon: '⚙️' },
      { action: 'refresh', title: 'Refresh Desktop', icon: '🔄' }
    ];

    menuItems.forEach(item => {
      if (item.separator) {
        const separator = createElement('div', 'menu-separator');
        menu.appendChild(separator);
      } else {
        const menuItem = createElement('div', 'menu-item');
        menuItem.innerHTML = `<span class="menu-icon">${item.icon}</span>${item.title}`;
        
        addEventListenerWithCleanup(menuItem, 'click', () => {
          if (item.id) {
            this.launchApp(item.id);
          } else if (item.action) {
            this.handleAction(item.action);
          }
          this.hide();
        }, this.cleanupTasks);
        
        menu.appendChild(menuItem);
      }
    });

    return menu;
  }

  private async launchApp(appId: string): Promise<void> {
    try {
      await appRegistry.openApp(appId);
    } catch (error) {
      console.error(`Failed to launch app ${appId}:`, error);
    }
  }

  private handleAction(action: string): void {
    switch (action) {
      case 'properties':
        this.showDesktopProperties();
        break;
      case 'refresh':
        this.refreshDesktop();
        break;
    }
  }

  private showDesktopProperties(): void {
    // Create a simple properties dialog
    const dialog = createElement('div', 'desktop-properties-dialog');
    dialog.innerHTML = `
      <div class="modal">
        <div class="modal-content">
          <div class="x11-error-title">Desktop Properties</div>
          <div class="x11-error-message">
            <p><strong>Desktop Environment:</strong> FVWM 2.2</p>
            <p><strong>X11 Server:</strong> XFree86 3.1.2</p>
            <p><strong>Window Manager:</strong> FVWM</p>
            <p><strong>Display:</strong> :0.0 (1024x768x8)</p>
            <p><strong>Virtual Desktops:</strong> 4</p>
            <p><strong>Memory:</strong> 16MB RAM</p>
            <p><strong>Kernel:</strong> Linux 1.2.13</p>
          </div>
          <div class="x11-error-buttons">
            <button class="close-props">OK</button>
          </div>
        </div>
      </div>
    `;

    const closeBtn = dialog.querySelector('.close-props') as HTMLElement;
    addEventListenerWithCleanup(closeBtn, 'click', () => {
      dialog.remove();
    }, this.cleanupTasks);

    document.body.appendChild(dialog);
  }

  private refreshDesktop(): void {
    // Simple refresh animation
    const desktop = document.querySelector('.desktop') as HTMLElement;
    if (desktop) {
      desktop.style.opacity = '0.8';
      setTimeout(() => {
        desktop.style.opacity = '1';
      }, 200);
    }
  }

  show(x: number, y: number): void {
    this.hide(); // Hide existing menu first
    
    this.element = this.createMenu();
    document.body.appendChild(this.element);
    
    // Position menu
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    
    // Adjust position if menu would go off-screen
    const rect = this.element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (rect.right > viewportWidth) {
      this.element.style.left = `${x - rect.width}px`;
    }
    
    if (rect.bottom > viewportHeight) {
      this.element.style.top = `${y - rect.height}px`;
    }
    
    this.isVisible = true;
    eventBus.emit('context-menu:shown');
  }

  hide(): void {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    this.isVisible = false;
    eventBus.emit('context-menu:hidden');
  }

  cleanup(): void {
    this.hide();
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
} 