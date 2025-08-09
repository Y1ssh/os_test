// XCalc application - Classic X11 calculator
import { AppInterface, AppConfig } from '../types/app.js';
import { createElement, addEventListenerWithCleanup } from '../utils/dom-helpers.js';

export class XCalcApp implements AppInterface {
  config: AppConfig = {
    id: 'xcalc',
    title: 'Calculator',
    icon: '🧮',
    category: 'utility',
    windowConfig: {
      width: 200,
      height: 280,
      resizable: false
    }
  };

  private element!: HTMLElement;
  private display!: HTMLElement;
  private cleanupTasks: (() => void)[] = [];
  private currentValue = '0';
  private previousValue = '';
  private operation = '';
  private waitingForValue = false;

  init(): void {
    // Initialize calculator state
  }

  render(): HTMLElement {
    this.element = createElement('div', 'xcalc-app');
    
    this.createDisplay();
    this.createButtons();
    
    return this.element;
  }

  private createDisplay(): void {
    this.display = createElement('div', 'calc-display');
    this.display.textContent = this.currentValue;
    this.element.appendChild(this.display);
  }

  private createButtons(): void {
    const buttonsContainer = createElement('div', 'calc-buttons');
    
    const buttons = [
      ['C', 'CE', '%', '/'],
      ['7', '8', '9', '*'],
      ['4', '5', '6', '-'],
      ['1', '2', '3', '+'],
      ['0', '.', '±', '=']
    ];

    buttons.forEach(row => {
      row.forEach(buttonText => {
        const button = createElement('button', 'calc-button', buttonText);
        
        addEventListenerWithCleanup(button, 'click', () => {
          this.handleButtonClick(buttonText);
        }, this.cleanupTasks);
        
        buttonsContainer.appendChild(button);
      });
    });

    this.element.appendChild(buttonsContainer);
  }

  private handleButtonClick(button: string): void {
    switch (button) {
      case 'C':
        this.clear();
        break;
      case 'CE':
        this.clearEntry();
        break;
      case '=':
        this.calculate();
        break;
      case '+':
      case '-':
      case '*':
      case '/':
      case '%':
        this.setOperation(button);
        break;
      case '.':
        this.addDecimal();
        break;
      case '±':
        this.toggleSign();
        break;
      default:
        if (!isNaN(parseInt(button))) {
          this.addDigit(button);
        }
    }
    
    this.updateDisplay();
  }

  private clear(): void {
    this.currentValue = '0';
    this.previousValue = '';
    this.operation = '';
    this.waitingForValue = false;
  }

  private clearEntry(): void {
    this.currentValue = '0';
  }

  private addDigit(digit: string): void {
    if (this.waitingForValue) {
      this.currentValue = digit;
      this.waitingForValue = false;
    } else {
      this.currentValue = this.currentValue === '0' ? digit : this.currentValue + digit;
    }
  }

  private addDecimal(): void {
    if (this.waitingForValue) {
      this.currentValue = '0.';
      this.waitingForValue = false;
    } else if (this.currentValue.indexOf('.') === -1) {
      this.currentValue += '.';
    }
  }

  private toggleSign(): void {
    if (this.currentValue !== '0') {
      this.currentValue = this.currentValue.startsWith('-') 
        ? this.currentValue.substring(1)
        : '-' + this.currentValue;
    }
  }

  private setOperation(op: string): void {
    if (this.operation && !this.waitingForValue) {
      this.calculate();
    }
    
    this.operation = op;
    this.previousValue = this.currentValue;
    this.waitingForValue = true;
  }

  private calculate(): void {
    if (!this.operation || !this.previousValue) return;
    
    const prev = parseFloat(this.previousValue);
    const current = parseFloat(this.currentValue);
    let result = 0;
    
    switch (this.operation) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*':
        result = prev * current;
        break;
      case '/':
        if (current !== 0) {
          result = prev / current;
        } else {
          this.currentValue = 'Error';
          this.operation = '';
          this.previousValue = '';
          return;
        }
        break;
      case '%':
        result = prev % current;
        break;
    }
    
    this.currentValue = result.toString();
    this.operation = '';
    this.previousValue = '';
    this.waitingForValue = true;
  }

  private updateDisplay(): void {
    // Limit display to reasonable length
    let displayValue = this.currentValue;
    if (displayValue.length > 12) {
      displayValue = parseFloat(displayValue).toExponential(6);
    }
    this.display.textContent = displayValue;
  }

  cleanup(): void {
    this.cleanupTasks.forEach(task => task());
    this.cleanupTasks = [];
  }
}

export default XCalcApp; 