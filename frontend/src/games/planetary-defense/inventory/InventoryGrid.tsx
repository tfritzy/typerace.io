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
  onDragStart: (inventory: InventoryState, col: number, row: number, item: Item, e: React.PointerEvent, cellSize: number) => void;
  onDrop: (inventory: InventoryState, col: number, row: number) => void;
}

export const InventoryGrid = memo(({
  inventory,
  label,
  isHolding,
  canAcceptHeld,
  draggingCol,
  draggingRow,
  onDragStart,
  onDrop,
}: InventoryGridProps) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return inventory.onChange(() => setTick((t) => t + 1));
  }, [inventory]);

  const handleDragStart = useCallback(
    (col: number, row: number, item: Item, e: React.PointerEvent, cellSize: number) => {
      onDragStart(inventory, col, row, item, e, cellSize);
    },
    [inventory, onDragStart]
  );

  const handleDrop = useCallback(
    (col: number, row: number) => {
      onDrop(inventory, col, row);
    },
    [inventory, onDrop]
  );

  return (
    <div className="flex flex-col items-center w-full select-none">
      {label && (
        <div className="text-slate-400 text-[length:clamp(5px,0.6vw,7px)] tracking-wider uppercase mb-0.5">
          {label}
        </div>
      )}
      <div className="relative border border-slate-500/40 bg-slate-900/90 w-full">
        <div
          className="grid w-full"
          style={{ gridTemplateColumns: `repeat(${inventory.cols}, 1fr)` }}
        >
          {Array.from({ length: inventory.rows }, (_, r) =>
            Array.from({ length: inventory.cols }, (_, c) => {
              const cellItem = inventory.getItem(c, r);
              const isDragging = draggingCol === c && draggingRow === r;
              const isEmpty = cellItem === null || isDragging;
              const hasItem = cellItem !== null && !isDragging;
              const hoverClass = isHolding
                ? isEmpty && canAcceptHeld
                  ? "hover:bg-emerald-500/20"
                  : "hover:bg-red-500/15"
                : hasItem
                  ? "hover:bg-slate-700/50"
                  : "";
              return (
                <div
                  key={`${r}-${c}`}
                  className={`aspect-square relative border border-slate-700/30 bg-slate-800/40 transition-colors duration-75 ${hasItem ? "cursor-grab" : ""} ${hoverClass}`}
                  onPointerDown={hasItem ? (e) => {
                    const cellSize = e.currentTarget.getBoundingClientRect().width;
                    handleDragStart(c, r, cellItem!, e, cellSize);
                  } : undefined}
                  onPointerUp={isHolding ? () => handleDrop(c, r) : undefined}
                >
                  {hasItem && <ItemCell item={cellItem!} />}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});
