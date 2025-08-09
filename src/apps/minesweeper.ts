// XMines - Authentic 1995 Linux Minesweeper game
import { AppInterface, AppConfig } from '../types/app.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export class MinesweeperApp implements AppInterface {
  config: AppConfig = {
    id: 'minesweeper',
    title: 'XMines',
    icon: '💣',
    category: 'game',
    windowConfig: {
      width: 400, // Sized for 1995 resolution
      height: 480,
      resizable: false
    }
  };

  private element!: HTMLElement;
  private toolbar!: HTMLElement;
  private gameBoard!: HTMLElement;
  private statusBar!: HTMLElement;
  private cleanupTasks: (() => void)[] = [];
  
  private rows = 16;
  private cols = 16;
  private mineCount = 40;
  private cells: Cell[][] = [];
  private gameState: 'playing' | 'won' | 'lost' = 'playing';
  private flagCount = 0;
  private startTime = 0;
  private timer = 0;

  init(): void {
    this.initializeGame();
  }

  render(): HTMLElement {
    this.element = createElement('div', 'minesweeper-app');
    
    this.createToolbar();
    this.createGameBoard();
    this.createStatusBar();
    
    return this.element;
  }

  private createToolbar(): void {
    this.toolbar = createElement('div', 'mines-toolbar');
    
    const newGameBtn = createElement('button', 'mines-btn', 'New Game');
    const easyBtn = createElement('button', 'mines-btn', 'Easy');
    const mediumBtn = createElement('button', 'mines-btn', 'Medium');
    const hardBtn = createElement('button', 'mines-btn', 'Hard');

    addEventListenerWithCleanup(newGameBtn, 'click', () => {
      this.newGame();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(easyBtn, 'click', () => {
      this.setDifficulty(9, 9, 10);
    }, this.cleanupTasks);

    addEventListenerWithCleanup(mediumBtn, 'click', () => {
      this.setDifficulty(16, 16, 40);
    }, this.cleanupTasks);

    addEventListenerWithCleanup(hardBtn, 'click', () => {
      this.setDifficulty(16, 30, 99);
    }, this.cleanupTasks);

    this.toolbar.appendChild(newGameBtn);
    this.toolbar.appendChild(easyBtn);
    this.toolbar.appendChild(mediumBtn);
    this.toolbar.appendChild(hardBtn);
    this.element.appendChild(this.toolbar);
  }

  private createGameBoard(): void {
    this.gameBoard = createElement('div', 'mines-board');
    this.gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 20px)`;
    this.gameBoard.style.gridTemplateRows = `repeat(${this.rows}, 20px)`;
    this.element.appendChild(this.gameBoard);
    this.renderBoard();
  }

  private createStatusBar(): void {
    this.statusBar = createElement('div', 'mines-status');
    this.element.appendChild(this.statusBar);
    this.updateStatusBar();
  }

  private initializeGame(): void {
    // Initialize cells
    this.cells = [];
    for (let row = 0; row < this.rows; row++) {
      this.cells[row] = [];
      for (let col = 0; col < this.cols; col++) {
        this.cells[row][col] = {
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0
        };
      }
    }

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < this.mineCount) {
      const row = Math.floor(Math.random() * this.rows);
      const col = Math.floor(Math.random() * this.cols);
      
      if (!this.cells[row][col].isMine) {
        this.cells[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mine counts
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (!this.cells[row][col].isMine) {
          this.cells[row][col].neighborMines = this.countNeighborMines(row, col);
        }
      }
    }

    this.gameState = 'playing';
    this.flagCount = 0;
    this.startTime = Date.now();
    this.timer = 0;
  }

  private countNeighborMines(row: number, col: number): number {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
          if (this.cells[newRow][newCol].isMine) {
            count++;
          }
        }
      }
    }
    return count;
  }

  private renderBoard(): void {
    this.gameBoard.innerHTML = '';
    
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.cells[row][col];
        const cellEl = createElement('div', 'mine-cell');
        
        cellEl.dataset.row = row.toString();
        cellEl.dataset.col = col.toString();
        
        if (cell.isRevealed) {
          cellEl.classList.add('revealed');
          if (cell.isMine) {
            cellEl.textContent = '💣';
            cellEl.classList.add('mine');
          } else if (cell.neighborMines > 0) {
            cellEl.textContent = cell.neighborMines.toString();
            cellEl.classList.add(`mines-${cell.neighborMines}`);
          }
        } else if (cell.isFlagged) {
          cellEl.textContent = '🚩';
          cellEl.classList.add('flagged');
        }
        
        // Add event listeners
        addEventListenerWithCleanup(cellEl, 'click', () => {
          this.handleCellClick(row, col);
        }, this.cleanupTasks);
        
        addEventListenerWithCleanup(cellEl, 'contextmenu', (e) => {
          e.preventDefault();
          this.handleCellRightClick(row, col);
        }, this.cleanupTasks);
        
        this.gameBoard.appendChild(cellEl);
      }
    }
  }

  private handleCellClick(row: number, col: number): void {
    if (this.gameState !== 'playing') return;
    
    const cell = this.cells[row][col];
    if (cell.isRevealed || cell.isFlagged) return;
    
    this.revealCell(row, col);
    this.renderBoard();
    this.checkGameEnd();
    this.updateStatusBar();
  }

  private handleCellRightClick(row: number, col: number): void {
    if (this.gameState !== 'playing') return;
    
    const cell = this.cells[row][col];
    if (cell.isRevealed) return;
    
    cell.isFlagged = !cell.isFlagged;
    this.flagCount += cell.isFlagged ? 1 : -1;
    
    this.renderBoard();
    this.updateStatusBar();
  }

  private revealCell(row: number, col: number): void {
    const cell = this.cells[row][col];
    if (cell.isRevealed || cell.isFlagged) return;
    
    cell.isRevealed = true;
    
    if (cell.isMine) {
      this.gameState = 'lost';
      this.revealAllMines();
      return;
    }
    
    // If cell has no neighbor mines, reveal all neighbors
    if (cell.neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const newRow = row + dr;
          const newCol = col + dc;
          
          if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
            this.revealCell(newRow, newCol);
          }
        }
      }
    }
  }

  private revealAllMines(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.cells[row][col].isMine) {
          this.cells[row][col].isRevealed = true;
        }
      }
    }
  }

  private checkGameEnd(): void {
    if (this.gameState !== 'playing') return;
    
    let revealedCount = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.cells[row][col].isRevealed && !this.cells[row][col].isMine) {
          revealedCount++;
        }
      }
    }
    
    const totalNonMines = this.rows * this.cols - this.mineCount;
    if (revealedCount === totalNonMines) {
      this.gameState = 'won';
    }
  }

  private setDifficulty(rows: number, cols: number, mines: number): void {
    this.rows = rows;
    this.cols = cols;
    this.mineCount = mines;
    
    // Update board size
    this.gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 20px)`;
    this.gameBoard.style.gridTemplateRows = `repeat(${this.rows}, 20px)`;
    
    this.newGame();
  }

  private newGame(): void {
    this.initializeGame();
    this.renderBoard();
    this.updateStatusBar();
  }

  private updateStatusBar(): void {
    const minesLeft = this.mineCount - this.flagCount;
    this.timer = this.gameState === 'playing' ? Math.floor((Date.now() - this.startTime) / 1000) : this.timer;
    
    let status = '';
    switch (this.gameState) {
      case 'playing':
        status = `Mines: ${minesLeft} | Time: ${this.timer}s | Right-click to flag`;
        break;
      case 'won':
        status = `🎉 You Won! | Time: ${this.timer}s | Click New Game to play again`;
        break;
      case 'lost':
        status = `💥 Game Over! | Time: ${this.timer}s | Click New Game to try again`;
        break;
    }
    
    this.statusBar.textContent = status;
  }

  cleanup(): void {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
}

export default MinesweeperApp; 