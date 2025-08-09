// File Manager application with larger sizing and realistic 1995 content
import { AppInterface, AppConfig } from '../types/app.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';
import { fileSystem, FileSystemNode } from '../utils/file-system.js';

export class FileManagerApp implements AppInterface {
  config: AppConfig = {
    id: 'fileManager',
    title: 'File Manager',
    icon: '📁',
    category: 'system',
    windowConfig: {
      width: 680, // Much larger for 1995 resolution
      height: 480,
      resizable: true
    }
  };

  private element!: HTMLElement;
  private pathBar!: HTMLElement;
  private fileList!: HTMLElement;
  private cleanupTasks: (() => void)[] = [];

  init(): void {
    // Initialize file system to default path
    fileSystem.changeDirectory('/home/user');
  }

  render(): HTMLElement {
    this.element = createElement('div', 'file-manager-app');
    
    this.createToolbar();
    this.createPathBar();
    this.createFileList();
    this.refreshView();

    return this.element;
  }

  private createToolbar(): void {
    const toolbar = createElement('div', 'fm-toolbar');
    
    const upButton = createElement('button', 'fm-button', '↑ Up');
    const homeButton = createElement('button', 'fm-button', '🏠 Home');
    const refreshButton = createElement('button', 'fm-button', '🔄 Refresh');
    const newFolderButton = createElement('button', 'fm-button', '📁 New Folder');

    addEventListenerWithCleanup(upButton, 'click', () => {
      fileSystem.changeDirectory('..');
      this.refreshView();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(homeButton, 'click', () => {
      fileSystem.changeDirectory('/home/user');
      this.refreshView();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(refreshButton, 'click', () => {
      this.refreshView();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(newFolderButton, 'click', () => {
      this.showMessage('New Folder: Feature not implemented in demonstration');
    }, this.cleanupTasks);

    toolbar.appendChild(upButton);
    toolbar.appendChild(homeButton);
    toolbar.appendChild(refreshButton);
    toolbar.appendChild(newFolderButton);
    this.element.appendChild(toolbar);
  }

  private createPathBar(): void {
    this.pathBar = createElement('div', 'fm-path-bar');
    this.element.appendChild(this.pathBar);
  }

  private createFileList(): void {
    this.fileList = createElement('div', 'fm-file-list');
    this.element.appendChild(this.fileList);
  }

  private refreshView(): void {
    // Update path bar
    this.pathBar.textContent = `Location: ${fileSystem.getCurrentPath()}`;

    // Clear and populate file list
    this.fileList.innerHTML = '';
    
    const files = fileSystem.listDirectory();
    
    files.forEach(file => {
      const fileItem = this.createFileItem(file);
      this.fileList.appendChild(fileItem);
    });

    if (files.length === 0) {
      const emptyMsg = createElement('div', 'fm-empty-message', 'This folder is empty');
      this.fileList.appendChild(emptyMsg);
    }
  }

  private createFileItem(file: FileSystemNode): HTMLElement {
    const item = createElement('div', 'fm-file-item');
    
    const icon = createElement('span', 'fm-file-icon');
    icon.textContent = this.getFileIcon(file);
    
    const name = createElement('span', 'fm-file-name', file.name);
    
    const size = createElement('span', 'fm-file-size');
    if (file.type === 'file' && file.size) {
      size.textContent = this.formatFileSize(file.size);
    } else if (file.type === 'directory') {
      size.textContent = '<DIR>';
    }

    const modified = createElement('span', 'fm-file-modified', this.getFileDate(file));

    item.appendChild(icon);
    item.appendChild(name);
    item.appendChild(size);
    item.appendChild(modified);

    // Handle double-click
    addEventListenerWithCleanup(item, 'dblclick', () => {
      if (file.type === 'directory') {
        fileSystem.changeDirectory(file.name);
        this.refreshView();
      } else {
        this.openFile(file);
      }
    }, this.cleanupTasks);

    // Handle single-click selection
    addEventListenerWithCleanup(item, 'click', () => {
      // Remove selection from other items
      this.fileList.querySelectorAll('.fm-file-item').forEach(i => i.classList.remove('selected'));
      // Select this item
      item.classList.add('selected');
    }, this.cleanupTasks);

    return item;
  }

  private getFileIcon(file: FileSystemNode): string {
    if (file.type === 'directory') {
      return '📁';
    }
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'txt': case 'md': case 'doc': return '📄';
      case 'jpg': case 'jpeg': case 'gif': case 'bmp': case 'xpm': return '🖼️';
      case 'wav': case 'au': case 'snd': return '🔊';
      case 'tar': case 'gz': case 'zip': return '📦';
      case 'c': case 'h': case 'cpp': return '📝';
      case 'sh': case 'pl': case 'py': return '⚙️';
      case 'conf': case 'cfg': case 'ini': return '🔧';
      default: return '📄';
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  }

  private getFileDate(file: FileSystemNode): string {
    // Return a realistic 1995 date
    const dates = [
      'Jan 15 1995',
      'Jan 10 1995', 
      'Dec 28 1994',
      'Jan 03 1995',
      'Dec 15 1994',
      'Jan 08 1995'
    ];
    return dates[Math.floor(Math.random() * dates.length)];
  }

  private openFile(file: FileSystemNode): void {
    if (file.content) {
      // Create a larger file viewer
      const viewer = createElement('div', 'file-viewer');
      viewer.innerHTML = `
        <div class="file-viewer-header">
          <span>${file.name} - ${this.formatFileSize(file.size || 0)}</span>
          <button class="close-button">✕</button>
        </div>
        <div class="file-viewer-content">${file.content.replace(/\n/g, '<br>')}</div>
      `;

      // Style the viewer
      viewer.style.position = 'fixed';
      viewer.style.top = '100px';
      viewer.style.left = '150px';
      viewer.style.width = '500px';
      viewer.style.height = '350px';
      viewer.style.backgroundColor = '#C0C0C0';
      viewer.style.border = '2px outset #C0C0C0';
      viewer.style.zIndex = '1500';
      viewer.style.display = 'flex';
      viewer.style.flexDirection = 'column';

      const header = viewer.querySelector('.file-viewer-header') as HTMLElement;
      header.style.padding = '4px 8px';
      header.style.backgroundColor = '#000080';
      header.style.color = 'white';
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'center';

      const content = viewer.querySelector('.file-viewer-content') as HTMLElement;
      content.style.flex = '1';
      content.style.padding = '8px';
      content.style.backgroundColor = 'white';
      content.style.overflow = 'auto';
      content.style.fontFamily = 'monospace';
      content.style.fontSize = '12px';
      content.style.lineHeight = '1.4';

      const closeBtn = viewer.querySelector('.close-button') as HTMLElement;
      closeBtn.style.background = '#C0C0C0';
      closeBtn.style.border = '1px outset #C0C0C0';
      closeBtn.style.padding = '2px 6px';
      closeBtn.style.cursor = 'pointer';

      addEventListenerWithCleanup(closeBtn, 'click', () => {
        viewer.remove();
      }, this.cleanupTasks);

      this.element.appendChild(viewer);
    } else {
      this.showMessage(`Cannot open ${file.name}: No content available`);
    }
  }

  private showMessage(message: string): void {
    const messageEl = createElement('div', 'fm-message', message);
    messageEl.style.position = 'absolute';
    messageEl.style.bottom = '10px';
    messageEl.style.right = '10px';
    messageEl.style.background = '#FFFFCC';
    messageEl.style.padding = '6px 12px';
    messageEl.style.border = '1px solid #808080';
    messageEl.style.fontSize = '11px';
    messageEl.style.zIndex = '1000';
    
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

export default FileManagerApp; 