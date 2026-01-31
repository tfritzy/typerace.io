import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { TerminalRenderer, COLORS, BOX_CHARS } from './terminal-renderer';
import { createConnectionManager, subscribeToGame, findGame, type GameSubscription } from './connection';
import type { DbConnection, Game, PlayerProgress, GameMode } from './types/spacetimedb';

type AppScreen = 'loading' | 'lobby' | 'game';

interface AppState {
  screen: AppScreen;
  gameId: string | null;
  game: Game | null;
  playerProgress: PlayerProgress[];
  typedText: string;
  selectedMode: GameMode;
  selectedGameType: 'Public' | 'Practice' | 'Private';
  lobbyPhrase: string;
  lobbyTypedText: string;
  isSearching: boolean;
  countdownValue: number | null;
}

const STARTUP_PHRASES = [
  "glhf",
  "ready for dust-off",
  "let's go",
  "bring it",
  "let's do this",
  "it's go time",
];

export class TypeRaceApp {
  private term: Terminal;
  private fitAddon: FitAddon;
  private renderer: TerminalRenderer;
  private connManager = createConnectionManager();
  private gameSubscription: GameSubscription | null = null;
  
  private state: AppState = {
    screen: 'loading',
    gameId: null,
    game: null,
    playerProgress: [],
    typedText: '',
    selectedMode: { tag: 'EnglishQuotes' } as GameMode,
    selectedGameType: 'Public',
    lobbyPhrase: STARTUP_PHRASES[Math.floor(Math.random() * STARTUP_PHRASES.length)],
    lobbyTypedText: '',
    isSearching: false,
    countdownValue: null,
  };

  constructor(container: HTMLElement) {
    this.term = new Terminal({
      cursorBlink: false,
      cursorStyle: 'block',
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      fontSize: 16,
      theme: {
        background: '#1a1a1a',
        foreground: '#e0e0e0',
        cursor: '#fbbf24',
        cursorAccent: '#1a1a1a',
        selectionBackground: '#fbbf2440',
      },
      allowProposedApi: true,
    });

    this.fitAddon = new FitAddon();
    this.term.loadAddon(this.fitAddon);
    this.term.open(container);
    this.fitAddon.fit();

    this.renderer = new TerminalRenderer(this.term);
    
    window.addEventListener('resize', () => {
      this.fitAddon.fit();
      this.renderer.updateDimensions();
      this.render();
    });

    this.term.onData((data) => this.handleInput(data));
  }

  async start() {
    this.render();
    
    try {
      const { waitForAuth } = await import('./firebase');
      const user = await waitForAuth();
      
      const conn = await this.connManager.connect(user);
      this.state.screen = 'lobby';
      this.render();
      
      void conn;
    } catch (error) {
      this.renderer.clear();
      this.renderer.centerText(this.renderer.rows / 2, 'Failed to connect. Please refresh.', COLORS.red);
    }
  }

  private handleInput(data: string) {
    if (this.state.screen === 'lobby') {
      this.handleLobbyInput(data);
    } else if (this.state.screen === 'game') {
      this.handleGameInput(data);
    }
  }

  private handleLobbyInput(data: string) {
    if (this.state.isSearching) return;

    const phrase = this.state.lobbyPhrase;
    
    for (const char of data) {
      if (char === '\x7f' || char === '\b') {
        if (this.state.lobbyTypedText.length > 0) {
          this.state.lobbyTypedText = this.state.lobbyTypedText.slice(0, -1);
        }
      } else if (char >= ' ' || char === '\r' || char === '\n') {
        const charToAdd = (char === '\r' || char === '\n') ? '' : char;
        if (charToAdd) {
          this.state.lobbyTypedText += charToAdd;
        }
        
        if (this.state.lobbyTypedText === phrase) {
          this.startGame();
          return;
        }
      }
    }
    
    this.render();
  }

