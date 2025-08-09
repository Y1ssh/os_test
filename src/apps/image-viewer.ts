// XV Image Viewer - Authentic 1995 Linux image viewer with sample images
import { AppInterface, AppConfig } from '../types/app.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';

interface SampleImage {
  name: string;
  width: number;
  height: number;
  type: string;
  dataUrl: string;
  description: string;
}

export class ImageViewerApp implements AppInterface {
  config: AppConfig = {
    id: 'imageViewer',
    title: 'XV Image',
    icon: '🖼️',
    category: 'multimedia',
    windowConfig: {
      width: 640, // Larger for 1995 resolution
      height: 480,
      resizable: true
    }
  };

  private element!: HTMLElement;
  private toolbar!: HTMLElement;
  private imageArea!: HTMLElement;
  private statusBar!: HTMLElement;
  private cleanupTasks: (() => void)[] = [];
  private currentImageIndex = 0;
  private sampleImages: SampleImage[] = [];

  init(): void {
    this.createSampleImages();
  }

  render(): HTMLElement {
    this.element = createElement('div', 'image-viewer-app');
    
    this.createToolbar();
    this.createImageArea();
    this.createStatusBar();
    this.loadImage(0);
    
    return this.element;
  }

  private createSampleImages(): void {
    // Create authentic 1995-style sample images as data URLs
    this.sampleImages = [
      {
        name: 'tux.xpm',
        width: 200,
        height: 200,
        type: 'XPM',
        description: 'Linux Penguin Mascot - Tux (1995)',
        dataUrl: this.createTuxImage()
      },
      {
        name: 'workstation.bmp',
        width: 320,
        height: 240,
        type: 'BMP',
        description: 'My 486 DX2/66 Linux Workstation Setup',
        dataUrl: this.createWorkstationImage()
      },
      {
        name: 'xlogo.gif',
        width: 150,
        height: 150,
        type: 'GIF',
        description: 'X Window System Logo',
        dataUrl: this.createXLogoImage()
      },
      {
        name: 'pattern.xbm',
        width: 100,
        height: 100,
        type: 'XBM',
        description: 'Classic X11 Pattern Bitmap',
        dataUrl: this.createPatternImage()
      }
    ];
  }

