// DOM utility functions for Linux 95 Desktop
export function createElement(tag: string, className?: string, textContent?: string): HTMLElement {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}

export function createButton(text: string, className?: string, onClick?: () => void): HTMLButtonElement {
  const button = createElement('button', className, text) as HTMLButtonElement;
  if (onClick) button.addEventListener('click', onClick);
  return button;
}

export function addEventListenerWithCleanup(
  element: EventTarget, 
  event: string, 
  handler: EventListener,
  cleanupTasks: (() => void)[]
): void {
  element.addEventListener(event, handler);
  cleanupTasks.push(() => element.removeEventListener(event, handler));
}

export function setStyles(element: HTMLElement, styles: Partial<CSSStyleDeclaration>): void {
  Object.assign(element.style, styles);
}

export function findElement(selector: string, parent?: Element): HTMLElement | null {
  return (parent || document).querySelector(selector) as HTMLElement | null;
}

export function findElements(selector: string, parent?: Element): HTMLElement[] {
  return Array.from((parent || document).querySelectorAll(selector)) as HTMLElement[];
}

export function removeElement(element: HTMLElement): void {
  element.parentNode?.removeChild(element);
}

export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: number;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => func(...args), delay);
  }) as T;
} 