  private handleGameInput(data: string) {
    const { game } = this.state;
    if (!game || !game.phrase) return;
    
    if (game.state?.tag !== 'Racing') return;
    
    const conn = this.connManager.conn;
    if (!conn) return;

    const phrase = game.phrase;
    
    for (const char of data) {
      if (char === '\x7f' || char === '\b') {
        if (this.state.typedText.length > 0) {
          let lastCompletedWordEnd = 0;
          for (let i = 0; i < this.state.typedText.length; i++) {
            if (this.state.typedText[i] !== phrase[i]) break;
            if (phrase[i] === ' ') lastCompletedWordEnd = i + 1;
          }
          
          if (this.state.typedText.length > lastCompletedWordEnd) {
            this.state.typedText = this.state.typedText.slice(0, -1);
            this.sendProgress(conn, 'Backspace');
          }
        }
      } else if (char >= ' ') {
        if (this.state.typedText.length < phrase.length) {
          const expectedChar = phrase[this.state.typedText.length];
          const eventType = char === expectedChar ? 'Correct' : 'Incorrect';
          this.state.typedText += char;
          this.sendProgress(conn, eventType);
        }
      }
    }
    
    this.render();
  }

  private sendProgress(conn: DbConnection, eventType: 'Correct' | 'Incorrect' | 'Backspace') {
    let correctCount = 0;
    const phrase = this.state.game?.phrase || '';
    
    for (let i = 0; i < this.state.typedText.length; i++) {
      if (this.state.typedText[i] === phrase[i]) {
        correctCount++;
      } else {
        break;
      }
    }

    conn.reducers.updateProgress({
      progressIndex: correctCount,
      characterEventType: { tag: eventType } as { tag: 'Correct' } | { tag: 'Incorrect' } | { tag: 'Backspace' }
    });
  }

  private startGame() {
    const conn = this.connManager.conn;
    if (!conn) return;

    this.state.isSearching = true;
    this.render();

    findGame(
      conn,
      this.state.selectedMode,
      this.state.selectedGameType,
      (gameId) => {
        this.state.gameId = gameId;
        this.state.screen = 'game';
        this.state.typedText = '';
        this.state.isSearching = false;
        this.subscribeToCurrentGame();
        this.render();
      }
    );
  }

  private subscribeToCurrentGame() {
    const conn = this.connManager.conn;
    if (!conn || !this.state.gameId) return;

    if (this.gameSubscription) {
      this.gameSubscription.unsubscribe();
    }

    this.gameSubscription = subscribeToGame(
      conn,
      this.state.gameId,
      (game, progress) => {
        const wasCountdown = this.state.game?.state?.tag === 'Countdown';
        const isRacing = game?.state?.tag === 'Racing';
        
        this.state.game = game;
        this.state.playerProgress = progress;
        
        if (wasCountdown && isRacing) {
          this.state.typedText = '';
        }
        
        this.render();
      }
    );
  }

  private render() {
    this.renderer.clear();
    this.renderer.hideCursor();

    switch (this.state.screen) {
      case 'loading':
        this.renderLoading();
        break;
      case 'lobby':
        this.renderLobby();
        break;
      case 'game':
        this.renderGame();
        break;
    }
  }

  private renderLoading() {
    this.renderHeader();
    this.renderer.centerText(Math.floor(this.renderer.rows / 2), 'Connecting...', COLORS.gray);
  }

  private renderHeader() {
    const title = 'Type' + COLORS.yellow + COLORS.bold + 'Race' + COLORS.reset + COLORS.gray + '.io' + COLORS.reset;
    this.renderer.writeAt(2, 1, title);
    this.renderer.writeAt(2, 2, BOX_CHARS.horizontal.repeat(this.renderer.cols - 4), COLORS.gray);
  }

