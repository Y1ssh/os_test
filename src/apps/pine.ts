// Pine email client - Standard 1995 Unix email application
import { AppInterface, AppConfig } from '../types/app.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';

interface EmailMessage {
  id: number;
  from: string;
  subject: string;
  date: string;
  read: boolean;
  content: string;
}

export class PineApp implements AppInterface {
  config: AppConfig = {
    id: 'pine',
    title: 'Pine',
    icon: '📧',
    category: 'internet',
    windowConfig: {
      width: 600,
      height: 400,
      resizable: true
    }
  };

  private element!: HTMLElement;
  private cleanupTasks: (() => void)[] = [];
  private currentView: 'main' | 'folder' | 'message' | 'compose' = 'main';
  private messages: EmailMessage[] = [];
  private selectedMessage?: EmailMessage;

  init(): void {
    this.createSampleMessages();
  }

  render(): HTMLElement {
    this.element = createElement('div', 'pine-app');
    this.showMainMenu();
    return this.element;
  }

  private createSampleMessages(): void {
    this.messages = [
      {
        id: 1,
        from: 'root@localhost',
        subject: 'System Maintenance Notice',
        date: 'Jan 15 1995',
        read: false,
        content: 'The system will be down for maintenance this weekend.\n\nPlease save your work before Friday evening.\n\nThank you,\nSystem Administrator'
      },
      {
        id: 2,
        from: 'postmaster@university.edu',
        subject: 'Welcome to the Internet',
        date: 'Jan 10 1995',
        read: true,
        content: 'Welcome to your new email account!\n\nYour Internet email address is: user@university.edu\n\nPlease read the user manual for more information.\n\nBest regards,\nComputer Services'
      },
      {
        id: 3,
        from: 'newsadmin@newsgroup.com',
        subject: 'Usenet News Access',
        date: 'Jan 8 1995',
        read: true,
        content: 'Your Usenet news access has been activated.\n\nYou can now read newsgroups using nn, rn, or trn.\n\nPopular groups to start with:\n- comp.os.linux\n- rec.humor\n- alt.folklore.computers'
      }
    ];
  }

  private showMainMenu(): void {
    this.currentView = 'main';
    this.element.innerHTML = `
      <div class="pine-header">
        <div class="pine-title">PINE 3.91   MAIN MENU</div>
        <div class="pine-status">Folder: INBOX - ${this.messages.filter(m => !m.read).length} Messages</div>
      </div>
      <div class="pine-content">
        <div class="pine-menu">
          <div class="menu-item" data-action="folder-list">
            <span class="menu-key">F</span> FOLDER LIST - Select a folder to view
          </div>
          <div class="menu-item" data-action="folder-index">
            <span class="menu-key">I</span> FOLDER INDEX - View messages in current folder
          </div>
          <div class="menu-item" data-action="compose">
            <span class="menu-key">C</span> COMPOSE MESSAGE - Compose and send a message
          </div>
          <div class="menu-item" data-action="address">
            <span class="menu-key">A</span> ADDRESS BOOK - Update address book
          </div>
          <div class="menu-item" data-action="setup">
            <span class="menu-key">S</span> SETUP - Configure Pine options
          </div>
          <div class="menu-item" data-action="quit">
            <span class="menu-key">Q</span> QUIT - Exit Pine
          </div>
        </div>
      </div>
      <div class="pine-footer">
        <span>? Help</span>
        <span>P PrevCmd</span>
        <span>R RelNotes</span>
        <span>K KBLock</span>
        <span>O OTHER CMDS</span>
      </div>
    `;

    this.setupMenuHandlers();
  }

  private setupMenuHandlers(): void {
    const menuItems = this.element.querySelectorAll('.menu-item[data-action]');
    menuItems.forEach(item => {
      addEventListenerWithCleanup(item, 'click', () => {
        const action = (item as HTMLElement).dataset.action;
        this.handleMenuAction(action!);
      }, this.cleanupTasks);
    });
  }

  private handleMenuAction(action: string): void {
    switch (action) {
      case 'folder-index':
        this.showFolderIndex();
        break;
      case 'compose':
        this.showCompose();
        break;
      case 'folder-list':
      case 'address':
      case 'setup':
        this.showNotImplemented(action);
        break;
      case 'quit':
        this.showMainMenu(); // Just return to main menu
        break;
    }
  }

