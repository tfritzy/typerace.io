import { Terminal } from '@xterm/xterm';

export const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

export const BOX_CHARS = {
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│',
  leftT: '├',
  rightT: '┤',
  topT: '┬',
  bottomT: '┴',
  cross: '┼',
};

export class TerminalRenderer {
  private term: Terminal;
  private width: number = 80;
  private height: number = 24;

  constructor(term: Terminal) {
    this.term = term;
    this.updateDimensions();
  }

  updateDimensions() {
    this.width = this.term.cols;
    this.height = this.term.rows;
  }

  moveTo(x: number, y: number) {
    this.term.write(`\x1b[${y + 1};${x + 1}H`);
  }

  clear() {
    this.term.write('\x1b[2J\x1b[H');
  }

  hideCursor() {
    this.term.write('\x1b[?25l');
  }

  showCursor() {
    this.term.write('\x1b[?25h');
  }

  writeAt(x: number, y: number, text: string, styles: string = '') {
    this.moveTo(x, y);
    this.term.write(`${styles}${text}${COLORS.reset}`);
  }

  drawBox(x: number, y: number, width: number, height: number, title?: string) {
    const top = BOX_CHARS.topLeft + BOX_CHARS.horizontal.repeat(width - 2) + BOX_CHARS.topRight;
    const bottom = BOX_CHARS.bottomLeft + BOX_CHARS.horizontal.repeat(width - 2) + BOX_CHARS.bottomRight;
    const middle = BOX_CHARS.vertical + ' '.repeat(width - 2) + BOX_CHARS.vertical;

    this.writeAt(x, y, top, COLORS.gray);
    
    for (let i = 1; i < height - 1; i++) {
      this.writeAt(x, y + i, middle, COLORS.gray);
    }
    
    this.writeAt(x, y + height - 1, bottom, COLORS.gray);

    if (title) {
      const titleX = x + Math.floor((width - title.length - 4) / 2) + 2;
      this.writeAt(titleX, y, ` ${title} `, COLORS.yellow + COLORS.bold);
    }
  }

  drawProgressBar(x: number, y: number, width: number, progress: number, color: string = COLORS.green) {
    const fillWidth = Math.floor((width - 2) * Math.min(1, Math.max(0, progress)));
    const emptyWidth = width - 2 - fillWidth;
    
    const bar = '[' + '█'.repeat(fillWidth) + '░'.repeat(emptyWidth) + ']';
    this.writeAt(x, y, bar, color);
  }

  centerText(y: number, text: string, styles: string = '') {
    const x = Math.floor((this.width - this.stripAnsi(text).length) / 2);
    this.writeAt(Math.max(0, x), y, text, styles);
  }

  stripAnsi(str: string): string {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  }

  wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= maxWidth) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);

    return lines;
  }

  get cols() {
    return this.width;
  }

  get rows() {
    return this.height;
  }
}