  private renderLobby() {
    this.renderHeader();

    const boxWidth = Math.min(60, this.renderer.cols - 4);
    const boxHeight = 5;
    const boxX = Math.floor((this.renderer.cols - boxWidth) / 2);
    const boxY = Math.floor((this.renderer.rows - boxHeight) / 2) - 2;

    this.renderer.drawBox(boxX, boxY, boxWidth, boxHeight, 'Type to Start');

    const phrase = this.state.lobbyPhrase;
    const typed = this.state.lobbyTypedText;
    
    let displayText = '';
    for (let i = 0; i < phrase.length; i++) {
      if (i < typed.length) {
        if (typed[i] === phrase[i]) {
          displayText += COLORS.white + phrase[i];
        } else {
          displayText += COLORS.red + COLORS.underline + phrase[i];
        }
      } else if (i === typed.length) {
        displayText += COLORS.yellow + COLORS.bold + phrase[i];
      } else {
        displayText += COLORS.gray + phrase[i];
      }
    }
    displayText += COLORS.reset;

    const textX = boxX + Math.floor((boxWidth - phrase.length) / 2);
    const textY = boxY + 2;
    this.renderer.writeAt(textX, textY, displayText);

    if (this.state.isSearching) {
      this.renderer.centerText(boxY + boxHeight + 2, 'Finding game...', COLORS.yellow);
    }

    this.renderModeSelector(boxY + boxHeight + 4);
  }

  private renderModeSelector(startY: number) {
    const modes = [
      { label: 'Quotes', tag: 'EnglishQuotes' },
      { label: 'Words', tag: 'English500' },
    ];

    const gameTypes = ['Public', 'Practice', 'Private'] as const;

    let modeText = 'Mode: ';
    for (const mode of modes) {
      const isSelected = this.state.selectedMode.tag === mode.tag;
      if (isSelected) {
        modeText += COLORS.yellow + COLORS.bold + `[${mode.label}]` + COLORS.reset + '  ';
      } else {
        modeText += COLORS.gray + mode.label + COLORS.reset + '  ';
      }
    }
    this.renderer.centerText(startY, modeText);

    let typeText = 'Type: ';
    for (const type of gameTypes) {
      const isSelected = this.state.selectedGameType === type;
      if (isSelected) {
        typeText += COLORS.yellow + COLORS.bold + `[${type}]` + COLORS.reset + '  ';
      } else {
        typeText += COLORS.gray + type + COLORS.reset + '  ';
      }
    }
    this.renderer.centerText(startY + 1, typeText);

    this.renderer.centerText(startY + 3, 'Press TAB to change mode, SPACE for game type', COLORS.dim);
  }

  private renderGame() {
    this.renderHeader();

    const { game, playerProgress } = this.state;
    
    if (!game) {
      this.renderer.centerText(Math.floor(this.renderer.rows / 2), 'Loading game...', COLORS.gray);
      return;
    }

    const conn = this.connManager.conn;
    const currentPlayerId = conn?.identity;

    let startY = 4;
    const maxPlayers = game.gameType?.tag === 'Practice' ? 1 : 3;
    
    for (let i = 0; i < maxPlayers; i++) {
      const pp = playerProgress[i];
      const isCurrentPlayer = !!(pp && currentPlayerId && pp.playerId.isEqual(currentPlayerId));
      
      this.renderPlayerProgressBar(2, startY, pp, game.phrase.length, isCurrentPlayer);
      startY += 3;
    }

    if (game.state?.tag === 'Lobby') {
      this.renderer.centerText(startY + 2, 'Waiting for players...', COLORS.yellow);
    } else if (game.state?.tag === 'Countdown') {
      const countdownVal = game.countdownStartedAt 
        ? Math.max(0, 3 - Math.floor((Date.now() - Number(game.countdownStartedAt)) / 1000))
        : 3;
      this.renderer.centerText(startY + 2, `Starting in ${countdownVal}...`, COLORS.yellow + COLORS.bold);
    } else if (game.state?.tag === 'Racing') {
      const currentPlayerProgress = playerProgress.find(
        (pp) => currentPlayerId && pp.playerId.isEqual(currentPlayerId)
      );
      const hasFinished = currentPlayerProgress && currentPlayerProgress.progressIndex >= game.phrase.length;
      
      if (hasFinished) {
        this.renderResults(startY + 2);
      } else {
        this.renderTypeBox(startY + 2, game.phrase);
      }
    } else if (game.state?.tag === 'Archived') {
      this.renderResults(startY + 2);
    }
  }

