// Virtual file system for Linux 95 Desktop
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
    this.root = this.createDefaultFileSystem();
  }

  private createDefaultFileSystem(): FileSystemNode {
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
                { name: 'Documents', type: 'directory', children: [] },
                { name: 'Pictures', type: 'directory', children: [] },
                { name: 'Downloads', type: 'directory', children: [] },
                { name: 'readme.txt', type: 'file', size: 156, content: 'Welcome to Linux 95!\n\nThis is a retro desktop environment that brings back the nostalgic computing experience of 1995.' },
                { name: 'todo.txt', type: 'file', size: 89, content: '- Check out the terminal\n- Play minesweeper\n- Write something in the text editor' }
              ]
            }
          ]
        },
        {
          name: 'usr',
          type: 'directory',
          children: [
            { name: 'bin', type: 'directory', children: [] },
            { name: 'lib', type: 'directory', children: [] }
          ]
        },
        {
          name: 'etc',
          type: 'directory',
          children: [
            { name: 'passwd', type: 'file', size: 45, content: 'root:x:0:0:root:/root:/bin/bash' }
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