import { useCallback, useEffect, useRef, useState } from "react";
import { getState, getRelicPosition, onStateCreated } from "../state";
import { type InventoryState } from "../inventoryState";
import { type Item, createItem } from "../itemConfig";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../constants";
import { InventoryGrid } from "./InventoryGrid";
import { DragGhost } from "./DragGhost";

interface DragData {
  sourceInv: InventoryState;
  item: Item;
  origCol: number;
  origRow: number;
  ghostX: number;
  ghostY: number;
  cellSize: number;
}

interface InventoryOverlayProps {
  waveActive: boolean;
}

export const InventoryOverlay = ({ waveActive }: InventoryOverlayProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [, setTick] = useState(0);
  const dragRef = useRef<DragData | null>(null);
  const [dragState, setDragState] = useState<DragData | null>(null);

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
    };

    unsubs.push(onStateCreated(setup));

    return () => {
      for (const u of unsubs) u();
    };
  }, []);

  const onDragStart = useCallback(
    (inv: InventoryState, col: number, row: number, item: Item, e: React.PointerEvent, cellSize: number) => {
      if (dragRef.current) return;
      inv.removeAt(col, row);

      const overlay = overlayRef.current;
      if (!overlay) return;
      const rect = overlay.getBoundingClientRect();

      const ds: DragData = {
        sourceInv: inv,
        item,
        origCol: col,
        origRow: row,
        ghostX: e.clientX - rect.left,
        ghostY: e.clientY - rect.top,
        cellSize,
      };
      dragRef.current = ds;
      setDragState(ds);
    },
    []
  );

  const onCellDrop = useCallback(
    (targetInv: InventoryState, col: number, row: number) => {
      const ds = dragRef.current;
      if (!ds) return;
      const state = getState();

      let placed = false;
      if (targetInv === ds.sourceInv) {
        placed = targetInv.addItem(ds.item, col, row);
      } else if (targetInv.canPlace(col, row) && targetInv.acceptsItem(ds.item.type)) {
        if (ds.item.price != null && ds.item.price > 0) {
          if (!state || !state.playerInventory.deductGold(ds.item.price)) {
            ds.sourceInv.addItem(ds.item, ds.origCol, ds.origRow);
            dragRef.current = null;
            setDragState(null);
            return;
          }
        }
        const purchased = createItem(ds.item.type, ds.item.amount);
        targetInv.addItem(purchased, col, row);
        placed = true;
      }

      if (!placed) {
        ds.sourceInv.addItem(ds.item, ds.origCol, ds.origRow);
      }

      dragRef.current = null;
      setDragState(null);
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
    };

    const onUp = () => {
      const ds = dragRef.current;
      if (!ds) return;
      ds.sourceInv.addItem(ds.item, ds.origCol, ds.origRow);
      dragRef.current = null;
      setDragState(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  const state = getState();
  if (!state) return null;
  const isHolding = dragState !== null;
  const heldItem = dragState?.item ?? null;

  const merchantShip = state.activeMerchantId != null
    ? state.merchants.find((m) => m.id === state.activeMerchantId)
    : null;
  const merchantLeftPct = merchantShip ? (merchantShip.x / CANVAS_WIDTH) * 100 : 0;
  const merchantTopPct = merchantShip ? (merchantShip.y / CANVAS_HEIGHT) * 100 : 0;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {!waveActive && (
        <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 pointer-events-auto" style={{ width: `${state.playerInventory.cols * 3.5}%`, maxWidth: '400px' }}>
          <InventoryGrid
            inventory={state.playerInventory}
            isHolding={isHolding}
            canAcceptHeld={heldItem ? state.playerInventory.acceptsItem(heldItem.type) : false}
            draggingCol={dragState?.sourceInv === state.playerInventory ? dragState.origCol : undefined}
            draggingRow={dragState?.sourceInv === state.playerInventory ? dragState.origRow : undefined}
            onDragStart={onDragStart}
            onDrop={onCellDrop}
          />
        </div>
      )}

      {state.activeMerchantInventory && (
        <div
          className="absolute pointer-events-auto -translate-x-1/2"
          style={{
            left: `${merchantLeftPct}%`,
            top: `${merchantTopPct - 15}%`,
            width: `${state.activeMerchantInventory.cols * 3.5}%`,
            maxWidth: `${state.activeMerchantInventory.cols * 40}px`,
          }}
        >
          <InventoryGrid
            inventory={state.activeMerchantInventory}
            label="Merchant"
            isHolding={isHolding}
            canAcceptHeld={heldItem ? state.activeMerchantInventory.acceptsItem(heldItem.type) : false}
            draggingCol={dragState?.sourceInv === state.activeMerchantInventory ? dragState.origCol : undefined}
            draggingRow={dragState?.sourceInv === state.activeMerchantInventory ? dragState.origRow : undefined}
            onDragStart={onDragStart}
            onDrop={onCellDrop}
          />
        </div>
      )}

      {state.relicSlots.map((slot, idx) => {
        const pos = getRelicPosition(slot);
        const leftPct = (pos.x / CANVAS_WIDTH) * 100;
        const topPct = (pos.y / CANVAS_HEIGHT) * 100;
        return (
          <div
            key={`relic-${idx}`}
            className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              width: '3.5%',
              maxWidth: '40px',
            }}
          >
            <InventoryGrid
              inventory={slot.inventory}
              isHolding={isHolding}
              canAcceptHeld={heldItem ? slot.inventory.acceptsItem(heldItem.type) : false}
              draggingCol={dragState?.sourceInv === slot.inventory ? dragState.origCol : undefined}
              draggingRow={dragState?.sourceInv === slot.inventory ? dragState.origRow : undefined}
              onDragStart={onDragStart}
              onDrop={onCellDrop}
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
