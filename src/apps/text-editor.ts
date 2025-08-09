// xedit Text Editor - Authentic Linux 95 text editor
import { AppInterface, AppConfig } from '../types/app.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';
import { aiService } from '../utils/ai-service.js';

export class TextEditorApp implements AppInterface {
  config: AppConfig = {
    id: 'textEditor',
    title: 'xedit',
    icon: '📝',
    category: 'utility',
    windowConfig: {
      width: 600, // Larger for 1995 resolution
      height: 450,
      resizable: true
    }
  };

  private element!: HTMLElement;
  private toolbar!: HTMLElement;
  private textarea!: HTMLTextAreaElement;
  private statusBar!: HTMLElement;
  private cleanupTasks: (() => void)[] = [];
  private currentFile = 'untitled.txt';
  private isModified = false;

  init(): void {
    // Initialize text editor
  }

  render(): HTMLElement {
    this.element = createElement('div', 'text-editor-app');
    
    this.createToolbar();
    this.createTextArea();
    this.createStatusBar();
    this.loadSampleText();
    
    return this.element;
  }

  private createToolbar(): void {
    this.toolbar = createElement('div', 'editor-toolbar');
    
    const newBtn = createElement('button', 'editor-button', 'New');
    const openBtn = createElement('button', 'editor-button', 'Open');
    const saveBtn = createElement('button', 'editor-button', 'Save');
    const saveAsBtn = createElement('button', 'editor-button', 'Save As');
    const aiBtn = createElement('button', 'editor-button', 'AI Assist');

    addEventListenerWithCleanup(newBtn, 'click', () => {
      this.newFile();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(openBtn, 'click', () => {
      this.openFile();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(saveBtn, 'click', () => {
      this.saveFile();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(saveAsBtn, 'click', () => {
      this.saveAsFile();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(aiBtn, 'click', () => {
      this.aiAssist();
    }, this.cleanupTasks);

    this.toolbar.appendChild(newBtn);
    this.toolbar.appendChild(openBtn);
    this.toolbar.appendChild(saveBtn);
    this.toolbar.appendChild(saveAsBtn);
    this.toolbar.appendChild(aiBtn);
    this.element.appendChild(this.toolbar);
  }

  private createTextArea(): void {
    this.textarea = createElement('textarea', 'editor-textarea') as HTMLTextAreaElement;
    this.textarea.placeholder = 'Enter your text here...';
    
    addEventListenerWithCleanup(this.textarea, 'input', () => {
      this.isModified = true;
      this.updateStatusBar();
    }, this.cleanupTasks);

    this.element.appendChild(this.textarea);
  }

  private createStatusBar(): void {
    this.statusBar = createElement('div', 'editor-status');
    this.element.appendChild(this.statusBar);
    this.updateStatusBar();
  }

  private loadSampleText(): void {
    const sampleTexts = [
      `Welcome to xedit - Linux 95 Text Editor

This is a simple text editor for the Linux 95 desktop environment.

Features:
- Basic text editing
- File operations (New, Open, Save)
- AI assistance for writing
- Authentic 1995 interface

The year is 1995, and Linux is rapidly gaining popularity among computer enthusiasts and universities. This operating system represents the future of computing - a free, open-source alternative to proprietary systems.

Today's hardware specs:
- 486 DX2/66 processor
- 16MB RAM (luxury!)
- 1GB hard drive
- SVGA monitor (1024x768)
- Sound Blaster 16
- 14.4k modem for Internet

The World Wide Web is just beginning to emerge as a revolutionary way to share information. Most people still use bulletin board systems (BBS) and FTP for file sharing.

Programming in C is the standard, with new tools like GCC making development accessible to everyone. The X Window System provides a graphical interface, with window managers like FVWM offering customizable desktops.

This is an exciting time in computing history!`,

      `#!/bin/bash
# Linux 95 System Configuration Script
# Created: January 1995

echo "Welcome to Linux 95 Setup"
echo "========================="

# Check system requirements
echo "Checking system..."
uname -a

# Configure X11
echo "Setting up X Window System..."
if [ -f /usr/X11R6/bin/X ]; then
    echo "X11R6 found"
    cp .xinitrc.template ~/.xinitrc
    chmod +x ~/.xinitrc
fi

# Setup FVWM
echo "Configuring FVWM window manager..."
mkdir -p ~/.fvwm
cp /usr/local/share/fvwm/system.fvwmrc ~/.fvwm/fvwmrc

# Network configuration
echo "Network setup..."
echo "hostname linux95" > /tmp/hostname
echo "127.0.0.1 localhost" >> /etc/hosts

echo "Setup complete!"
echo "Reboot to start X11 environment"`,

      `From: user@university.edu
To: friend@college.edu
Subject: Check out this Linux thing!
Date: Mon, 16 Jan 1995 14:30:00 PST

Hey there!

You absolutely have to try this "Linux" operating system I just installed on my 486. It's incredible - a complete Unix-like system that runs on PC hardware, and it's completely free!

I downloaded it from ftp.funet.fi using our university's T1 connection. Took about 6 hours to get all the disk images, but totally worth it. The installation was a bit tricky (had to compile the kernel twice), but now I have a real Unix workstation on my desk.

The best part? I can run X Window System with actual GUI applications. I've got xterm, xclock, and even this neat program called Mosaic that lets you browse something called the "World Wide Web." It's like a giant hypertext system connecting computers worldwide!

I'm using FVWM as my window manager - it has virtual desktops and everything. So much better than Windows 3.1.

The development tools are amazing too. GCC, Make, all the standard Unix utilities. I can actually learn real programming now instead of just DOS batch files.

Let me know if you want to try it. I can create boot floppies for you.

Talk to you on IRC tonight!
-Your friend

P.S. - My new email address is user@linux95.home`
    ];

    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    this.textarea.value = randomText;
    this.isModified = false;
    this.updateStatusBar();
  }

  private newFile(): void {
    if (this.isModified) {
      if (!confirm('Discard unsaved changes?')) return;
    }
    
    this.textarea.value = '';
    this.currentFile = 'untitled.txt';
    this.isModified = false;
    this.updateStatusBar();
  }

  private openFile(): void {
    // Simulate file picker with predefined files
    const files = [
      'readme.txt',
      'config.sh',
      'letter.txt',
      'program.c',
      'notes.txt'
    ];
    
    const fileList = files.map((file, index) => `${index + 1}. ${file}`).join('\n');
    const choice = prompt(`Select file to open:\n${fileList}\n\nEnter number (1-${files.length}):`);
    
    if (choice) {
      const index = parseInt(choice) - 1;
      if (index >= 0 && index < files.length) {
        this.currentFile = files[index];
        this.loadSampleText(); // In a real app, this would load the actual file
        this.isModified = false;
        this.updateStatusBar();
      }
    }
  }

  private saveFile(): void {
    // Simulate saving
    this.isModified = false;
    this.updateStatusBar();
    this.showMessage(`Saved ${this.currentFile}`);
  }

  private saveAsFile(): void {
    const filename = prompt('Save as filename:', this.currentFile);
    if (filename) {
      this.currentFile = filename;
      this.saveFile();
    }
  }

  private async aiAssist(): Promise<void> {
    const selectedText = this.textarea.value.substring(
      this.textarea.selectionStart,
      this.textarea.selectionEnd
    );

    if (!selectedText) {
      this.showMessage('Please select some text for AI assistance');
      return;
    }

    try {
      const prompt = `Please help improve this text from 1995: "${selectedText}"`;
             const response = await aiService.assistText(prompt);
      
      if (response) {
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const before = this.textarea.value.substring(0, start);
        const after = this.textarea.value.substring(end);
        
        this.textarea.value = before + response + after;
        this.isModified = true;
        this.updateStatusBar();
      }
    } catch (error) {
      this.showMessage('AI assist not available (this is 1995 after all!)');
    }
  }

  private updateStatusBar(): void {
    const lines = this.textarea.value.split('\n').length;
    const chars = this.textarea.value.length;
    const status = this.isModified ? 'Modified' : 'Saved';
    
    this.statusBar.textContent = `${this.currentFile} - ${lines} lines, ${chars} chars - ${status}`;
  }

  private showMessage(message: string): void {
    const messageEl = createElement('div', 'editor-message', message);
    messageEl.style.position = 'absolute';
    messageEl.style.bottom = '10px';
    messageEl.style.right = '10px';
    messageEl.style.background = '#FFFFCC';
    messageEl.style.padding = '6px 12px';
    messageEl.style.border = '1px solid #808080';
    messageEl.style.fontSize = '11px';
    messageEl.style.zIndex = '1000';
    
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