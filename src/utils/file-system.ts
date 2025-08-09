// Virtual file system with authentic 1995 Linux content
export interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  size?: number;
  content?: string;
  children?: FileSystemNode[];
  icon?: string;
}

export class VirtualFileSystem {
  private root: FileSystemNode;
  private currentPath: string[] = [];

  constructor() {
    this.root = this.createAuthentic1995FileSystem();
  }

  private createAuthentic1995FileSystem(): FileSystemNode {
    return {
      name: 'root',
      type: 'directory',
      children: [
        {
          name: 'home',
          type: 'directory',
          children: [
            {
              name: 'user',
              type: 'directory',
              children: [
                { 
                  name: 'Documents', 
                  type: 'directory', 
                  children: [
                    { name: 'letter.txt', type: 'file', size: 1234, content: 'Dear Friend,\n\nI hope this letter finds you well. I am writing to tell you about this amazing new thing called the World Wide Web!\n\nYou can actually connect to other computers around the world and share information. It is quite revolutionary.\n\nBest regards,\nYour Friend' },
                    { name: 'thesis.doc', type: 'file', size: 45678, content: 'Computer Science Thesis - 1995\n\n"The Future of Computer Networks"\n\nAbstract:\nThis thesis explores the potential of interconnected computer networks and their impact on society...\n\n[This would be a 200+ page document in a real system]' },
                    { name: 'budget.txt', type: 'file', size: 567, content: '1995 Personal Budget\n\nIncome: $2,400/month\nRent: $650\nFood: $200\nUtilities: $80\nInternet: $19.95 (new!)\nGasoline: $45\nSavings: $400\n\nTotal: $1,394.95\nRemaining: $1,005.05' }
                  ]
                },
                { 
                  name: 'Pictures', 
                  type: 'directory', 
                  children: [
                    { name: 'vacation.jpg', type: 'file', size: 89123, content: '[JPEG Image Data - 640x480 pixels]\nFamily vacation photo from summer 1994' },
                    { name: 'computer.bmp', type: 'file', size: 307200, content: '[BMP Image Data - 640x480 pixels, 24-bit]\nPhoto of my new 486 DX2/66 computer setup!' },
                    { name: 'tux.xpm', type: 'file', size: 2048, content: '[XPM Image Data - Linux Penguin Mascot]\n/* Created with GIMP */\nLinux mascot "Tux" - still very new!' }
                  ]
                },
                { 
                  name: 'Downloads', 
                  type: 'directory', 
                  children: [
                    { name: 'netscape-1.1.tar.gz', type: 'file', size: 2847392, content: '[Compressed Archive]\nNetscape Navigator 1.1 for Linux\nDownloaded from: ftp.netscape.com' },
                    { name: 'linux-1.2.13.tar.gz', type: 'file', size: 4567890, content: '[Compressed Archive]\nLinux Kernel 1.2.13 Source Code\nCompiled on: Jan 15, 1995' },
                    { name: 'fvwm-2.0.tar.gz', type: 'file', size: 1234567, content: '[Compressed Archive]\nFVWM Window Manager Version 2.0\nBest window manager for X11!' }
                  ]
                },
                { 
                  name: 'Mail', 
                  type: 'directory', 
                  children: [
                    { name: 'inbox', type: 'file', size: 4567, content: 'From: root@localhost\nSubject: Welcome to Linux!\nDate: Mon, 16 Jan 1995 09:30:00 PST\n\nWelcome to your new Linux system! You now have access to:\n- Multi-user environment\n- X Window System\n- TCP/IP networking\n- Development tools\n\nEnjoy exploring the future of computing!' },
                    { name: 'sent', type: 'file', size: 1234, content: 'From: user@localhost\nTo: friend@university.edu\nSubject: Check out Linux!\nDate: Tue, 17 Jan 1995 14:20:00 PST\n\nHey, you have to try this Linux thing! It\'s like Unix but free!' }
                  ]
                },
                { name: 'readme.txt', type: 'file', size: 892, content: 'Welcome to Linux 95!\n\nThis is an authentic recreation of a 1995 Linux desktop environment.\n\nFeatures:\n- FVWM 2.0 window manager\n- X11R6 applications\n- Virtual desktops (2x2 grid)\n- Classic Unix tools\n- TCP/IP networking support\n- GNU utilities\n\nSystem Requirements:\n- 386 or 486 processor\n- 4MB RAM minimum (8MB recommended)\n- VGA display (SVGA recommended)\n- Hard disk space: 20MB minimum\n\nEnjoy your journey back to 1995!' },
                { name: 'todo.txt', type: 'file', size: 234, content: 'Things to do in Linux 95:\n\n• Learn vi or emacs\n• Compile the kernel\n• Try X11 applications:\n  - XEyes (fun!)\n  - XCalc\n  - XClock\n• Connect to bulletin boards\n• Download software via FTP\n• Learn about this "World Wide Web"\n• Set up email\n• Try programming in C' },
                { name: '.xinitrc', type: 'file', size: 156, content: '#!/bin/sh\n# X11 startup script\n\n# Set up fonts\nxset +fp /usr/X11R6/lib/X11/fonts/misc/\nxset +fp /usr/X11R6/lib/X11/fonts/75dpi/\n\n# Start window manager\nfvwm &\n\n# Start some apps\nxclock -geometry 64x64+0+0 &\nxterm -geometry 80x24+100+100 &' },
                { name: '.fvwmrc', type: 'file', size: 789, content: '# FVWM Configuration for Linux 95\n# Written January 1995\n\n# Desktop and window settings\nDeskTopSize 2x2\nClickTime 750\n\n# Menu colors\nMenuStyle * Foreground black, Background grey\nMenuStyle * Font -*-helvetica-medium-r-*-*-12-*-*-*-*-*-*-*\n\n# Icon settings\nStyle "*" Icon unknown1.xpm\nStyle "xterm" Icon terminal.xpm\nStyle "Netscape" Icon www.xpm' },
                { name: '.bashrc', type: 'file', size: 445, content: '# Bash configuration for Linux 95\n# User: user\n# System: Linux 1.2.13\n\n# Command aliases\nalias ls="ls --color=auto"\nalias ll="ls -la"\nalias la="ls -a"\nalias cp="cp -i"\nalias mv="mv -i"\nalias rm="rm -i"\n\n# Set up prompt\nexport PS1="\\u@\\h:\\w\\$ "\n\n# History settings\nexport HISTSIZE=100\nexport HISTFILESIZE=200\n\n# Set default editor\nexport EDITOR=vi' },
                { name: 'secret_linux_wallpaper.jpg', type: 'file', size: 153678, content: '[JPEG Image Data - 640x480 pixels]\n\nASCII Art Linux Penguin:\n\n     .--.\n    |o_o |\n    |:_/ |\n   //   \\ \\\n  (|     | )\n /\'\_   _/`\\\n \\___)=(___/\n\nTux says: "Welcome to Linux!"\n\n(This is actually a text file with ASCII art, but pretend it\'s a wallpaper!)' }
              ]
            }
          ]
        },
        {
          name: 'usr',
          type: 'directory',
          children: [
            { 
              name: 'bin', 
              type: 'directory', 
              children: [
                { name: 'gcc', type: 'file', size: 98765, content: '[Binary Executable]\nGNU C Compiler version 2.6.3' },
                { name: 'make', type: 'file', size: 45678, content: '[Binary Executable]\nGNU Make utility' },
                { name: 'vi', type: 'file', size: 123456, content: '[Binary Executable]\nVi text editor' }
              ]
            },
            { 
              name: 'lib', 
              type: 'directory', 
              children: [
                { name: 'libc.so.5', type: 'file', size: 789123, content: '[Shared Library]\nC Library version 5.x' }
              ]
            },
            {
              name: 'X11R6',
              type: 'directory',
              children: [
                {
                  name: 'bin',
                  type: 'directory',
                  children: [
                    { name: 'xterm', type: 'file', size: 87654, content: '[Binary Executable]\nX Terminal Emulator' },
                    { name: 'xclock', type: 'file', size: 23456, content: '[Binary Executable]\nX11 Clock Application' },
                    { name: 'xeyes', type: 'file', size: 12345, content: '[Binary Executable]\nX11 Eyes that follow mouse' }
                  ]
                }
              ]
            }
          ]
        },
        {
          name: 'etc',
          type: 'directory',
          children: [
            { name: 'passwd', type: 'file', size: 234, content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:Linux User:/home/user:/bin/bash\nnobody:x:65534:65534:Nobody:/dev/null:/bin/false' },
            { name: 'hosts', type: 'file', size: 123, content: '127.0.0.1    localhost\n192.168.1.1  gateway\n# End of hosts file' },
            { name: 'fstab', type: 'file', size: 167, content: '/dev/hda1    /         ext2    defaults        1 1\n/dev/hda2    /home     ext2    defaults        1 2\n/dev/hdb     /mnt/cdrom iso9660 ro,noauto      0 0' },
            { name: 'motd', type: 'file', size: 345, content: 'Welcome to Linux 95!\n\nKernel: Linux 1.2.13\nBuilt: January 15, 1995\n\nThis system is for authorized users only.\nAll activities may be monitored.\n\nHave a great day!' }
          ]
        },
        {
          name: 'tmp',
          type: 'directory',
          children: [
            { name: '.X11-unix', type: 'directory', children: [] },
            { name: 'temp_file.tmp', type: 'file', size: 0, content: '' }
          ]
        },
        {
          name: 'var',
          type: 'directory',
          children: [
            {
              name: 'log',
              type: 'directory',
              children: [
                { name: 'messages', type: 'file', size: 12345, content: 'Jan 15 09:30:15 linux95 kernel: Linux version 1.2.13\nJan 15 09:30:16 linux95 kernel: Console: 16 point font, 400 scans\nJan 15 09:30:17 linux95 kernel: Serial driver version 4.13\nJan 15 09:30:18 linux95 login: root login on tty1' }
              ]
            },
            {
              name: 'spool',
              type: 'directory',
              children: [
                {
                  name: 'mail',
                  type: 'directory',
                  children: [
                    { name: 'user', type: 'file', size: 567, content: 'New mail arrived for user' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
  }

  getCurrentDirectory(): FileSystemNode {
    let current = this.root;
    for (const segment of this.currentPath) {
      const child = current.children?.find(c => c.name === segment && c.type === 'directory');
      if (child) {
        current = child;
      } else {
        break;
      }
    }
    return current;
  }

  getCurrentPath(): string {
    return '/' + this.currentPath.join('/');
  }

  changeDirectory(path: string): boolean {
    if (path === '..') {
      if (this.currentPath.length > 0) {
        this.currentPath.pop();
      }
      return true;
    }

    if (path.startsWith('/')) {
      this.currentPath = path.substring(1).split('/').filter(p => p);
      return this.directoryExists(this.currentPath);
    }

    const newPath = [...this.currentPath, path];
    if (this.directoryExists(newPath)) {
      this.currentPath = newPath;
      return true;
    }
    return false;
  }

  private directoryExists(path: string[]): boolean {
    let current = this.root;
    for (const segment of path) {
      const child = current.children?.find(c => c.name === segment && c.type === 'directory');
      if (!child) return false;
      current = child;
    }
    return true;
  }

  getFile(filename: string): FileSystemNode | null {
    const current = this.getCurrentDirectory();
    return current.children?.find(c => c.name === filename && c.type === 'file') || null;
  }

  listDirectory(): FileSystemNode[] {
    const current = this.getCurrentDirectory();
    return current.children || [];
  }
}

export const fileSystem = new VirtualFileSystem(); 