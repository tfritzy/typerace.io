import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT, PIXEL_FONT } from "./constants";
import { getItemDisplay, getItemConfig, type Item } from "./itemConfig";
import { CELL_SIZE, GRID_PADDING, BORDER_WIDTH, type InventoryItem, type InventoryState } from "./inventoryState";
import { getState, getRelicPosition } from "./state";
import type { GameState } from "./state";

const BG_COLOR = "rgba(17, 17, 34, 0.92)";
const BORDER_COLOR = "#8b7355";
const CELL_BG_COLOR = "rgba(21, 21, 42, 0.5)";
const CELL_LINE_COLOR = "#2a2a3e";
const ITEM_BG_COLOR = "rgba(37, 37, 69, 0.8)";
const ITEM_BORDER_COLOR = "#4a4a7e";
const VALID_COLOR = "rgba(74, 222, 128, 0.3)";
const INVALID_COLOR = "rgba(239, 68, 68, 0.3)";
const MERCHANT_TITLE_BG = "rgba(17, 17, 34, 0.95)";
const MERCHANT_TITLE_BORDER = "#66ff88";
const MERCHANT_TITLE_COLOR = "#66ff88";

interface DragState {
  sourceInventory: InventoryState;
  slot: InventoryItem;
  originalCol: number;
  originalRow: number;
  ghostX: number;
  ghostY: number;
  offsetX: number;
  offsetY: number;
}

function gridWidth(cols: number): number {
  return cols * CELL_SIZE + GRID_PADDING * 2 + BORDER_WIDTH * 2;
}

function gridHeight(rows: number): number {
  return rows * CELL_SIZE + GRID_PADDING * 2 + BORDER_WIDTH * 2;
}

interface InventoryGridProps {
  inventory: InventoryState;
  scale: number;
  left: number;
  top: number;
  leftPct: number;
  topPct: number;
  getTextureUrl: (alias: string) => string;
  dragState: DragState | null;
  onDragStart: (inv: InventoryState, slot: InventoryItem, e: React.PointerEvent) => void;
  pointerPos: { x: number; y: number } | null;
  visible?: boolean;
}

const InventoryGrid = ({
  inventory,
  scale,
  left,
  top,
  leftPct,
  topPct,
  getTextureUrl,
  dragState,
  onDragStart,
  pointerPos,
  visible = true,
}: InventoryGridProps) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return inventory.onChange(() => setTick((t) => t + 1));
  }, [inventory]);

  if (!visible) return null;

  const totalW = gridWidth(inventory.cols);
  const totalH = gridHeight(inventory.rows);
  const items = inventory.getItems();

  let highlightCol = -1;
  let highlightRow = -1;
  let highlightValid = false;

  if (dragState && pointerPos) {
    const localX = (pointerPos.x - left) / scale;
    const localY = (pointerPos.y - top) / scale;
    const gridX = GRID_PADDING + BORDER_WIDTH;
    const gridY = GRID_PADDING + BORDER_WIDTH;
    const col = Math.floor((localX - gridX) / CELL_SIZE);
    const row = Math.floor((localY - gridY) / CELL_SIZE);
    if (col >= 0 && col < inventory.cols && row >= 0 && row < inventory.rows) {
      highlightCol = col;
      highlightRow = row;
      highlightValid = inventory.canPlace(col, row);
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: totalW * scale,
        height: totalH * scale,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          width: totalW,
          height: totalH,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          background: BG_COLOR,
          border: `${BORDER_WIDTH}px solid ${BORDER_COLOR}`,
          borderRadius: 4,
          padding: GRID_PADDING,
          boxSizing: "border-box",
          position: "relative",
          imageRendering: "pixelated",
        }}
      >
        {Array.from({ length: inventory.rows }, (_, r) =>
          Array.from({ length: inventory.cols }, (_, c) => {
            const isHighlight = highlightCol === c && highlightRow === r;
            return (
              <div
                key={`${r}-${c}`}
                style={{
                  position: "absolute",
                  left: GRID_PADDING + c * CELL_SIZE - BORDER_WIDTH,
                  top: GRID_PADDING + r * CELL_SIZE - BORDER_WIDTH,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  background: isHighlight
                    ? highlightValid
                      ? VALID_COLOR
                      : INVALID_COLOR
                    : CELL_BG_COLOR,
                  border: `1px solid ${CELL_LINE_COLOR}`,
                  boxSizing: "border-box",
                }}
              />
            );
          })
        )}

        {items.map((slot) => {
          if (!slot.item) return null;
          const isDragging =
            dragState &&
            dragState.sourceInventory === inventory &&
            dragState.slot.id === slot.id;
          if (isDragging) return null;

          return (
            <ItemCell
              key={slot.id}
              slot={slot}
              left={GRID_PADDING + slot.gridX * CELL_SIZE - BORDER_WIDTH}
              top={GRID_PADDING + slot.gridY * CELL_SIZE - BORDER_WIDTH}
              getTextureUrl={getTextureUrl}
              onPointerDown={(e) => onDragStart(inventory, slot, e)}
            />
          );
        })}
      </div>
    </div>
  );
};

