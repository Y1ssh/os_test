// AI chat application for Linux 95 Desktop
import { AppInterface, AppConfig } from '../types/app.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';
import { aiService } from '../utils/ai-service.js';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class AIChatApp implements AppInterface {
  config: AppConfig = {
    id: 'aiChat',
    title: 'AI Assistant',
    icon: '🤖',
    category: 'utility',
    windowConfig: {
      width: 450,
      height: 400,
      resizable: true
    }
  };

  private element!: HTMLElement;
  private chatMessages!: HTMLElement;
  private messageInput!: HTMLInputElement;
  private cleanupTasks: (() => void)[] = [];
  private messages: ChatMessage[] = [];

  init(): void {
    this.addWelcomeMessage();
  }

  render(): HTMLElement {
    this.element = createElement('div', 'ai-chat-app');
    
    this.createChatArea();
    this.createInputArea();
    this.renderMessages();
    
    return this.element;
  }

  private createChatArea(): void {
    this.chatMessages = createElement('div', 'chat-messages');
    this.element.appendChild(this.chatMessages);
  }

  private createInputArea(): void {
    const inputArea = createElement('div', 'chat-input-area');
    
    this.messageInput = createElement('input', 'chat-input') as HTMLInputElement;
    this.messageInput.type = 'text';
    this.messageInput.placeholder = 'Type your message...';
    
    const sendBtn = createElement('button', 'chat-send-btn', '📤');
    
    addEventListenerWithCleanup(this.messageInput, 'keypress', (e) => {
      const keyEvent = e as KeyboardEvent;
      if (keyEvent.key === 'Enter') {
        this.sendMessage();
      }
    }, this.cleanupTasks);

    addEventListenerWithCleanup(sendBtn, 'click', () => {
      this.sendMessage();
    }, this.cleanupTasks);

    inputArea.appendChild(this.messageInput);
    inputArea.appendChild(sendBtn);
    this.element.appendChild(inputArea);

    // Auto-focus input
    setTimeout(() => this.messageInput.focus(), 100);
  }

  private addWelcomeMessage(): void {
    this.messages.push({
      role: 'assistant',
      content: 'Hello! I\'m your Linux 95 AI assistant. How can I help you today?',
      timestamp: new Date()
    });
  }

  private async sendMessage(): Promise<void> {
    const content = this.messageInput.value.trim();
    if (!content) return;

    // Add user message
    this.messages.push({
      role: 'user',
      content,
      timestamp: new Date()
    });

    this.messageInput.value = '';
    this.renderMessages();

    // Show typing indicator
    this.showTypingIndicator();

    try {
      const response = await aiService.chat(content);
      
      // Remove typing indicator
      this.hideTypingIndicator();
      
      // Add AI response
      this.messages.push({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });
      
      this.renderMessages();
    } catch (error) {
      this.hideTypingIndicator();
      this.messages.push({
        role: 'assistant',
        content: 'Sorry, I\'m having trouble responding right now. Please try again.',
        timestamp: new Date()
      });
      this.renderMessages();
    }
  }

  private renderMessages(): void {
    this.chatMessages.innerHTML = '';
    
    this.messages.forEach(message => {
      const messageEl = createElement('div', `chat-message ${message.role}`);
      
      const avatar = createElement('div', 'message-avatar');
      avatar.textContent = message.role === 'user' ? '👤' : '🤖';
      
      const content = createElement('div', 'message-content');
      content.textContent = message.content;
      
      const timestamp = createElement('div', 'message-timestamp');
      timestamp.textContent = message.timestamp.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      messageEl.appendChild(avatar);
      messageEl.appendChild(content);
      messageEl.appendChild(timestamp);
      
      this.chatMessages.appendChild(messageEl);
    });

    // Scroll to bottom
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  private showTypingIndicator(): void {
    const indicator = createElement('div', 'typing-indicator');
    indicator.id = 'typing-indicator';
    indicator.innerHTML = '🤖 AI is typing<span class="dots">...</span>';
    this.chatMessages.appendChild(indicator);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  private hideTypingIndicator(): void {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  cleanup(): void {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
}

export default AIChatApp; 