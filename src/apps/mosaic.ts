// NCSA Mosaic browser application - Authentic 1995 web browser
import { AppInterface, AppConfig } from '../types/app.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';

export class MosaicApp implements AppInterface {
  config: AppConfig = {
    id: 'mosaic',
    title: 'NCSA Mosaic',
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
  private contentArea!: HTMLElement;
  private cleanupTasks: (() => void)[] = [];

  init(): void {
    // Initialize Mosaic browser
  }

  render(): HTMLElement {
    this.element = createElement('div', 'mosaic-app');
    
    this.createToolbar();
    this.createContentArea();
    this.loadHomePage();
    
    return this.element;
  }

  private createToolbar(): void {
    const toolbar = createElement('div', 'mosaic-toolbar');
    
    const backBtn = createElement('button', 'mosaic-btn', 'Back');
    const forwardBtn = createElement('button', 'mosaic-btn', 'Forward');
    const homeBtn = createElement('button', 'mosaic-btn', 'Home');
    const reloadBtn = createElement('button', 'mosaic-btn', 'Reload');
    
    const urlContainer = createElement('div', 'url-container');
    const urlLabel = createElement('span', 'url-label', 'URL:');
    this.addressBar = createElement('input', 'url-input') as HTMLInputElement;
    this.addressBar.type = 'text';
    this.addressBar.value = 'http://www.ncsa.uiuc.edu/';
    
    const goBtn = createElement('button', 'mosaic-btn', 'Go');

    addEventListenerWithCleanup(backBtn, 'click', () => {
      this.showMessage('Back button clicked');
    }, this.cleanupTasks);

    addEventListenerWithCleanup(forwardBtn, 'click', () => {
      this.showMessage('Forward button clicked');
    }, this.cleanupTasks);

    addEventListenerWithCleanup(homeBtn, 'click', () => {
      this.loadHomePage();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(reloadBtn, 'click', () => {
      this.reloadPage();
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

    urlContainer.appendChild(urlLabel);
    urlContainer.appendChild(this.addressBar);
    
    toolbar.appendChild(backBtn);
    toolbar.appendChild(forwardBtn);
    toolbar.appendChild(homeBtn);
    toolbar.appendChild(reloadBtn);
    toolbar.appendChild(urlContainer);
    toolbar.appendChild(goBtn);
    
    this.element.appendChild(toolbar);
  }

  private createContentArea(): void {
    this.contentArea = createElement('div', 'mosaic-content');
    this.element.appendChild(this.contentArea);
  }

  private loadHomePage(): void {
    this.addressBar.value = 'http://www.ncsa.uiuc.edu/';
    this.contentArea.innerHTML = `
      <div class="mosaic-page">
        <h1>NCSA Mosaic for X</h1>
        <h2>Welcome to the World Wide Web</h2>
        <p><strong>Version 2.7b5</strong></p>
        
        <hr>
        
        <h3>Getting Started</h3>
        <p>NCSA Mosaic is a network navigation tool to access information across the Internet. 
        This "home page" provides a good starting point for exploring the Web.</p>
        
        <h3>Popular Sites (1995)</h3>
        <ul>
          <li><a href="#" onclick="return false;">CERN - Where the Web was born</a></li>
          <li><a href="#" onclick="return false;">Yahoo! Directory</a></li>
          <li><a href="#" onclick="return false;">Netscape Communications</a></li>
          <li><a href="#" onclick="return false;">MIT Computer Science Lab</a></li>
          <li><a href="#" onclick="return false;">University of Illinois</a></li>
        </ul>
        
        <h3>Internet Resources</h3>
        <ul>
          <li><a href="#" onclick="return false;">Gopher Servers</a></li>
          <li><a href="#" onclick="return false;">FTP Archives</a></li>
          <li><a href="#" onclick="return false;">WAIS Databases</a></li>
          <li><a href="#" onclick="return false;">Usenet News</a></li>
        </ul>
        
        <hr>
        
        <p><em>This page last updated: January 1995</em></p>
        <p><small>NCSA Mosaic was developed at the National Center for Supercomputing Applications 
        at the University of Illinois in Urbana-Champaign.</small></p>
      </div>
    `;
  }

  private navigateToUrl(): void {
    const url = this.addressBar.value.trim();
    if (!url) return;

    // Simulate loading a 1995-era website
    this.contentArea.innerHTML = `
      <div class="mosaic-page">
        <h1>Loading...</h1>
        <p>Connecting to: ${url}</p>
        <hr>
        <h2>Simulated 1995 Website</h2>
        <p>This is a simulation of what a typical website looked like in 1995.</p>
        <ul>
          <li>Plain HTML with minimal styling</li>
          <li>Simple blue hyperlinks</li>
          <li>Basic tables and lists</li>
          <li>No CSS or JavaScript</li>
        </ul>
        <p><strong>Note:</strong> Many sites were still text-only or had very basic graphics.</p>
        <hr>
        <p><a href="#" onclick="return false;">Back to NCSA</a> | 
           <a href="#" onclick="return false;">What's New</a> | 
           <a href="#" onclick="return false;">Comments</a></p>
      </div>
    `;
  }

  private reloadPage(): void {
    this.showMessage('Reloading page...');
    // Just redisplay current content
  }

  private showMessage(message: string): void {
    // Show status message in content area temporarily
    const statusDiv = createElement('div', 'mosaic-status', message);
    this.element.appendChild(statusDiv);
    
    setTimeout(() => {
      statusDiv.remove();
    }, 2000);
  }

  cleanup(): void {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
}

export default MosaicApp; 