interface ItemCellProps {
  slot: InventoryItem;
  left: number;
  top: number;
  getTextureUrl: (alias: string) => string;
  onPointerDown?: (e: React.PointerEvent) => void;
  opacity?: number;
}

const ItemCell = ({
  slot,
  left,
  top,
  getTextureUrl,
  onPointerDown,
  opacity = 1,
}: ItemCellProps) => {
  if (!slot.item) return null;

  const config = getItemConfig(slot.item.type);
  const display = getItemDisplay(slot.item.type);
  const textureUrl = getTextureUrl(display);

  return (
    <div
      onPointerDown={onPointerDown}
      style={{
        position: "absolute",
        left,
        top,
        width: CELL_SIZE,
        height: CELL_SIZE,
        cursor: "grab",
        opacity,
        touchAction: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 2,
          background: ITEM_BG_COLOR,
          border: `1px solid ${ITEM_BORDER_COLOR}`,
          borderRadius: 3,
        }}
      />
      <img
        src={textureUrl}
        draggable={false}
        style={{
          position: "absolute",
          left: 4,
          top: 4,
          width: CELL_SIZE - 8,
          height: CELL_SIZE - 8,
          imageRendering: "pixelated",
          pointerEvents: "none",
        }}
      />
      {config.stackable && slot.item.amount > 1 && (
        <span
          style={{
            position: "absolute",
            right: 6,
            bottom: 4,
            fontFamily: PIXEL_FONT,
            fontSize: 10,
            color: "#ffffff",
            WebkitTextStroke: "2px #000",
            paintOrder: "stroke fill",
            pointerEvents: "none",
          }}
        >
          {slot.item.amount}
        </span>
      )}
      {slot.item.price != null && (
        <div
          style={{
            position: "absolute",
            left: 2,
            bottom: 2,
            width: CELL_SIZE - 4,
            height: 16,
            background: "rgba(0, 0, 0, 0.8)",
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            paddingLeft: 4,
          }}
        >
          <span
            style={{
              fontFamily: PIXEL_FONT,
              fontSize: 8,
              color: "#ffd700",
              pointerEvents: "none",
            }}
          >
            {slot.item.price}g
          </span>
        </div>
      )}
    </div>
  );
};

interface InventoryPosition {
  inventory: InventoryState;
  canvasX: number;
  canvasY: number;
  label?: string;
}

