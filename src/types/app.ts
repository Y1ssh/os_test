// Application type definitions for Linux 95 Desktop
import { WindowConfig } from './window.js';

export interface AppConfig {
  id: string;
  title: string;
  icon: string;
  description?: string;
  category?: 'system' | 'utility' | 'game' | 'internet' | 'multimedia';
  windowConfig: Partial<WindowConfig>;
}

export interface AppInstance {
  id: string;
  config: AppConfig;
  windowId?: string;
  isRunning: boolean;
  element?: HTMLElement;
}

export interface AppInterface {
  config: AppConfig;
  init(): void;
  render(): HTMLElement;
  cleanup(): void;
  onFocus?(): void;
  onBlur?(): void;
  onMessage?(data: any): void;
}

export interface AppRegistryInterface {
  register(appId: string, loader: () => Promise<AppInterface>): void;
  openApp(appId: string): Promise<AppInstance | null>;
  closeApp(appId: string): void;
  getApp(appId: string): AppInstance | null;
  getAllApps(): AppInstance[];
  isAppRunning(appId: string): boolean;
  cleanup(): void;
}

export type AppLoader = () => Promise<AppInterface>; 