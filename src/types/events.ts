// Event system type definitions for Linux 95 Desktop
export type AppEvent = 'open' | 'close' | 'minimize' | 'focus' | 'blur';
export type WindowEvent = 'move' | 'resize' | 'drag' | 'drop';
export type SystemEvent = 'startup' | 'shutdown' | 'error';

export interface EventPayload {
  [key: string]: any;
}

export interface AppEventPayload extends EventPayload {
  appId: string;
  windowId?: string;
  data?: any;
}

export interface WindowEventPayload extends EventPayload {
  windowId: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

export interface SystemEventPayload extends EventPayload {
  message?: string;
  error?: Error;
}

export type EventHandler<T = EventPayload> = (payload: T) => void;

export interface EventBusInterface {
  on<T = EventPayload>(event: string, handler: EventHandler<T>): void;
  off(event: string, handler: EventHandler): void;
  emit<T = EventPayload>(event: string, payload?: T): void;
  once<T = EventPayload>(event: string, handler: EventHandler<T>): void;
} 