  private createTuxImage(): string {
    // Create a simple Tux penguin using SVG data URL
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <!-- Background -->
        <rect width="200" height="200" fill="#E0E0E0"/>
        
        <!-- Penguin body -->
        <ellipse cx="100" cy="140" rx="45" ry="50" fill="#000"/>
        <ellipse cx="100" cy="140" rx="35" ry="40" fill="#FFF"/>
        
        <!-- Head -->
        <circle cx="100" cy="80" r="35" fill="#000"/>
        <circle cx="100" cy="80" r="25" fill="#FFF"/>
        
        <!-- Eyes -->
        <circle cx="90" cy="75" r="8" fill="#000"/>
        <circle cx="110" cy="75" r="8" fill="#000"/>
        <circle cx="92" cy="73" r="2" fill="#FFF"/>
        <circle cx="112" cy="73" r="2" fill="#FFF"/>
        
        <!-- Beak -->
        <polygon points="100,85 105,95 95,95" fill="#FFA500"/>
        
        <!-- Feet -->
        <ellipse cx="85" cy="180" rx="12" ry="8" fill="#FFA500"/>
        <ellipse cx="115" cy="180" rx="12" ry="8" fill="#FFA500"/>
        
        <!-- Wings -->
        <ellipse cx="70" cy="120" rx="15" ry="25" fill="#000"/>
        <ellipse cx="130" cy="120" rx="15" ry="25" fill="#000"/>
        
        <text x="100" y="25" font-family="monospace" font-size="12" fill="#000" text-anchor="middle">Linux Mascot</text>
        <text x="100" y="195" font-family="monospace" font-size="8" fill="#666" text-anchor="middle">Tux - Created January 1995</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  private createWorkstationImage(): string {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240">
        <!-- Background -->
        <rect width="320" height="240" fill="#C0C0C0"/>
        
        <!-- Desk -->
        <rect x="0" y="180" width="320" height="60" fill="#8B4513"/>
        
        <!-- Monitor -->
        <rect x="60" y="40" width="200" height="140" fill="#2F2F2F"/>
        <rect x="70" y="50" width="180" height="120" fill="#000"/>
        <rect x="75" y="55" width="170" height="110" fill="#003300"/>
        
        <!-- Screen content -->
        <text x="160" y="75" font-family="monospace" font-size="8" fill="#00FF00" text-anchor="middle">$ ls -la</text>
        <text x="85" y="90" font-family="monospace" font-size="6" fill="#00FF00">drwxr-xr-x  user home</text>
        <text x="85" y="100" font-family="monospace" font-size="6" fill="#00FF00">-rw-r--r--  readme.txt</text>
        <text x="85" y="110" font-family="monospace" font-size="6" fill="#00FF00">-rwxr-xr-x  compile.sh</text>
        <text x="160" y="140" font-family="monospace" font-size="8" fill="#00FF00" text-anchor="middle">Linux 1.2.13</text>
        
        <!-- Keyboard -->
        <rect x="40" y="185" width="160" height="40" fill="#F0F0F0"/>
        <rect x="45" y="190" width="150" height="30" fill="#E0E0E0"/>
        
        <!-- Mouse -->
        <ellipse cx="220" cy="205" rx="12" ry="8" fill="#F0F0F0"/>
        
        <!-- CPU Tower -->
        <rect x="10" y="120" width="40" height="60" fill="#D3D3D3"/>
        <rect x="15" y="125" width="30" height="8" fill="#000"/>
        <circle cx="30" cy="140" r="3" fill="#FF0000"/>
        <circle cx="30" cy="150" r="3" fill="#00FF00"/>
        
        <!-- Books -->
        <rect x="270" y="160" width="8" height="20" fill="#FF0000"/>
        <rect x="278" y="158" width="8" height="22" fill="#0000FF"/>
        <rect x="286" y="155" width="8" height="25" fill="#00AA00"/>
        
        <text x="160" y="20" font-family="monospace" font-size="10" fill="#000" text-anchor="middle">My Linux Workstation</text>
        <text x="160" y="235" font-family="monospace" font-size="8" fill="#666" text-anchor="middle">486 DX2/66 - 16MB RAM - January 1995</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  private createXLogoImage(): string {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150">
        <!-- Background -->
        <rect width="150" height="150" fill="#000"/>
        
        <!-- X -->
        <g stroke="#FFF" stroke-width="8" fill="none">
          <line x1="30" y1="30" x2="120" y2="120"/>
          <line x1="120" y1="30" x2="30" y2="120"/>
        </g>
        
        <!-- X11 text -->
        <text x="75" y="140" font-family="serif" font-size="12" fill="#FFF" text-anchor="middle">X11R6</text>
        
        <!-- Corners -->
        <rect x="5" y="5" width="10" height="10" fill="#FFF"/>
        <rect x="135" y="5" width="10" height="10" fill="#FFF"/>
        <rect x="5" y="135" width="10" height="10" fill="#FFF"/>
        <rect x="135" y="135" width="10" height="10" fill="#FFF"/>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  private createPatternImage(): string {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <!-- Checkerboard pattern -->
        <defs>
          <pattern id="checkerboard" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="10" height="10" fill="#000"/>
            <rect x="10" y="10" width="10" height="10" fill="#000"/>
            <rect x="10" y="0" width="10" height="10" fill="#FFF"/>
            <rect x="0" y="10" width="10" height="10" fill="#FFF"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#checkerboard)"/>
        
        <!-- Grid lines -->
        <g stroke="#808080" stroke-width="1" fill="none">
          <line x1="0" y1="50" x2="100" y2="50"/>
          <line x1="50" y1="0" x2="50" y2="100"/>
        </g>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  private createToolbar(): void {
    this.toolbar = createElement('div', 'image-toolbar');
    
    const prevBtn = createElement('button', 'image-btn', '◀ Prev');
    const nextBtn = createElement('button', 'image-btn', 'Next ▶');
    const zoomInBtn = createElement('button', 'image-btn', 'Zoom +');
    const zoomOutBtn = createElement('button', 'image-btn', 'Zoom -');
    const fitBtn = createElement('button', 'image-btn', 'Fit');

    addEventListenerWithCleanup(prevBtn, 'click', () => {
      this.loadImage(this.currentImageIndex - 1);
    }, this.cleanupTasks);

    addEventListenerWithCleanup(nextBtn, 'click', () => {
      this.loadImage(this.currentImageIndex + 1);
    }, this.cleanupTasks);

    addEventListenerWithCleanup(zoomInBtn, 'click', () => {
      this.zoomImage(1.2);
    }, this.cleanupTasks);

    addEventListenerWithCleanup(zoomOutBtn, 'click', () => {
      this.zoomImage(0.8);
    }, this.cleanupTasks);

    addEventListenerWithCleanup(fitBtn, 'click', () => {
      this.fitImage();
    }, this.cleanupTasks);

    this.toolbar.appendChild(prevBtn);
    this.toolbar.appendChild(nextBtn);
    this.toolbar.appendChild(zoomInBtn);
    this.toolbar.appendChild(zoomOutBtn);
    this.toolbar.appendChild(fitBtn);
    this.element.appendChild(this.toolbar);
  }

  private createImageArea(): void {
    this.imageArea = createElement('div', 'image-area');
    this.element.appendChild(this.imageArea);
  }

  private createStatusBar(): void {
    this.statusBar = createElement('div', 'image-status');
    this.element.appendChild(this.statusBar);
  }

  private loadImage(index: number): void {
    // Wrap around
    if (index < 0) index = this.sampleImages.length - 1;
    if (index >= this.sampleImages.length) index = 0;
    
    this.currentImageIndex = index;
    const image = this.sampleImages[index];
    
    this.imageArea.innerHTML = `
      <img src="${image.dataUrl}" alt="${image.name}" class="display-image" />
    `;
    
    this.statusBar.textContent = `${image.name} (${image.type}) - ${image.width}x${image.height} - ${image.description}`;
  }

  private zoomImage(factor: number): void {
    const img = this.imageArea.querySelector('.display-image') as HTMLImageElement;
    if (img) {
      const currentWidth = img.offsetWidth;
      const currentHeight = img.offsetHeight;
      img.style.width = `${currentWidth * factor}px`;
      img.style.height = `${currentHeight * factor}px`;
    }
  }

  private fitImage(): void {
    const img = this.imageArea.querySelector('.display-image') as HTMLImageElement;
    if (img) {
      img.style.width = 'auto';
      img.style.height = 'auto';
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
    }
  }

  cleanup(): void {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
}

export default ImageViewerApp; 