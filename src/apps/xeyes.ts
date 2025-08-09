// XEyes application - Classic X11 toy where eyes follow mouse cursor
import { AppInterface, AppConfig } from '../types/app.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';

export class XEyesApp implements AppInterface {
  config: AppConfig = {
    id: 'xeyes',
    title: 'XEyes',
    icon: '👀',
    category: 'utility',
    windowConfig: {
      width: 280, // Larger for better visibility
      height: 200,
      resizable: false
    }
  };

  private element!: HTMLElement;
  private cleanupTasks: (() => void)[] = [];
  private pupils: HTMLElement[] = [];

  init(): void {
    // Initialize XEyes
  }

  render(): HTMLElement {
    this.element = createElement('div', 'xeyes-app');
    
    const container = createElement('div', 'xeyes-container');
    
    // Create two eyes
    for (let i = 0; i < 2; i++) {
      const eye = createElement('div', 'eye');
      const pupil = createElement('div', 'pupil');
      pupil.id = `pupil-${i}`;
      
      eye.appendChild(pupil);
      container.appendChild(eye);
      this.pupils.push(pupil);
    }
    
    this.element.appendChild(container);
    this.setupMouseTracking();
    
    return this.element;
  }

  private setupMouseTracking(): void {
    const updateEyes = (e: MouseEvent) => {
      this.pupils.forEach((pupil, index) => {
        const eye = pupil.parentElement!;
        const eyeRect = eye.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;
        
        // Calculate angle from eye center to mouse
        const deltaX = e.clientX - eyeCenterX;
        const deltaY = e.clientY - eyeCenterY;
        const angle = Math.atan2(deltaY, deltaX);
        
        // Calculate pupil position (constrained to eye bounds)
        const maxDistance = 26; // Maximum distance pupil can move from center (bigger for larger eyes)
        const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 10, maxDistance);
        
        const pupilX = Math.cos(angle) * distance;
        const pupilY = Math.sin(angle) * distance;
        
        pupil.style.transform = `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`;
      });
    };

    addEventListenerWithCleanup(document, 'mousemove', updateEyes, this.cleanupTasks);
  }

  cleanup(): void {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
}

export default XEyesApp; 