// File manager application for Linux 95 Desktop
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
      width: 450,
      height: 350,
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

    toolbar.appendChild(upButton);
    toolbar.appendChild(homeButton);
    toolbar.appendChild(refreshButton);
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
    icon.textContent = file.type === 'directory' ? '📁' : '📄';
    
    const name = createElement('span', 'fm-file-name', file.name);
    
    const size = createElement('span', 'fm-file-size');
    if (file.type === 'file' && file.size) {
      size.textContent = `${file.size} bytes`;
    } else if (file.type === 'directory') {
      size.textContent = '<DIR>';
    }

    item.appendChild(icon);
    item.appendChild(name);
    item.appendChild(size);

    // Handle double-click
    addEventListenerWithCleanup(item, 'dblclick', () => {
      if (file.type === 'directory') {
        fileSystem.changeDirectory(file.name);
        this.refreshView();
      } else {
        this.openFile(file);
      }
    }, this.cleanupTasks);

    return item;
  }

  private openFile(file: FileSystemNode): void {
    if (file.content) {
      // Create a simple file viewer
      const viewer = createElement('div', 'file-viewer');
      viewer.innerHTML = `
        <div class="file-viewer-header">
          <span>${file.name}</span>
          <button class="close-button">×</button>
        </div>
        <div class="file-viewer-content">${file.content.replace(/\n/g, '<br>')}</div>
      `;

      const closeBtn = viewer.querySelector('.close-button') as HTMLElement;
      addEventListenerWithCleanup(closeBtn, 'click', () => {
        viewer.remove();
      }, this.cleanupTasks);

      this.element.appendChild(viewer);
    }
  }

  cleanup(): void {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
}

export default FileManagerApp; 