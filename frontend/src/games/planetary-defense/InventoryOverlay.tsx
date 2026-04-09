import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { CANVAS_WIDTH, CANVAS_HEIGHT, PIXEL_FONT } from "./constants";
import { getItemConfig, type Item, type ItemType } from "./itemConfig";
import { CELL_SIZE, GRID_PADDING, BORDER_WIDTH, type InventoryItem, type InventoryState } from "./inventoryState";
import { getState, getRelicPosition, onStateCreated } from "./state";
import type { GameState, RelicSlot } from "./state";
import { getItemTextureInfo } from "./itemTextures";
import { RELIC_SLOT_COUNT, RELIC_CONFIGS, type RelicType } from "./relicConfig";

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

type DragSource =
  | { kind: "inventory"; inventory: InventoryState; slot: InventoryItem; originalCol: number; originalRow: number }
  | { kind: "relic"; slotIndex: number; item: Item };

interface DragState {
  source: DragSource;
  item: Item;
  ghostX: number;
  ghostY: number;
}

function gridWidth(cols: number): number {
  return cols * CELL_SIZE + GRID_PADDING * 2 + BORDER_WIDTH * 2;
}

function gridHeight(rows: number): number {
  return rows * CELL_SIZE + GRID_PADDING * 2 + BORDER_WIDTH * 2;
}

const ItemSprite = ({ itemType, size }: { itemType: ItemType; size: number }) => {
  const textureInfo = getItemTextureInfo(itemType);
  if (textureInfo.backgroundPosition) {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundImage: `url(${textureInfo.src})`,
          backgroundPosition: textureInfo.backgroundPosition,
          backgroundSize: textureInfo.backgroundSize,
          backgroundRepeat: "no-repeat",
          imageRendering: "pixelated",
          pointerEvents: "none",
        }}
      />
    );
  }
  return (
    <img
      src={textureInfo.src}
      draggable={false}
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
        pointerEvents: "none",
      }}
    />
  );
};

interface InventoryGridProps {
  inventory: InventoryState;
  scale: number;
  left: number;
  top: number;
  leftPct: number;
  topPct: number;
  dragState: DragState | null;
  onDragStartFromInventory: (inv: InventoryState, slot: InventoryItem, e: React.PointerEvent) => void;
  pointerPos: { x: number; y: number } | null;
}

