// Window system type definitions for Linux 95 Desktop
export interface WindowConfig {
  id: string;
  title: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  resizable?: boolean;
  minimizable?: boolean;
  closable?: boolean;
  icon?: string;
  className?: string;
}

export interface WindowState {
  id: string;
  isMinimized: boolean;
  isFocused: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface WindowInstance {
  id: string;
  element: HTMLElement;
  config: WindowConfig;
  state: WindowState;
  content?: HTMLElement;
  taskbarButton?: HTMLElement;
}

export interface WindowSystemInterface {
  createWindow(config: WindowConfig, content?: HTMLElement): WindowInstance;
  closeWindow(windowId: string): void;
  minimizeWindow(windowId: string): void;
  focusWindow(windowId: string): void;
  moveWindow(windowId: string, x: number, y: number): void;
  resizeWindow(windowId: string, width: number, height: number): void;
  getWindow(windowId: string): WindowInstance | null;
  getAllWindows(): WindowInstance[];
  cleanup(): void;
} 