// XTerm application with larger 1995 resolution sizing
import { AppInterface, AppConfig } from '../types/app.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';

export class TerminalApp implements AppInterface {
  config: AppConfig = {
    id: 'terminal',
    title: 'XTerm',
    icon: '💻',
    category: 'system',
    windowConfig: {
      width: 600, // Much larger for 1995 resolution
      height: 420,
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
        return 'Available commands: help, ls, pwd, whoami, uname, clear, date, cat, echo, ps, uptime, fortune, top, free, df';
      
      case 'ls':
        return 'Documents/  Downloads/  Desktop/  Pictures/  Mail/\nreadme.txt  todo.txt  .xinitrc  .fvwmrc  secret_linux_wallpaper.jpg';
      
      case 'pwd':
        return '/home/user';
      
      case 'whoami':
        return 'user';
      
      case 'uname':
        return 'Linux linux95 1.2.13 #1 Wed Jan 18 12:34:56 PST 1995 i486 unknown';
      
      case 'date':
        const now = new Date();
        return `Wed Jan 18 ${now.toTimeString().substring(0, 8)} PST 1995`;
      
      case 'cat':
        return this.catCommand(args[0]);
      
      case 'echo':
        return args.join(' ');
      
      case 'ps':
        return 'PID TTY      TIME CMD\n  1 console    0:01 init\n 12 console    0:00 kflushd\n 13 console    0:00 kswapd\n134 tty1       0:01 bash\n234 tty1       0:00 ps';
      
      case 'uptime':
        return '12:34pm  up 1 day, 2:34, 1 user, load average: 0.15, 0.10, 0.05';
      
      case 'top':
        return 'Linux 95 - 12:34pm up 1 day, load: 0.15\n\nPID USER     PRI  SIZE  RES STATE   TIME   WCPU    CPU COMMAND\n  1 root      1    48    0 sleep   0:01  0.00%  0.00% init\n 12 root      6     0    0 sleep   0:00  0.00%  0.00% kflushd';
      
      case 'free':
        return '             total       used       free     shared    buffers     cached\nMem:         16384       8192       8192          0        512       2048\nSwap:        32768          0      32768';
      
      case 'df':
        return 'Filesystem     1k-blocks    Used Available Use% Mounted on\n/dev/hda1         524288   65536    458752  13% /\n/dev/hda2        1048576  131072    917504  13% /home';
      
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
      'readme.txt': 'Welcome to Linux 95!\n\nThis is an authentic recreation of a 1995 Linux desktop environment.\nFeatures:\n- FVWM window manager\n- X11 applications\n- Virtual desktops\n- Classic Unix tools\n\nEnjoy your journey back to 1995!',
      'todo.txt': 'Things to do in Linux 95:\n- Check out XEyes\n- Try the calculator\n- Browse with Mosaic\n- Read email with Pine\n- Play XMines\n- Edit files with xedit',
      '.xinitrc': 'xset +fp /usr/X11R6/lib/X11/fonts/misc/\nxset +fp /usr/X11R6/lib/X11/fonts/75dpi/\nfvwm &\nxclock -geometry 64x64+0+0 &\nxterm -geometry 80x24+100+100 &',
      '.fvwmrc': '# FVWM Configuration for Linux 95\nDeskTopSize 2x2\nMenuStyle * Foreground black, Background grey\nStyle "*" Icon unknown1.xpm',
      'secret_linux_wallpaper.jpg': 'ASCII Art Penguin:\n     .--.\n    |o_o |\n    |:_/ |\n   //   \\ \\\n  (|     | )\n /\'\_   _/`\\\n \\___)=(___/\n\n(This is actually a text file with ASCII art!)'
    };

    return files[filename] || `cat: ${filename}: No such file or directory`;
  }

  private getFortune(): string {
    const fortunes = [
      "Linux 95: Because sometimes newer isn't better!",
      "In 1995, we thought 16MB of RAM was luxurious.",
      "The future is retro, and retro is the future.",
      "Y2K is still 5 years away - plenty of time to worry!",
      "Remember when installing software meant 20 floppy disks?",
      "X11 + FVWM = The perfect desktop environment",
      "Pine for email, Mosaic for web - what more do you need?",
      "Virtual desktops: the original workspace switcher",
      "When mice had balls and modems sang songs"
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