  private showFolderIndex(): void {
    this.currentView = 'folder';
    this.element.innerHTML = `
      <div class="pine-header">
        <div class="pine-title">PINE 3.91   FOLDER INDEX</div>
        <div class="pine-status">Folder: INBOX - ${this.messages.length} Messages</div>
      </div>
      <div class="pine-content">
        <div class="pine-message-list">
          <div class="message-header">
            <span class="msg-num">  #</span>
            <span class="msg-date">Date</span>
            <span class="msg-from">From</span>
            <span class="msg-subject">Subject</span>
          </div>
          ${this.messages.map((msg, index) => `
            <div class="message-item ${msg.read ? 'read' : 'unread'}" data-msg-id="${msg.id}">
              <span class="msg-num">${String(index + 1).padStart(3, ' ')}</span>
              <span class="msg-date">${msg.date}</span>
              <span class="msg-from">${msg.from.substring(0, 20)}</span>
              <span class="msg-subject">${msg.subject}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="pine-footer">
        <span>? Help</span>
        <span>M Main Menu</span>
        <span>C Compose</span>
        <span>ENTER View Msg</span>
        <span>D Delete</span>
      </div>
    `;

    this.setupMessageListHandlers();
  }

  private setupMessageListHandlers(): void {
    const messageItems = this.element.querySelectorAll('.message-item[data-msg-id]');
    messageItems.forEach(item => {
      addEventListenerWithCleanup(item, 'click', () => {
        const msgId = parseInt((item as HTMLElement).dataset.msgId!);
        this.viewMessage(msgId);
      }, this.cleanupTasks);
    });

    // Add keyboard shortcuts simulation
    addEventListenerWithCleanup(this.element, 'click', (e) => {
      const target = e.target as HTMLElement;
      if (target.textContent?.includes('Main Menu')) {
        this.showMainMenu();
      } else if (target.textContent?.includes('Compose')) {
        this.showCompose();
      }
    }, this.cleanupTasks);
  }

  private viewMessage(msgId: number): void {
    const message = this.messages.find(m => m.id === msgId);
    if (!message) return;

    message.read = true;
    this.selectedMessage = message;
    this.currentView = 'message';

    this.element.innerHTML = `
      <div class="pine-header">
        <div class="pine-title">PINE 3.91   MESSAGE TEXT</div>
        <div class="pine-status">Message ${msgId} of ${this.messages.length}</div>
      </div>
      <div class="pine-content">
        <div class="pine-message-view">
          <div class="message-headers">
            <div><strong>From:</strong> ${message.from}</div>
            <div><strong>Date:</strong> ${message.date}</div>
            <div><strong>Subject:</strong> ${message.subject}</div>
          </div>
          <hr>
          <div class="message-body">
            ${message.content.split('\n').map(line => `<div>${line || '&nbsp;'}</div>`).join('')}
          </div>
        </div>
      </div>
      <div class="pine-footer">
        <span>? Help</span>
        <span>M Main Menu</span>
        <span>I Index</span>
        <span>R Reply</span>
        <span>F Forward</span>
        <span>D Delete</span>
      </div>
    `;

    this.setupMessageViewHandlers();
  }

  private setupMessageViewHandlers(): void {
    addEventListenerWithCleanup(this.element, 'click', (e) => {
      const target = e.target as HTMLElement;
      if (target.textContent?.includes('Main Menu')) {
        this.showMainMenu();
      } else if (target.textContent?.includes('Index')) {
        this.showFolderIndex();
      } else if (target.textContent?.includes('Reply')) {
        this.showCompose(`Re: ${this.selectedMessage?.subject}`);
      }
    }, this.cleanupTasks);
  }

  private showCompose(subject?: string): void {
    this.currentView = 'compose';
    this.element.innerHTML = `
      <div class="pine-header">
        <div class="pine-title">PINE 3.91   COMPOSE MESSAGE</div>
        <div class="pine-status">Composing new message</div>
      </div>
      <div class="pine-content">
        <div class="pine-compose">
          <div class="compose-field">
            <span class="field-label">To:</span>
            <input type="text" class="field-input" placeholder="user@domain.edu">
          </div>
          <div class="compose-field">
            <span class="field-label">Cc:</span>
            <input type="text" class="field-input">
          </div>
          <div class="compose-field">
            <span class="field-label">Subject:</span>
            <input type="text" class="field-input" value="${subject || ''}">
          </div>
          <div class="compose-field">
            <span class="field-label">Message Text:</span>
          </div>
          <textarea class="compose-text" placeholder="Enter your message here..."></textarea>
        </div>
      </div>
      <div class="pine-footer">
        <span>? Help</span>
        <span>^X Send</span>
        <span>^C Cancel</span>
        <span>^O Postpone</span>
        <span>^R Read File</span>
      </div>
    `;

    this.setupComposeHandlers();
  }

  private setupComposeHandlers(): void {
    addEventListenerWithCleanup(this.element, 'click', (e) => {
      const target = e.target as HTMLElement;
      if (target.textContent?.includes('Send')) {
        this.sendMessage();
      } else if (target.textContent?.includes('Cancel')) {
        this.showMainMenu();
      }
    }, this.cleanupTasks);
  }

  private sendMessage(): void {
    // Simulate sending message
    this.element.innerHTML = `
      <div class="pine-header">
        <div class="pine-title">PINE 3.91   MESSAGE SENT</div>
        <div class="pine-status">Message successfully sent</div>
      </div>
      <div class="pine-content">
        <div class="pine-message">
          <p>Your message has been sent successfully.</p>
          <p>Press any key to return to the main menu.</p>
        </div>
      </div>
      <div class="pine-footer">
        <span>Press any key to continue...</span>
      </div>
    `;

    addEventListenerWithCleanup(this.element, 'click', () => {
      this.showMainMenu();
    }, this.cleanupTasks);
  }

  private showNotImplemented(feature: string): void {
    this.element.innerHTML = `
      <div class="pine-header">
        <div class="pine-title">PINE 3.91   ${feature.toUpperCase()}</div>
        <div class="pine-status">Feature not implemented</div>
      </div>
      <div class="pine-content">
        <div class="pine-message">
          <p>The ${feature} feature is not yet implemented in this demonstration.</p>
          <p>This would normally provide access to ${feature} functionality.</p>
          <p>Click anywhere to return to the main menu.</p>
        </div>
      </div>
      <div class="pine-footer">
        <span>Click to return to main menu</span>
      </div>
    `;

    addEventListenerWithCleanup(this.element, 'click', () => {
      this.showMainMenu();
    }, this.cleanupTasks);
  }

  cleanup(): void {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
}

export default PineApp; 