  private renderPlayerProgressBar(
    x: number, 
    y: number, 
    pp: PlayerProgress | undefined, 
    phraseLength: number,
    isCurrentPlayer: boolean
  ) {
    const width = this.renderer.cols - 4;
    
    this.renderer.drawBox(x, y, width, 2);
    
    if (!pp) {
      this.renderer.writeAt(x + 2, y + 1, 'Waiting for player...', COLORS.gray + COLORS.italic);
      return;
    }

    const nameColor = isCurrentPlayer ? COLORS.yellow : COLORS.white;
    const name = pp.playerName || 'Anonymous';
    const level = `Lv${pp.playerLevel}`;
    const wpm = pp.wpm ? `${pp.wpm} WPM` : '';
    const placement = pp.placement ? `#${pp.placement}` : '';
    
    const progress = phraseLength > 0 ? pp.progressIndex / phraseLength : 0;
    const barWidth = Math.floor((width - 30) * progress);
    const emptyWidth = width - 30 - barWidth;
    
    const progressBar = '█'.repeat(barWidth) + '░'.repeat(emptyWidth);
    
    const info = `${COLORS.gray}${level}${COLORS.reset} ${nameColor}${name}${COLORS.reset}`;
    this.renderer.writeAt(x + 2, y + 1, info);
    
    this.renderer.writeAt(x + 20, y + 1, progressBar, isCurrentPlayer ? COLORS.yellow : COLORS.green);
    
    if (wpm) {
      this.renderer.writeAt(width - 10, y + 1, wpm, COLORS.cyan);
    }
    if (placement) {
      this.renderer.writeAt(width - 4, y + 1, placement, COLORS.magenta + COLORS.bold);
    }
  }

  private renderTypeBox(startY: number, phrase: string) {
    const boxWidth = this.renderer.cols - 4;
    const wrappedLines = this.renderer.wrapText(phrase, boxWidth - 4);
    const boxHeight = Math.max(5, wrappedLines.length + 2);
    
    this.renderer.drawBox(2, startY, boxWidth, boxHeight);

    const typed = this.state.typedText;
    let charIndex = 0;

    for (let lineIdx = 0; lineIdx < wrappedLines.length; lineIdx++) {
      const line = wrappedLines[lineIdx];
      let displayLine = '';
      
      for (let i = 0; i < line.length; i++) {
        const globalIdx = charIndex + i;
        const char = line[i];
        
        if (globalIdx < typed.length) {
          if (typed[globalIdx] === phrase[globalIdx]) {
            displayLine += COLORS.dim + char;
          } else {
            displayLine += COLORS.red + COLORS.underline + char;
          }
        } else if (globalIdx === typed.length) {
          displayLine += COLORS.yellow + COLORS.bold + char;
        } else {
          displayLine += COLORS.gray + char;
        }
      }
      displayLine += COLORS.reset;
      
      this.renderer.writeAt(4, startY + 1 + lineIdx, displayLine);
      charIndex += line.length;
      
      if (lineIdx < wrappedLines.length - 1 && phrase[charIndex] === ' ') {
        charIndex++;
      }
    }
  }

  private renderResults(startY: number) {
    this.renderer.centerText(startY, '🏁 Race Complete! 🏁', COLORS.yellow + COLORS.bold);
    
    const sortedProgress = [...this.state.playerProgress].sort((a, b) => 
      (a.placement || 999) - (b.placement || 999)
    );

    startY += 2;
    for (const pp of sortedProgress) {
      const placement = pp.placement ? `#${pp.placement}` : '';
      const wpm = pp.wpm ? `${pp.wpm} WPM` : '';
      const line = `${placement} ${pp.playerName} - ${wpm}`;
      this.renderer.centerText(startY, line, COLORS.white);
      startY++;
    }

    startY += 2;
    this.renderer.centerText(startY, 'Press ENTER for new game, ESC for lobby', COLORS.dim);
  }
}
