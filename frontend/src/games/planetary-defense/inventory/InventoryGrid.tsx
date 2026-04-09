import { memo, useCallback, useEffect, useState } from "react";
import { type InventoryState } from "../inventoryState";
import { type Item } from "../itemConfig";
import { ItemCell } from "./ItemCell";

interface InventoryGridProps {
  inventory: InventoryState;
  label?: string;
  isHolding: boolean;
  canAcceptHeld: boolean;
  draggingCol?: number;
  draggingRow?: number;
  gridRef?: (el: HTMLDivElement | null) => void;
  onDragStart: (inventory: InventoryState, col: number, row: number, item: Item, e: React.PointerEvent) => void;
}

export const InventoryGrid = memo(({
  inventory,
  label,
  isHolding,
  canAcceptHeld,
  draggingCol,
  draggingRow,
  gridRef,
  onDragStart,
}: InventoryGridProps) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return inventory.onChange(() => setTick((t) => t + 1));
  }, [inventory]);

  const handleDragStart = useCallback(
    (col: number, row: number, item: Item, e: React.PointerEvent) => {
      onDragStart(inventory, col, row, item, e);
    },
    [inventory, onDragStart]
  );

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      {label && (
        <div className="text-indigo-100 text-xs font-semibold tracking-wide uppercase">
          {label}
        </div>
      )}
      <div className="relative rounded-lg border border-indigo-400/20 bg-slate-900/85 backdrop-blur-sm shadow-lg shadow-indigo-950/40 p-1.5 w-full">
        <div
          ref={gridRef}
          className="grid w-full gap-px"
          style={{ gridTemplateColumns: `repeat(${inventory.cols}, 1fr)` }}
        >
          {Array.from({ length: inventory.rows }, (_, r) =>
            Array.from({ length: inventory.cols }, (_, c) => {
              const cellItem = inventory.getItem(c, r);
              const isDragging = draggingCol === c && draggingRow === r;
              const isEmpty = cellItem === null || isDragging;
              const hoverClass = isHolding
                ? isEmpty && canAcceptHeld
                  ? "hover:bg-emerald-500/25 hover:border-emerald-400/40"
                  : "hover:bg-red-500/25 hover:border-red-400/40"
                : cellItem
                  ? "hover:bg-slate-700/40"
                  : "";
              return (
                <div
                  key={`${r}-${c}`}
                  className={`aspect-square relative rounded-sm border border-indigo-400/10 bg-slate-800/60 ${hoverClass}`}
                >
                  {cellItem && !isDragging && (
                    <ItemCell item={cellItem} col={c} row={r} onDragStart={handleDragStart} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});
