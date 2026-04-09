import { useCallback, useEffect, useRef, useState } from "react";
import { getState, getRelicPosition, onStateCreated } from "../state";
import { type InventoryState, type InventoryItem } from "../inventoryState";
import { type Item } from "../itemConfig";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../constants";
import { InventoryGrid } from "./InventoryGrid";
import { DragGhost } from "./DragGhost";

const FALLBACK_CELL_PX = 48;

interface DragSource {
  inventory: InventoryState;
  slot: InventoryItem;
}

interface DragData {
  source: DragSource;
  item: Item;
  ghostX: number;
  ghostY: number;
  cellSize: number;
}

function hitTestInventory(
  inv: InventoryState,
  invRect: DOMRect,
  px: number,
  py: number
): { col: number; row: number } | null {
  const cellW = invRect.width / inv.cols;
  const cellH = invRect.height / inv.rows;
  const localX = px - invRect.left;
  const localY = py - invRect.top;
  const col = Math.floor(localX / cellW);
  const row = Math.floor(localY / cellH);
  if (col >= 0 && col < inv.cols && row >= 0 && row < inv.rows) {
    return { col, row };
  }
  return null;
}

export const InventoryOverlay = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const inventoryRefs = useRef<Map<InventoryState, HTMLDivElement>>(new Map());
  const [, setTick] = useState(0);
  const [visible, setVisible] = useState(() => {
    const state = getState();
    return state ? !state.waveActive : true;
  });
  const dragRef = useRef<DragData | null>(null);
  const [dragState, setDragState] = useState<DragData | null>(null);
  const [hoverTarget, setHoverTarget] = useState<{
    inventory: InventoryState;
    col: number;
    row: number;
    valid: boolean;
  } | null>(null);

  useEffect(() => {
    const unsubs: Array<() => void> = [];

    const setup = () => {
      const state = getState();
      if (!state) return;

      const refresh = () => setTick((t) => t + 1);
      refresh();

      unsubs.push(state.playerInventory.onChange(refresh));
      unsubs.push(state.onMerchantChanged.subscribe(refresh));

      for (const slot of state.relicSlots) {
        unsubs.push(slot.inventory.onChange(refresh));
      }

      unsubs.push(state.onWaveActiveChanged.subscribe(() => {
        setVisible(!state.waveActive);
      }));
    };

    unsubs.push(onStateCreated(setup));

    return () => {
      for (const u of unsubs) u();
    };
  }, []);

  const registerRef = useCallback((inv: InventoryState) => {
    return (el: HTMLDivElement | null) => {
      if (el) {
        inventoryRefs.current.set(inv, el);
      } else {
        inventoryRefs.current.delete(inv);
      }
    };
  }, []);

  const onDragStart = useCallback(
    (inv: InventoryState, slot: InventoryItem, e: React.PointerEvent) => {
      if (!slot.item) return;
      inv.beginItemDrag(slot.id);

      const overlay = overlayRef.current;
      if (!overlay) return;
      const rect = overlay.getBoundingClientRect();

      const gridEl = inventoryRefs.current.get(inv);
      const cellSize = gridEl ? gridEl.getBoundingClientRect().width / inv.cols : FALLBACK_CELL_PX;

      const ds: DragData = {
        source: { inventory: inv, slot },
        item: slot.item,
        ghostX: e.clientX - rect.left,
        ghostY: e.clientY - rect.top,
        cellSize,
      };
      dragRef.current = ds;
      setDragState(ds);
    },
    []
  );

  const findDropTarget = useCallback(
    (clientX: number, clientY: number): {
      inventory: InventoryState;
      col: number;
      row: number;
    } | null => {
      for (const [inv, el] of inventoryRefs.current) {
        const rect = el.getBoundingClientRect();
        const hit = hitTestInventory(inv, rect, clientX, clientY);
        if (hit) {
          return { inventory: inv, col: hit.col, row: hit.row };
        }
      }
      return null;
    },
    []
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const ds = dragRef.current;
      if (!ds) return;
      const overlay = overlayRef.current;
      if (!overlay) return;
      const rect = overlay.getBoundingClientRect();
      ds.ghostX = e.clientX - rect.left;
      ds.ghostY = e.clientY - rect.top;
      setDragState({ ...ds });

      const target = findDropTarget(e.clientX, e.clientY);
      if (target) {
        const isDragSource =
          target.inventory === ds.source.inventory &&
          ds.source.slot.gridX === target.col &&
          ds.source.slot.gridY === target.row;
        setHoverTarget({
          inventory: target.inventory,
          col: target.col,
          row: target.row,
          valid: isDragSource || target.inventory.canPlace(target.col, target.row),
        });
      } else {
        setHoverTarget(null);
      }
    };

    const onUp = (e: PointerEvent) => {
      const ds = dragRef.current;
      if (!ds) return;
      const state = getState();
      if (!state) {
        ds.source.inventory.cancelItemDrag(ds.source.slot.id);
        dragRef.current = null;
        setDragState(null);
        setHoverTarget(null);
        return;
      }

      const target = findDropTarget(e.clientX, e.clientY);
      let placed = false;

      if (target) {
        const inv = target.inventory;
        if (inv === ds.source.inventory) {
          placed = inv.endItemDrag(ds.source.slot.id, target.col, target.row);
        } else if (inv.canPlace(target.col, target.row) && inv.acceptsItem(ds.item.type)) {
          if (ds.item.price != null && ds.item.price > 0) {
            if (!state.playerInventory.deductGold(ds.item.price)) {
              ds.source.inventory.cancelItemDrag(ds.source.slot.id);
              dragRef.current = null;
              setDragState(null);
              setHoverTarget(null);
              return;
            }
          }
          ds.source.inventory.removeItem(ds.source.slot.id);
          const purchased: Item = { type: ds.item.type, amount: ds.item.amount };
          inv.addItem(purchased, target.col, target.row);
          placed = true;
        }
      }

      if (!placed) {
        ds.source.inventory.cancelItemDrag(ds.source.slot.id);
      }

      dragRef.current = null;
      setDragState(null);
      setHoverTarget(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [findDropTarget]);

  if (!visible) return null;

  const state = getState();
  if (!state) return null;
  const draggingInv = dragState?.source.inventory ?? null;
  const draggingId = dragState?.source.slot.id;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ fontFamily: '"Press Start 2P", monospace' }}
    >
      <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center gap-2 w-3/5 max-w-[640px]">
        {state.activeMerchantInventory && (
          <InventoryGrid
            inventory={state.activeMerchantInventory}
            gridRef={registerRef(state.activeMerchantInventory)}
            label="Merchant"
            highlightCol={hoverTarget?.inventory === state.activeMerchantInventory ? hoverTarget.col : undefined}
            highlightRow={hoverTarget?.inventory === state.activeMerchantInventory ? hoverTarget.row : undefined}
            highlightValid={hoverTarget?.inventory === state.activeMerchantInventory ? hoverTarget.valid : undefined}
            draggingItemId={draggingInv === state.activeMerchantInventory ? draggingId : undefined}
            onDragStart={onDragStart}
          />
        )}
        <InventoryGrid
          inventory={state.playerInventory}
          gridRef={registerRef(state.playerInventory)}
          highlightCol={hoverTarget?.inventory === state.playerInventory ? hoverTarget.col : undefined}
          highlightRow={hoverTarget?.inventory === state.playerInventory ? hoverTarget.row : undefined}
          highlightValid={hoverTarget?.inventory === state.playerInventory ? hoverTarget.valid : undefined}
          draggingItemId={draggingInv === state.playerInventory ? draggingId : undefined}
          onDragStart={onDragStart}
        />
      </div>

      {state.relicSlots.map((slot, idx) => {
        const pos = getRelicPosition(slot);
        const leftPct = (pos.x / CANVAS_WIDTH) * 100;
        const topPct = (pos.y / CANVAS_HEIGHT) * 100;
        return (
          <div
            key={`relic-${idx}`}
            className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 w-[6%]"
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
            }}
          >
            <InventoryGrid
              inventory={slot.inventory}
              gridRef={registerRef(slot.inventory)}
              highlightCol={hoverTarget?.inventory === slot.inventory ? hoverTarget.col : undefined}
              highlightRow={hoverTarget?.inventory === slot.inventory ? hoverTarget.row : undefined}
              highlightValid={hoverTarget?.inventory === slot.inventory ? hoverTarget.valid : undefined}
              draggingItemId={draggingInv === slot.inventory ? draggingId : undefined}
              onDragStart={onDragStart}
            />
          </div>
        );
      })}

      {dragState && (
        <DragGhost item={dragState.item} x={dragState.ghostX} y={dragState.ghostY} cellSize={dragState.cellSize} />
      )}
    </div>
  );
};