export const InventoryOverlay = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [, setTick] = useState(0);
  const [visible, setVisible] = useState(true);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<DragState | null>(null);

  useLayoutEffect(() => {
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    const resizeObserver = new ResizeObserver(() => setTick((t) => t + 1));
    resizeObserver.observe(overlay);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const state = getState();
    const unsubs: Array<() => void> = [];

    const refresh = () => setTick((t) => t + 1);

    unsubs.push(state.playerInventory.onChange(refresh));
    for (const ws of state.weaponSlots) {
      unsubs.push(ws.onChange(refresh));
    }

    unsubs.push(state.onMerchantChanged.subscribe(() => {
      setTick((t) => t + 1);
    }));

    unsubs.push(state.onWaveActiveChanged.subscribe(() => {
      setVisible(!state.waveActive);
    }));

    return () => {
      for (const u of unsubs) u();
    };
  }, []);

  const getTextureUrl = useCallback(
    (alias: string): string => {
      const state = getState();
      return state.itemTextureUrls[alias] ?? "";
    },
    []
  );

  const getScale = useCallback((): number => {
    const overlay = overlayRef.current;
    if (!overlay) return 1;
    return overlay.clientWidth / CANVAS_WIDTH;
  }, []);

  const onDragStart = useCallback(
    (inv: InventoryState, slot: InventoryItem, e: React.PointerEvent) => {
      if (!slot.item) return;
      inv.beginItemDrag(slot.id);

      const overlay = overlayRef.current;
      if (!overlay) return;
      const rect = overlay.getBoundingClientRect();

      const state: DragState = {
        sourceInventory: inv,
        slot,
        originalCol: slot.gridX,
        originalRow: slot.gridY,
        ghostX: e.clientX - rect.left,
        ghostY: e.clientY - rect.top,
        offsetX: 0,
        offsetY: 0,
      };
      dragRef.current = state;
      setDragState(state);
      setPointerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    []
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const overlay = overlayRef.current;
      if (!overlay) return;
      const rect = overlay.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      dragRef.current.ghostX = x;
      dragRef.current.ghostY = y;
      setDragState({ ...dragRef.current });
      setPointerPos({ x, y });
    };

    const onUp = (e: PointerEvent) => {
      const ds = dragRef.current;
      if (!ds) return;
      const state = getState();
      const overlay = overlayRef.current;
      if (!overlay) {
        ds.sourceInventory.cancelItemDrag(ds.slot.id);
        dragRef.current = null;
        setDragState(null);
        setPointerPos(null);
        return;
      }

      const rect = overlay.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const scale = getScale();
      const positions = getPositions(state);

      let placed = false;
      for (let i = positions.length - 1; i >= 0; i--) {
        const pos = positions[i];
        const inv = pos.inventory;
        const invLeft = (pos.canvasX / CANVAS_WIDTH) * overlay.clientWidth;
        const invTop = (pos.canvasY / CANVAS_HEIGHT) * overlay.clientHeight;

        const localX = (px - invLeft) / scale;
        const localY = (py - invTop) / scale;
        const gridOffX = GRID_PADDING + BORDER_WIDTH;
        const gridOffY = GRID_PADDING + BORDER_WIDTH;
        const col = Math.floor((localX - gridOffX) / CELL_SIZE);
        const row = Math.floor((localY - gridOffY) / CELL_SIZE);

        if (!inv.canPlace(col, row)) continue;

        if (inv === ds.sourceInventory) {
          inv.endItemDrag(ds.slot.id, col, row);
        } else if (ds.slot.item) {
          if (ds.slot.item.price != null && ds.slot.item.price > 0) {
            if (!state.playerInventory.deductGold(ds.slot.item.price)) {
              ds.sourceInventory.cancelItemDrag(ds.slot.id);
              dragRef.current = null;
              setDragState(null);
              setPointerPos(null);
              return;
            }
          }
          ds.sourceInventory.removeItem(ds.slot.id);
          const purchased: Item = { type: ds.slot.item.type, amount: ds.slot.item.amount };
          inv.addItem(purchased, col, row);
        }

        placed = true;
        break;
      }

      if (!placed) {
        ds.sourceInventory.cancelItemDrag(ds.slot.id);
      }

      dragRef.current = null;
      setDragState(null);
      setPointerPos(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [getScale]);

  if (!visible) return null;

  const state = getState();
  const overlay = overlayRef.current;
  const scale = overlay ? overlay.clientWidth / CANVAS_WIDTH : 1;
  const positions = getPositions(state);

  return (
    <div
      ref={overlayRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        fontFamily: PIXEL_FONT,
      }}
    >
      {positions.map((pos) => {
        const leftPct = (pos.canvasX / CANVAS_WIDTH) * 100;
        const topPct = (pos.canvasY / CANVAS_HEIGHT) * 100;
        const invLeft = overlay
          ? (pos.canvasX / CANVAS_WIDTH) * overlay.clientWidth
          : 0;
        const invTop = overlay
          ? (pos.canvasY / CANVAS_HEIGHT) * overlay.clientHeight
          : 0;

        return (
          <div key={pos.inventory.slot}>
            {pos.label && (
              <div
                style={{
                  position: "absolute",
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  width: gridWidth(pos.inventory.cols) * scale,
                  height: 26 * scale,
                  background: MERCHANT_TITLE_BG,
                  border: `${2 * scale}px solid ${MERCHANT_TITLE_BORDER}`,
                  borderRadius: 4 * scale,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 8 * scale,
                  boxSizing: "border-box",
                  pointerEvents: "none",
                  transform: `translateY(${-30 * scale}px)`,
                }}
              >
                <span
                  style={{
                    fontSize: 10 * scale,
                    color: MERCHANT_TITLE_COLOR,
                    fontFamily: PIXEL_FONT,
                  }}
                >
                  {pos.label}
                </span>
              </div>
            )}
            <InventoryGrid
              inventory={pos.inventory}
              scale={scale}
              left={invLeft}
              top={invTop}
              leftPct={leftPct}
              topPct={topPct}
              getTextureUrl={getTextureUrl}
              dragState={dragState}
              onDragStart={onDragStart}
              pointerPos={pointerPos}
            />
          </div>
        );
      })}

      {dragState && dragState.slot.item && (
        <div
          style={{
            position: "absolute",
            left: dragState.ghostX - (CELL_SIZE * scale) / 2,
            top: dragState.ghostY - (CELL_SIZE * scale) / 2,
            width: CELL_SIZE * scale,
            height: CELL_SIZE * scale,
            pointerEvents: "none",
            opacity: 0.8,
            zIndex: 100,
          }}
        >
          <div
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              transformOrigin: "top left",
              transform: `scale(${scale})`,
              imageRendering: "pixelated",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 2,
                background: ITEM_BG_COLOR,
                border: `1px solid ${ITEM_BORDER_COLOR}`,
                borderRadius: 3,
              }}
            />
            <img
              src={getTextureUrl(getItemDisplay(dragState.slot.item.type))}
              draggable={false}
              style={{
                position: "absolute",
                left: 4,
                top: 4,
                width: CELL_SIZE - 8,
                height: CELL_SIZE - 8,
                imageRendering: "pixelated",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

function getPositions(state: GameState): InventoryPosition[] {
  const positions: InventoryPosition[] = [];

  const playerInv = state.playerInventory;
  const playerW = gridWidth(playerInv.cols);
  const playerH = gridHeight(playerInv.rows);
  const playerX = (CANVAS_WIDTH - playerW) / 2;
  const playerY = CANVAS_HEIGHT - playerH - 20;
  positions.push({ inventory: playerInv, canvasX: playerX, canvasY: playerY });

  for (const ws of state.weaponSlots) {
    if (!ws.slot.startsWith("weapon-")) continue;
    const idx = parseInt(ws.slot.replace("weapon-", ""), 10);
    if (Number.isNaN(idx)) continue;
    const relicPos = getRelicPosition(state.relicSlots[idx]);
    const offset = GRID_PADDING + BORDER_WIDTH + CELL_SIZE / 2;
    positions.push({
      inventory: ws,
      canvasX: relicPos.x - offset,
      canvasY: relicPos.y - offset,
    });
  }

  const merchantInv = state.activeMerchantInventory;
  if (merchantInv) {
    const merchantW = gridWidth(merchantInv.cols);
    const merchantH = gridHeight(merchantInv.rows);
    const merchantX = (CANVAS_WIDTH - merchantW) / 2;
    const merchantY = playerY - merchantH - 40;
    positions.push({
      inventory: merchantInv,
      canvasX: merchantX,
      canvasY: merchantY,
      label: "Merchant",
    });
  }

  return positions;
}
