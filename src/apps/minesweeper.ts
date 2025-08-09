// Minesweeper game application for Linux 95 Desktop
import { AppInterface, AppConfig } from '../types/app.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';
import { aiService } from '../utils/ai-service.js';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

export class MinesweeperApp implements AppInterface {
  config: AppConfig = {
    id: 'minesweeper',
    title: 'XMines',
    icon: '💣',
    category: 'game',
    windowConfig: {
      width: 400,
      height: 450,
      resizable: false
    }
  };

  private element!: HTMLElement;
  private gameBoard!: HTMLElement;
  private statusBar!: HTMLElement;
  private cleanupTasks: (() => void)[] = [];
  private board: Cell[][] = [];
  private rows = 9;
  private cols = 9;
  private mines = 10;
  private gameState: 'playing' | 'won' | 'lost' = 'playing';
  private flagsUsed = 0;

  init(): void {
    this.initializeBoard();
  }

  render(): HTMLElement {
    this.element = createElement('div', 'minesweeper-app');
    
    this.createHeader();
    this.createGameBoard();
    this.createStatusBar();
    this.renderBoard();

    return this.element;
  }

  private createHeader(): void {
    const header = createElement('div', 'ms-header');
    
    const newGameBtn = createElement('button', 'ms-button', '🙂 New Game');
    const hintBtn = createElement('button', 'ms-button', '💡 AI Hint');
    
    addEventListenerWithCleanup(newGameBtn, 'click', () => {
      this.newGame();
    }, this.cleanupTasks);

    addEventListenerWithCleanup(hintBtn, 'click', () => {
      this.getAIHint();
    }, this.cleanupTasks);

    header.appendChild(newGameBtn);
    header.appendChild(hintBtn);
    this.element.appendChild(header);
  }

  private createGameBoard(): void {
    this.gameBoard = createElement('div', 'ms-board');
    this.gameBoard.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
    this.element.appendChild(this.gameBoard);
  }

  private createStatusBar(): void {
    this.statusBar = createElement('div', 'ms-status');
    this.element.appendChild(this.statusBar);
    this.updateStatus();
  }

  private initializeBoard(): void {
    // Initialize empty board
    this.board = Array(this.rows).fill(null).map(() =>
      Array(this.cols).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0
      }))
    );

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < this.mines) {
      const row = Math.floor(Math.random() * this.rows);
      const col = Math.floor(Math.random() * this.cols);
      
      if (!this.board[row][col].isMine) {
        this.board[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate adjacent mine counts
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (!this.board[row][col].isMine) {
          this.board[row][col].adjacentMines = this.getAdjacentMines(row, col);
        }
      }
    }

    this.gameState = 'playing';
    this.flagsUsed = 0;
  }

  private getAdjacentMines(row: number, col: number): number {
    let count = 0;
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c].isMine) {
          count++;
        }
      }
    }
    return count;
  }

  private renderBoard(): void {
    this.gameBoard.innerHTML = '';
    
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const cell = this.createCellElement(row, col);
        this.gameBoard.appendChild(cell);
      }
    }
  }

  private createCellElement(row: number, col: number): HTMLElement {
    const cell = createElement('div', 'ms-cell');
    const cellData = this.board[row][col];
    
    if (cellData.isRevealed) {
      cell.classList.add('revealed');
      if (cellData.isMine) {
        cell.textContent = '💣';
        cell.classList.add('mine');
      } else if (cellData.adjacentMines > 0) {
        cell.textContent = cellData.adjacentMines.toString();
        cell.className += ` number-${cellData.adjacentMines}`;
      }
    } else if (cellData.isFlagged) {
      cell.textContent = '🚩';
      cell.classList.add('flagged');
    }

    addEventListenerWithCleanup(cell, 'click', () => {
      if (this.gameState === 'playing' && !cellData.isFlagged) {
        this.revealCell(row, col);
      }
    }, this.cleanupTasks);

    addEventListenerWithCleanup(cell, 'contextmenu', (e) => {
      e.preventDefault();
      if (this.gameState === 'playing' && !cellData.isRevealed) {
        this.toggleFlag(row, col);
      }
    }, this.cleanupTasks);

    return cell;
  }

  private revealCell(row: number, col: number): void {
    const cell = this.board[row][col];
    
    if (cell.isRevealed || cell.isFlagged) return;

    cell.isRevealed = true;

    if (cell.isMine) {
      this.gameState = 'lost';
      this.revealAllMines();
    } else if (cell.adjacentMines === 0) {
      // Auto-reveal adjacent cells
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
            this.revealCell(r, c);
          }
        }
      }
    }

    this.checkWinCondition();
    this.renderBoard();
    this.updateStatus();
  }

  private toggleFlag(row: number, col: number): void {
    const cell = this.board[row][col];
    cell.isFlagged = !cell.isFlagged;
    this.flagsUsed += cell.isFlagged ? 1 : -1;
    this.renderBoard();
    this.updateStatus();
  }

  private revealAllMines(): void {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.board[row][col].isMine) {
          this.board[row][col].isRevealed = true;
        }
      }
    }
  }

  private checkWinCondition(): void {
    let revealedCells = 0;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.board[row][col].isRevealed && !this.board[row][col].isMine) {
          revealedCells++;
        }
      }
    }

    if (revealedCells === (this.rows * this.cols) - this.mines) {
      this.gameState = 'won';
    }
  }

  private newGame(): void {
    this.initializeBoard();
    this.renderBoard();
    this.updateStatus();
  }

  private updateStatus(): void {
    const remaining = this.mines - this.flagsUsed;
    let status = `Mines: ${remaining}`;
    
    if (this.gameState === 'won') {
      status += ' - 🎉 You Win!';
    } else if (this.gameState === 'lost') {
      status += ' - 💥 Game Over';
    }

    this.statusBar.textContent = status;
  }

  private async getAIHint(): Promise<void> {
    if (this.gameState !== 'playing') return;

    const boardState = this.getBoardStateString();
    const hint = await aiService.getMinesweeperHint(boardState);
    
    // Show hint in a temporary popup
    const hintPopup = createElement('div', 'hint-popup');
    hintPopup.textContent = hint;
    
    this.element.appendChild(hintPopup);
    setTimeout(() => hintPopup.remove(), 3000);
  }

  private getBoardStateString(): string {
    return this.board.map(row =>
      row.map(cell => {
        if (cell.isFlagged) return 'F';
        if (!cell.isRevealed) return '?';
        if (cell.isMine) return '*';
        return cell.adjacentMines.toString();
      }).join('')
    ).join('\n');
  }

  cleanup(): void {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
}

export default MinesweeperApp; 