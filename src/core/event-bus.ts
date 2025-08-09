// Lightweight event bus for modular communication
import { EventBusInterface, EventHandler, EventPayload } from '../types/events.js';

class EventBus implements EventBusInterface {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  on<T = EventPayload>(event: string, handler: EventHandler<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as EventHandler);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit<T = EventPayload>(event: string, payload?: T): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(payload || {} as T);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  once<T = EventPayload>(event: string, handler: EventHandler<T>): void {
    const onceHandler = (payload: T) => {
      handler(payload);
      this.off(event, onceHandler as EventHandler);
    };
    this.on(event, onceHandler);
  }

  cleanup(): void {
    this.listeners.clear();
  }
}

// Global event bus instance
export const eventBus = new EventBus(); 