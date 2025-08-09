// Browser application for Linux 95 Desktop
import { AppInterface, AppConfig } from '../types/app.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';

export class BrowserApp implements AppInterface {
  config: AppConfig = {
    id: 'browser',
    title: 'Netscape Navigator',
    icon: '🌐',
    category: 'internet',
    windowConfig: {
      width: 600,
      height: 450,
      resizable: true
    }
  };

  private element!: HTMLElement;
  private addressBar!: HTMLInputElement;
  private browserFrame!: HTMLIFrameElement;
  private cleanupTasks: (() => void)[] = [];

  init(): void {
    // Initialize browser
  }

  render(): HTMLElement {
    this.element = createElement('div', 'browser-app');
    
    this.createToolbar();
    this.createBrowserFrame();
    this.loadDefaultPage();
    
    return this.element;
  }

  private createToolbar(): void {
    const toolbar = createElement('div', 'browser-toolbar');
    
    const backBtn = createElement('button', 'browser-btn', '←');
    const forwardBtn = createElement('button', 'browser-btn', '→');
    const refreshBtn = createElement('button', 'browser-btn', '🔄');
    
    this.addressBar = createElement('input', 'browser-address-bar') as HTMLInputElement;
    this.addressBar.type = 'text';
    this.addressBar.placeholder = 'Enter URL...';
    this.addressBar.value = 'https://web.archive.org/web/19961019172027/http://www.netscape.com/';
    
    const goBtn = createElement('button', 'browser-btn', 'Go');

    addEventListenerWithCleanup(backBtn, 'click', () => {
      this.showMessage('Back button (simulated)');
    }, this.cleanupTasks);

    addEventListenerWithCleanup(forwardBtn, 'click', () => {
      this.showMessage('Forward button (simulated)');
    }, this.cleanupTasks);

    addEventListenerWithCleanup(refreshBtn, 'click', () => {
      this.refreshPage();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(goBtn, 'click', () => {
      this.navigateToUrl();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(this.addressBar, 'keypress', (e) => {
      const keyEvent = e as KeyboardEvent;
      if (keyEvent.key === 'Enter') {
        this.navigateToUrl();
      }
    }, this.cleanupTasks);

    toolbar.appendChild(backBtn);
    toolbar.appendChild(forwardBtn);
    toolbar.appendChild(refreshBtn);
    toolbar.appendChild(this.addressBar);
    toolbar.appendChild(goBtn);
    
    this.element.appendChild(toolbar);
  }

  private createBrowserFrame(): void {
    this.browserFrame = createElement('iframe', 'browser-frame') as HTMLIFrameElement;
    this.browserFrame.sandbox = 'allow-scripts allow-same-origin allow-forms allow-top-navigation';
    this.element.appendChild(this.browserFrame);
  }

  private loadDefaultPage(): void {
    const defaultUrl = 'https://web.archive.org/web/19961019172027/http://www.netscape.com/';
    this.browserFrame.src = defaultUrl;
    this.addressBar.value = defaultUrl;
  }

  private navigateToUrl(): void {
    let url = this.addressBar.value.trim();
    if (!url) return;

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // For safety, redirect to archive.org for retro experience
    if (!url.includes('web.archive.org')) {
      const archiveUrl = `https://web.archive.org/web/19960101000000*/${url}`;
      this.browserFrame.src = archiveUrl;
      this.showMessage('Redirected to Web Archive for authentic 1995 experience!');
    } else {
      this.browserFrame.src = url;
    }
  }

  private refreshPage(): void {
    if (this.browserFrame.src) {
      this.browserFrame.src = this.browserFrame.src;
    }
  }

  private showMessage(message: string): void {
    const messageEl = createElement('div', 'browser-message', message);
    this.element.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.remove();
    }, 3000);
  }

  cleanup(): void {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
}

export default BrowserApp; 