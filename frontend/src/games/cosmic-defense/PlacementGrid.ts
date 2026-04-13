import { Container, Graphics, Sprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { GRID_CELL, type ShipBlueprint } from "./shipCatalog";
import { PLANET_X } from "./state";

const GRID_LINE_COLOR = 0xffffff;
const GRID_LINE_ALPHA = 0.08;
const OCCUPIED_COLOR = 0xffffff;
const OCCUPIED_ALPHA = 0.15;
const VALID_COLOR = 0x4ade80;
const VALID_ALPHA = 0.25;
const INVALID_COLOR = 0xef4444;
const INVALID_ALPHA = 0.35;

const GRID_COLS = Math.floor(CANVAS_WIDTH / GRID_CELL);
const GRID_ROWS = Math.floor(CANVAS_HEIGHT / GRID_CELL);

const MIN_PLACE_COL = Math.ceil((PLANET_X + 80) / GRID_CELL);

export interface PlacedShip {
  blueprint: ShipBlueprint;
  gridCol: number;
  gridRow: number;
}

export class PlacementGrid {
  readonly layer: Container;

  private gridLines: Graphics;
  private occupiedOverlay: Graphics;
  private previewContainer: Container;
  private previewSprite: Sprite | null = null;
  private previewCells: Graphics;

  private occupied: boolean[][] = [];
  private placedShips: PlacedShip[] = [];

  private activeBlueprint: ShipBlueprint | null = null;
  private cursorCol = -1;
  private cursorRow = -1;
  private assets: AssetManager;

  private interactionArea: Graphics;

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
    this.layer.visible = false;
    this.layer.sortableChildren = true;

    for (let r = 0; r < GRID_ROWS; r++) {
      this.occupied[r] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        this.occupied[r][c] = false;
      }
    }

    this.gridLines = new Graphics();
    this.gridLines.zIndex = 0;
    this.layer.addChild(this.gridLines);
    this.drawGridLines();

    this.occupiedOverlay = new Graphics();
    this.occupiedOverlay.zIndex = 1;
    this.layer.addChild(this.occupiedOverlay);

    this.previewCells = new Graphics();
    this.previewCells.zIndex = 2;
    this.layer.addChild(this.previewCells);

    this.previewContainer = new Container();
    this.previewContainer.zIndex = 3;
    this.layer.addChild(this.previewContainer);

    this.interactionArea = new Graphics();
    this.interactionArea.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.interactionArea.fill({ color: 0x000000, alpha: 0.001 });
    this.interactionArea.zIndex = 10;
    this.interactionArea.eventMode = "static";
    this.interactionArea.cursor = "crosshair";
    this.interactionArea.on("pointermove", (e) => this.onPointerMove(e));
    this.interactionArea.on("pointerdown", (e) => this.onPointerDown(e));
    this.layer.addChild(this.interactionArea);
  }

  private drawGridLines(): void {
    this.gridLines.clear();

    for (let c = 0; c <= GRID_COLS; c++) {
      const x = c * GRID_CELL;
      this.gridLines.moveTo(x, 0);
      this.gridLines.lineTo(x, CANVAS_HEIGHT);
    }
    for (let r = 0; r <= GRID_ROWS; r++) {
      const y = r * GRID_CELL;
      this.gridLines.moveTo(0, y);
      this.gridLines.lineTo(CANVAS_WIDTH, y);
    }
    this.gridLines.stroke({ color: GRID_LINE_COLOR, alpha: GRID_LINE_ALPHA, width: 1 });
  }

  private drawOccupied(): void {
    this.occupiedOverlay.clear();
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (this.occupied[r][c]) {
          this.occupiedOverlay.rect(c * GRID_CELL, r * GRID_CELL, GRID_CELL, GRID_CELL);
        }
      }
    }
    this.occupiedOverlay.fill({ color: OCCUPIED_COLOR, alpha: OCCUPIED_ALPHA });
  }

  startPlacement(blueprint: ShipBlueprint): void {
    this.activeBlueprint = blueprint;
    this.layer.visible = true;
    this.cursorCol = -1;
    this.cursorRow = -1;

    this.drawOccupied();

    if (this.previewSprite) {
      this.previewSprite.destroy();
    }

    const tex = this.assets.getShipTexture(blueprint.entityType, blueprint.colorPreset);
    this.previewSprite = new Sprite(tex);
    this.previewSprite.anchor.set(0.5);
    this.previewSprite.scale.set(3);
    this.previewSprite.alpha = 0.7;
    this.previewContainer.addChild(this.previewSprite);

    this.previewCells.clear();
  }

  hide(): void {
    this.layer.visible = false;
    this.activeBlueprint = null;
    if (this.previewSprite) {
      this.previewSprite.destroy();
      this.previewSprite = null;
    }
    this.previewCells.clear();
  }

  private canPlace(col: number, row: number, occ: boolean[][]): boolean {
    for (let r = 0; r < occ.length; r++) {
      for (let c = 0; c < occ[r].length; c++) {
        if (!occ[r][c]) continue;
        const globalCol = col + c;
        const globalRow = row + r;
        if (globalCol < MIN_PLACE_COL || globalCol >= GRID_COLS || globalRow < 0 || globalRow >= GRID_ROWS) return false;
        if (this.occupied[globalRow][globalCol]) return false;
      }
    }
    return true;
  }

  private markOccupied(col: number, row: number, occ: boolean[][]): void {
    for (let r = 0; r < occ.length; r++) {
      for (let c = 0; c < occ[r].length; c++) {
        if (!occ[r][c]) continue;
        this.occupied[row + r][col + c] = true;
      }
    }
  }

  private onPointerMove(e: { global: { x: number; y: number } }): void {
    if (!this.activeBlueprint) return;

    const local = this.layer.toLocal(e.global);
    const occ = this.activeBlueprint.occupancy;
    const occupancyWidth = occ[0].length;
    const occupancyHeight = occ.length;

    const col = Math.floor(local.x / GRID_CELL) - Math.floor(occupancyWidth / 2);
    const row = Math.floor(local.y / GRID_CELL) - Math.floor(occupancyHeight / 2);

    if (col === this.cursorCol && row === this.cursorRow) return;
    this.cursorCol = col;
    this.cursorRow = row;

    const valid = this.canPlace(col, row, occ);

    this.previewCells.clear();
    for (let r = 0; r < occupancyHeight; r++) {
      for (let c = 0; c < occupancyWidth; c++) {
        if (!occ[r][c]) continue;
        const cx = (col + c) * GRID_CELL;
        const cy = (row + r) * GRID_CELL;
        this.previewCells.rect(cx, cy, GRID_CELL, GRID_CELL);
      }
    }
    const fillColor = valid ? VALID_COLOR : INVALID_COLOR;
    const fillAlpha = valid ? VALID_ALPHA : INVALID_ALPHA;
    this.previewCells.fill({ color: fillColor, alpha: fillAlpha });

    if (this.previewSprite) {
      const centerX = (col + occupancyWidth / 2) * GRID_CELL;
      const centerY = (row + occupancyHeight / 2) * GRID_CELL;
      this.previewSprite.x = centerX;
      this.previewSprite.y = centerY;
    }
  }

  private onPlaced: ((ship: PlacedShip) => void) | null = null;

  onShipPlaced(cb: (ship: PlacedShip) => void): void {
    this.onPlaced = cb;
  }

  private onCancelled: (() => void) | null = null;

  onPlacementCancelled(cb: () => void): void {
    this.onCancelled = cb;
  }

  private onPointerDown(e: { button: number }): void {
    if (!this.activeBlueprint) return;

    if (e.button === 2) {
      this.hide();
      this.onCancelled?.();
      return;
    }

    const occ = this.activeBlueprint.occupancy;
    if (!this.canPlace(this.cursorCol, this.cursorRow, occ)) return;

    this.markOccupied(this.cursorCol, this.cursorRow, occ);

    const placed: PlacedShip = {
      blueprint: this.activeBlueprint,
      gridCol: this.cursorCol,
      gridRow: this.cursorRow,
    };
    this.placedShips.push(placed);

    this.hide();
    this.onPlaced?.(placed);
  }

  getPlacedShips(): PlacedShip[] {
    return this.placedShips;
  }

  destroy(): void {
    this.layer.destroy();
  }
}
