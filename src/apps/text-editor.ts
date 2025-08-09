// Text editor application with AI assist for Linux 95 Desktop
import { AppInterface, AppConfig } from '../types/app.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';
import { aiService } from '../utils/ai-service.js';

export class TextEditorApp implements AppInterface {
  config: AppConfig = {
    id: 'textEditor',
    title: 'Text Editor',
    icon: '📝',
    category: 'utility',
    windowConfig: {
      width: 500,
      height: 400,
      resizable: true
    }
  };

  private element!: HTMLElement;
  private textarea!: HTMLTextAreaElement;
  private cleanupTasks: (() => void)[] = [];

  init(): void {
    // Initialize editor
  }

  render(): HTMLElement {
    this.element = createElement('div', 'text-editor-app');
    
    this.createToolbar();
    this.createTextArea();
    
    return this.element;
  }

  private createToolbar(): void {
    const toolbar = createElement('div', 'editor-toolbar');
    
    const saveBtn = createElement('button', 'editor-button', '💾 Save');
    const aiBtn = createElement('button', 'editor-button', '🤖 AI Assist');
    const clearBtn = createElement('button', 'editor-button', '🗑️ Clear');

    addEventListenerWithCleanup(saveBtn, 'click', () => {
      this.saveText();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(aiBtn, 'click', () => {
      this.getAIAssist();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(clearBtn, 'click', () => {
      this.textarea.value = '';
      this.textarea.focus();
    }, this.cleanupTasks);

    toolbar.appendChild(saveBtn);
    toolbar.appendChild(aiBtn);
    toolbar.appendChild(clearBtn);
    this.element.appendChild(toolbar);
  }

  private createTextArea(): void {
    this.textarea = createElement('textarea', 'editor-textarea') as HTMLTextAreaElement;
    this.textarea.placeholder = 'Start typing your text here...';
    this.textarea.value = 'Welcome to the Linux 95 Text Editor!\n\nThis editor includes AI assistance to help improve your writing.';
    
    this.element.appendChild(this.textarea);
    
    // Auto-focus
    setTimeout(() => this.textarea.focus(), 100);
  }

  private saveText(): void {
    const text = this.textarea.value;
    if (!text.trim()) {
      this.showMessage('Nothing to save!');
      return;
    }

    // Simulate saving to local storage
    const filename = `document_${Date.now()}.txt`;
    localStorage.setItem(`linux95_${filename}`, text);
    this.showMessage(`Saved as ${filename}`);
  }

  private async getAIAssist(): Promise<void> {
    const text = this.textarea.value;
    if (!text.trim()) {
      this.showMessage('Please enter some text first!');
      return;
    }

    this.showMessage('AI is analyzing your text...');
    
    try {
      const suggestion = await aiService.assistText(text);
      this.showAISuggestion(suggestion);
    } catch (error) {
      this.showMessage('AI assist failed, please try again.');
    }
  }

  private showAISuggestion(suggestion: string): void {
    const modal = createElement('div', 'ai-suggestion-modal');
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <span>AI Writing Suggestion</span>
          <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <p>${suggestion}</p>
          <div class="modal-buttons">
            <button class="apply-btn">Apply Changes</button>
            <button class="dismiss-btn">Dismiss</button>
          </div>
        </div>
      </div>
    `;

    const closeBtn = modal.querySelector('.modal-close') as HTMLElement;
    const dismissBtn = modal.querySelector('.dismiss-btn') as HTMLElement;
    const applyBtn = modal.querySelector('.apply-btn') as HTMLElement;

    const closeModal = () => modal.remove();

    addEventListenerWithCleanup(closeBtn, 'click', closeModal, this.cleanupTasks);
    addEventListenerWithCleanup(dismissBtn, 'click', closeModal, this.cleanupTasks);
    
    addEventListenerWithCleanup(applyBtn, 'click', () => {
      // Simple implementation: just show the suggestion
      this.showMessage('AI suggestion noted! Review and apply manually.');
      closeModal();
    }, this.cleanupTasks);

    this.element.appendChild(modal);
  }

  private showMessage(message: string): void {
    const messageEl = createElement('div', 'editor-message', message);
    this.element.appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.remove();
    }, 3000);
  }

  cleanup(): void {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
}

export default TextEditorApp; 