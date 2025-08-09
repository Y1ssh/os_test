// Terminal application for Linux 95 Desktop
import { AppInterface, AppConfig } from '../types/app.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';

export class TerminalApp implements AppInterface {
  config: AppConfig = {
    id: 'terminal',
    title: 'XTerm',
    icon: '💻',
    category: 'system',
    windowConfig: {
      width: 500,
      height: 350,
      resizable: true
    }
  };

  private element!: HTMLElement;
  private output!: HTMLElement;
  private input!: HTMLInputElement;
  private cleanupTasks: (() => void)[] = [];
  private commandHistory: string[] = [];
  private historyIndex = -1;

  init(): void {
    // Initialize any resources
  }

  render(): HTMLElement {
    this.element = createElement('div', 'terminal-app');
    
    this.output = createElement('div', 'terminal-output');
    this.output.innerHTML = `
      <div class="terminal-line">Linux 95 Desktop Environment v1.0</div>
      <div class="terminal-line">Copyright (C) 1995 Linux 95 Project</div>
      <div class="terminal-line">Type 'help' for a list of commands.</div>
      <div class="terminal-line">&nbsp;</div>
    `;

    this.input = createElement('input', 'terminal-input') as HTMLInputElement;
    this.input.type = 'text';
    this.input.placeholder = 'user@linux95:~$ ';

    this.setupEventListeners();
    this.addPrompt();

    this.element.appendChild(this.output);
    this.element.appendChild(this.input);

    // Auto-focus input
    setTimeout(() => this.input.focus(), 100);

    return this.element;
  }

  private setupEventListeners(): void {
    addEventListenerWithCleanup(this.input, 'keydown', (e) => {
      const keyEvent = e as KeyboardEvent;
      if (keyEvent.key === 'Enter') {
        this.executeCommand(this.input.value.trim());
        this.input.value = '';
      } else if (keyEvent.key === 'ArrowUp') {
        keyEvent.preventDefault();
        this.navigateHistory(-1);
      } else if (keyEvent.key === 'ArrowDown') {
        keyEvent.preventDefault();
        this.navigateHistory(1);
      }
    }, this.cleanupTasks);

    addEventListenerWithCleanup(this.element, 'click', () => {
      this.input.focus();
    }, this.cleanupTasks);
  }

  private navigateHistory(direction: number): void {
    const newIndex = this.historyIndex + direction;
    if (newIndex >= -1 && newIndex < this.commandHistory.length) {
      this.historyIndex = newIndex;
      this.input.value = this.historyIndex === -1 ? '' : this.commandHistory[this.historyIndex];
    }
  }

  private executeCommand(command: string): void {
    if (command) {
      this.commandHistory.unshift(command);
      this.historyIndex = -1;
    }

    // Add command to output
    const commandLine = createElement('div', 'terminal-line');
    commandLine.textContent = `user@linux95:~$ ${command}`;
    this.output.appendChild(commandLine);

    // Execute command
    const response = this.processCommand(command);
    if (response) {
      const responseLine = createElement('div', 'terminal-line');
      responseLine.textContent = response;
      this.output.appendChild(responseLine);
    }

    this.addPrompt();
    this.output.scrollTop = this.output.scrollHeight;
  }

  private processCommand(command: string): string {
    const [cmd, ...args] = command.toLowerCase().split(' ');

    switch (cmd) {
      case 'help':
        return 'Available commands: help, ls, pwd, whoami, uname, clear, date, cat, echo, ps, uptime, fortune';
      
      case 'ls':
        return 'Documents  Downloads  Desktop  Pictures  readme.txt  todo.txt  secret_linux_wallpaper.jpg';
      
      case 'pwd':
        return '/home/user';
      
      case 'whoami':
        return 'user';
      
      case 'uname':
        return 'Linux linux95 2.0.35 #1 i486 Linux 95';
      
      case 'date':
        return new Date().toString();
      
      case 'cat':
        return this.catCommand(args[0]);
      
      case 'echo':
        return args.join(' ');
      
      case 'ps':
        return 'PID TTY      TIME CMD\n1234 pts/0    00:00:01 bash\n5678 pts/0    00:00:00 ps';
      
      case 'uptime':
        return '12:34:56 up 1 day, 2:34, 1 user, load average: 0.15, 0.10, 0.05';
      
      case 'fortune':
        return this.getFortune();
      
      case 'clear':
        this.output.innerHTML = '';
        return '';
      
      case '':
        return '';
      
      default:
        return `bash: ${cmd}: command not found`;
    }
  }

  private catCommand(filename: string): string {
    const files: Record<string, string> = {
      'readme.txt': 'Welcome to Linux 95!\n\nThis is a retro desktop environment that brings back the nostalgic computing experience of 1995.',
      'todo.txt': '- Check out the terminal\n- Play minesweeper\n- Write something in the text editor',
      'secret_linux_wallpaper.jpg': 'This is a secret Linux wallpaper! 🐧\n(It\'s actually a text file, but shh...)'
    };

    return files[filename] || `cat: ${filename}: No such file or directory`;
  }

  private getFortune(): string {
    const fortunes = [
      "Linux 95: Because sometimes newer isn't better!",
      "In 1995, we thought 8MB of RAM was luxurious.",
      "The future is retro, and retro is the future.",
      "Y2K is still 5 years away - plenty of time to worry!",
      "Remember when installing software meant 20 floppy disks?"
    ];
    return fortunes[Math.floor(Math.random() * fortunes.length)];
  }

  private addPrompt(): void {
    const prompt = createElement('div', 'terminal-prompt');
    prompt.innerHTML = 'user@linux95:~$ <span class="terminal-cursor">_</span>';
    this.output.appendChild(prompt);
  }

  cleanup(): void {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
}

export default TerminalApp; 