const InventoryGrid = ({
  inventory,
  scale,
  left,
  top,
  leftPct,
  topPct,
  dragState,
  onDragStartFromInventory,
  pointerPos,
}: InventoryGridProps) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return inventory.onChange(() => setTick((t) => t + 1));
  }, [inventory]);

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
            dragState?.source.kind === "inventory" &&
            dragState.source.inventory === inventory &&
            dragState.source.slot.id === slot.id;
          if (isDragging) return null;

          return (
            <div
              key={slot.id}
              onPointerDown={(e) => onDragStartFromInventory(inventory, slot, e)}
              style={{
                position: "absolute",
                left: GRID_PADDING + slot.gridX * CELL_SIZE - BORDER_WIDTH,
                top: GRID_PADDING + slot.gridY * CELL_SIZE - BORDER_WIDTH,
                width: CELL_SIZE,
                height: CELL_SIZE,
                cursor: "grab",
                touchAction: "none",
              }}
            >
              <div style={{ position: "absolute", inset: 2, background: ITEM_BG_COLOR, border: `1px solid ${ITEM_BORDER_COLOR}`, borderRadius: 3 }} />
              <div style={{ position: "absolute", left: 4, top: 4 }}>
                <ItemSprite itemType={slot.item.type} size={CELL_SIZE - 8} />
              </div>
              {getItemConfig(slot.item.type).stackable && slot.item.amount > 1 && (
                <span
                  style={{
                    position: "absolute", right: 6, bottom: 4,
                    fontFamily: PIXEL_FONT, fontSize: 10, color: "#ffffff",
                    WebkitTextStroke: "2px #000", paintOrder: "stroke fill",
                    pointerEvents: "none",
                  }}
                >
                  {slot.item.amount}
                </span>
              )}
              {slot.item.price != null && (
                <div
                  style={{
                    position: "absolute", left: 2, bottom: 2,
                    width: CELL_SIZE - 4, height: 16,
                    background: "rgba(0, 0, 0, 0.8)", borderRadius: 3,
                    display: "flex", alignItems: "center", paddingLeft: 4,
                  }}
                >
                  <span style={{ fontFamily: PIXEL_FONT, fontSize: 8, color: "#ffd700", pointerEvents: "none" }}>
                    {slot.item.price}g
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface RelicSlotCellProps {
  slotIndex: number;
  relicSlot: RelicSlot;
  scale: number;
  overlay: HTMLDivElement;
  dragState: DragState | null;
  onDragStartFromRelic: (slotIndex: number, item: Item, e: React.PointerEvent) => void;
  pointerPos: { x: number; y: number } | null;
}

const RelicSlotCell = ({
  slotIndex,
  relicSlot,
  scale,
  overlay,
  dragState,
  onDragStartFromRelic,
  pointerPos,
}: RelicSlotCellProps) => {
  const pos = getRelicPosition(relicSlot);
  const offset = GRID_PADDING + BORDER_WIDTH + CELL_SIZE / 2;
  const canvasX = pos.x - offset;
  const canvasY = pos.y - offset;
  const leftPct = (canvasX / CANVAS_WIDTH) * 100;
  const topPct = (canvasY / CANVAS_HEIGHT) * 100;
  const totalW = gridWidth(1);
  const totalH = gridHeight(1);

  const isDragging =
    dragState?.source.kind === "relic" &&
    dragState.source.slotIndex === slotIndex;

  const isDropTarget = dragState && !relicSlot.relic && !isDragging;
  let isHovered = false;
  if (isDropTarget && pointerPos) {
    const slotLeft = (canvasX / CANVAS_WIDTH) * overlay.clientWidth;
    const slotTop = (canvasY / CANVAS_HEIGHT) * overlay.clientHeight;
    const localX = pointerPos.x - slotLeft;
    const localY = pointerPos.y - slotTop;
    isHovered = localX >= 0 && localX < totalW * scale && localY >= 0 && localY < totalH * scale;
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
        <div
          style={{
            position: "absolute",
            left: GRID_PADDING - BORDER_WIDTH,
            top: GRID_PADDING - BORDER_WIDTH,
            width: CELL_SIZE,
            height: CELL_SIZE,
            background: isHovered ? VALID_COLOR : CELL_BG_COLOR,
            border: `1px solid ${CELL_LINE_COLOR}`,
            boxSizing: "border-box",
          }}
        />

        {relicSlot.relic && !isDragging && (
          <div
            onPointerDown={(e) => {
              if (relicSlot.relic) {
                onDragStartFromRelic(slotIndex, relicSlot.relic.item, e);
              }
            }}
            style={{
              position: "absolute",
              left: GRID_PADDING - BORDER_WIDTH,
              top: GRID_PADDING - BORDER_WIDTH,
              width: CELL_SIZE,
              height: CELL_SIZE,
              cursor: "grab",
              touchAction: "none",
            }}
          >
            <div style={{ position: "absolute", inset: 2, background: ITEM_BG_COLOR, border: `1px solid ${ITEM_BORDER_COLOR}`, borderRadius: 3 }} />
            <div style={{ position: "absolute", left: 4, top: 4 }}>
              <ItemSprite itemType={relicSlot.relic.item.type} size={CELL_SIZE - 8} />
            </div>
          </div>
        )}
      </div>
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
  const [visible, setVisible] = useState(() => {
    const state = getState();
    return state ? !state.waveActive : true;
  });
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
    const unsubs: Array<() => void> = [];

    const setup = () => {
      const state = getState();
      if (!state) return;

      const refresh = () => setTick((t) => t + 1);
      refresh();

      unsubs.push(state.playerInventory.onChange(refresh));
      unsubs.push(state.onMerchantChanged.subscribe(refresh));

      unsubs.push(state.onWaveActiveChanged.subscribe(() => {
        setVisible(!state.waveActive);
      }));
    };

    unsubs.push(onStateCreated(setup));

    return () => {
      for (const u of unsubs) u();
    };
  }, []);

  const getScale = useCallback((): number => {
    const overlay = overlayRef.current;
    if (!overlay) return 1;
    return overlay.clientWidth / CANVAS_WIDTH;
  }, []);

  const onDragStartFromInventory = useCallback(
    (inv: InventoryState, slot: InventoryItem, e: React.PointerEvent) => {
      if (!slot.item) return;
      inv.beginItemDrag(slot.id);

      const overlay = overlayRef.current;
      if (!overlay) return;
      const rect = overlay.getBoundingClientRect();

      const ds: DragState = {
        source: { kind: "inventory", inventory: inv, slot, originalCol: slot.gridX, originalRow: slot.gridY },
        item: slot.item,
        ghostX: e.clientX - rect.left,
        ghostY: e.clientY - rect.top,
      };
      dragRef.current = ds;
      setDragState(ds);
      setPointerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    },
    []
  );

  const onDragStartFromRelic = useCallback(
    (slotIndex: number, item: Item, e: React.PointerEvent) => {
      const state = getState();
      if (!state) return;
      state.relicSlots[slotIndex].relic = null;

      const overlay = overlayRef.current;
      if (!overlay) return;
      const rect = overlay.getBoundingClientRect();

      const ds: DragState = {
        source: { kind: "relic", slotIndex, item },
        item,
        ghostX: e.clientX - rect.left,
        ghostY: e.clientY - rect.top,
      };
      dragRef.current = ds;
      setDragState(ds);
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
      if (!state || !overlay) {
        cancelDrag(ds);
        dragRef.current = null;
        setDragState(null);
        setPointerPos(null);
        return;
      }

      const rect = overlay.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const scale = getScale();

      let placed = false;

      for (let si = 0; si < RELIC_SLOT_COUNT; si++) {
        const relicSlot = state.relicSlots[si];
        if (relicSlot.relic) continue;
        const relicPos = getRelicPosition(relicSlot);
        const offset = GRID_PADDING + BORDER_WIDTH + CELL_SIZE / 2;
        const canvasX = relicPos.x - offset;
        const canvasY = relicPos.y - offset;
        const slotLeft = (canvasX / CANVAS_WIDTH) * overlay.clientWidth;
        const slotTop = (canvasY / CANVAS_HEIGHT) * overlay.clientHeight;
        const totalW = gridWidth(1) * scale;
        const totalH = gridHeight(1) * scale;

        if (px >= slotLeft && px < slotLeft + totalW && py >= slotTop && py < slotTop + totalH) {
          const relicType = ds.item.type as RelicType;
          if (relicType in RELIC_CONFIGS) {
            if (ds.item.price != null && ds.item.price > 0) {
              if (!state.playerInventory.deductGold(ds.item.price)) {
                cancelDrag(ds);
                dragRef.current = null;
                setDragState(null);
                setPointerPos(null);
                return;
              }
            }

            if (ds.source.kind === "inventory") {
              ds.source.inventory.removeItem(ds.source.slot.id);
            }

            const newItem: Item = { type: ds.item.type, amount: ds.item.amount };
            relicSlot.relic = {
              type: relicType,
              item: newItem,
              charge: 0,
              remainingShots: 0,
              nextShotTime: 0,
            };
            placed = true;
            break;
          }
        }
      }

      if (!placed) {
        const positions = getInventoryPositions(state);

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

          if (ds.source.kind === "inventory" && inv === ds.source.inventory) {
            inv.endItemDrag(ds.source.slot.id, col, row);
          } else {
            if (ds.item.price != null && ds.item.price > 0) {
              if (!state.playerInventory.deductGold(ds.item.price)) {
                cancelDrag(ds);
                dragRef.current = null;
                setDragState(null);
                setPointerPos(null);
                return;
              }
            }

            if (ds.source.kind === "inventory") {
              ds.source.inventory.removeItem(ds.source.slot.id);
            }

            const purchased: Item = { type: ds.item.type, amount: ds.item.amount };
            inv.addItem(purchased, col, row);
          }

          placed = true;
          break;
        }
      }

      if (!placed) {
        cancelDrag(ds);
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
  if (!state) return null;
  const overlay = overlayRef.current;
  const scale = overlay ? overlay.clientWidth / CANVAS_WIDTH : 1;
  const positions = getInventoryPositions(state);

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
              dragState={dragState}
              onDragStartFromInventory={onDragStartFromInventory}
              pointerPos={pointerPos}
            />
          </div>
        );
      })}

      {overlay && state.relicSlots.map((relicSlot, idx) => (
        <RelicSlotCell
          key={`relic-${idx}`}
          slotIndex={idx}
          relicSlot={relicSlot}
          scale={scale}
          overlay={overlay}
          dragState={dragState}
          onDragStartFromRelic={onDragStartFromRelic}
          pointerPos={pointerPos}
        />
      ))}

      {dragState && (
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
            <div style={{ position: "absolute", left: 4, top: 4 }}>
              <ItemSprite itemType={dragState.item.type} size={CELL_SIZE - 8} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function cancelDrag(ds: DragState): void {
  if (ds.source.kind === "inventory") {
    ds.source.inventory.cancelItemDrag(ds.source.slot.id);
  } else {
    const state = getState();
    if (state) {
      const relicType = ds.source.item.type as RelicType;
      state.relicSlots[ds.source.slotIndex].relic = {
        type: relicType,
        item: ds.source.item,
        charge: 0,
        remainingShots: 0,
        nextShotTime: 0,
      };
    }
  }
}

function getInventoryPositions(state: GameState): InventoryPosition[] {
  const positions: InventoryPosition[] = [];

  const playerInv = state.playerInventory;
  const playerW = gridWidth(playerInv.cols);
  const playerH = gridHeight(playerInv.rows);
  const playerX = (CANVAS_WIDTH - playerW) / 2;
  const playerY = CANVAS_HEIGHT - playerH - 20;
  positions.push({ inventory: playerInv, canvasX: playerX, canvasY: playerY });

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
