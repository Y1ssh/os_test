// Image viewer application for Linux 95 Desktop
import { AppInterface, AppConfig } from '../types/app.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';

export class ImageViewerApp implements AppInterface {
  config: AppConfig = {
    id: 'imageViewer',
    title: 'XV Image Viewer',
    icon: '🖼️',
    category: 'multimedia',
    windowConfig: {
      width: 500,
      height: 400,
      resizable: true
    }
  };

  private element!: HTMLElement;
  private imageContainer!: HTMLElement;
  private cleanupTasks: (() => void)[] = [];
  private currentImageIndex = 0;

  private sampleImages = [
    { name: 'linux_penguin.jpg', url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TGludXggUGVuZ3VpbiDQpjwvdGV4dD48L3N2Zz4=' },
    { name: 'retro_computer.jpg', url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDA0MDQwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UmV0cm8gQ29tcHV0ZXIg8J+WpTwvdGV4dD48L3N2Zz4=' },
    { name: 'desktop_wallpaper.jpg', url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMyRjRGNEYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM2MDgwODAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RGVza3RvcCBXYWxscGFwZXIg8J+OhuKctO+4jzwvdGV4dD48L3N2Zz4=' }
  ];

  init(): void {
    // Initialize viewer
  }

  render(): HTMLElement {
    this.element = createElement('div', 'image-viewer-app');
    
    this.createToolbar();
    this.createImageContainer();
    this.createNavigationControls();
    this.loadCurrentImage();
    
    return this.element;
  }

  private createToolbar(): void {
    const toolbar = createElement('div', 'image-toolbar');
    
    const openBtn = createElement('button', 'image-btn', '📁 Open');
    const zoomInBtn = createElement('button', 'image-btn', '🔍+');
    const zoomOutBtn = createElement('button', 'image-btn', '🔍-');
    const fitBtn = createElement('button', 'image-btn', '📐 Fit');

    addEventListenerWithCleanup(openBtn, 'click', () => {
      this.showOpenDialog();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(zoomInBtn, 'click', () => {
      this.zoomImage(1.2);
    }, this.cleanupTasks);

    addEventListenerWithCleanup(zoomOutBtn, 'click', () => {
      this.zoomImage(0.8);
    }, this.cleanupTasks);

    addEventListenerWithCleanup(fitBtn, 'click', () => {
      this.fitImageToWindow();
    }, this.cleanupTasks);

    toolbar.appendChild(openBtn);
    toolbar.appendChild(zoomInBtn);
    toolbar.appendChild(zoomOutBtn);
    toolbar.appendChild(fitBtn);
    
    this.element.appendChild(toolbar);
  }

  private createImageContainer(): void {
    this.imageContainer = createElement('div', 'image-container');
    this.element.appendChild(this.imageContainer);
  }

  private createNavigationControls(): void {
    const nav = createElement('div', 'image-navigation');
    
    const prevBtn = createElement('button', 'nav-btn', '◀ Previous');
    const imageInfo = createElement('span', 'image-info');
    const nextBtn = createElement('button', 'nav-btn', 'Next ▶');

    addEventListenerWithCleanup(prevBtn, 'click', () => {
      this.previousImage();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(nextBtn, 'click', () => {
      this.nextImage();
    }, this.cleanupTasks);

    nav.appendChild(prevBtn);
    nav.appendChild(imageInfo);
    nav.appendChild(nextBtn);
    
    this.element.appendChild(nav);
  }

  private loadCurrentImage(): void {
    const image = this.sampleImages[this.currentImageIndex];
    
    this.imageContainer.innerHTML = `
      <img src="${image.url}" alt="${image.name}" class="viewed-image" />
    `;

    this.updateImageInfo();
  }

  private updateImageInfo(): void {
    const info = this.element.querySelector('.image-info') as HTMLElement;
    const current = this.currentImageIndex + 1;
    const total = this.sampleImages.length;
    const imageName = this.sampleImages[this.currentImageIndex].name;
    
    info.textContent = `${current}/${total} - ${imageName}`;
  }

  private previousImage(): void {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.sampleImages.length) % this.sampleImages.length;
    this.loadCurrentImage();
  }

  private nextImage(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.sampleImages.length;
    this.loadCurrentImage();
  }

  private zoomImage(factor: number): void {
    const img = this.imageContainer.querySelector('.viewed-image') as HTMLImageElement;
    if (img) {
      const currentWidth = img.offsetWidth;
      const newWidth = currentWidth * factor;
      img.style.width = `${newWidth}px`;
      img.style.height = 'auto';
    }
  }

  private fitImageToWindow(): void {
    const img = this.imageContainer.querySelector('.viewed-image') as HTMLImageElement;
    if (img) {
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      img.style.width = 'auto';
      img.style.height = 'auto';
    }
  }

  private showOpenDialog(): void {
    const modal = createElement('div', 'open-image-modal');
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <span>Open Image</span>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <p>In a real implementation, this would open a file dialog.</p>
          <p>For now, use the navigation buttons to view sample images.</p>
          <button class="ok-btn">OK</button>
        </div>
      </div>
    `;

    const closeBtn = modal.querySelector('.modal-close') as HTMLElement;
    const okBtn = modal.querySelector('.ok-btn') as HTMLElement;

    const closeModal = () => modal.remove();

    addEventListenerWithCleanup(closeBtn, 'click', closeModal, this.cleanupTasks);
    addEventListenerWithCleanup(okBtn, 'click', closeModal, this.cleanupTasks);

    this.element.appendChild(modal);
  }

  cleanup(): void {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
}

export default ImageViewerApp; 