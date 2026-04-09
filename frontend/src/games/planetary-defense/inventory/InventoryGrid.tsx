import { memo, useCallback, useEffect, useState } from "react";
import { type InventoryState, type InventoryItem } from "../inventoryState";
import { NineSlicePanel } from "./NineSlicePanel";
import { ItemCell } from "./ItemCell";

interface InventoryGridProps {
  inventory: InventoryState;
  label?: string;
  highlightCol?: number;
  highlightRow?: number;
  highlightValid?: boolean;
  draggingItemId?: number;
  gridRef?: (el: HTMLDivElement | null) => void;
  onDragStart: (inventory: InventoryState, slot: InventoryItem, e: React.PointerEvent) => void;
}

export const InventoryGrid = memo(({
  inventory,
  label,
  highlightCol,
  highlightRow,
  highlightValid,
  draggingItemId,
  gridRef,
  onDragStart,
}: InventoryGridProps) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return inventory.onChange(() => setTick((t) => t + 1));
  }, [inventory]);

  const handleDragStart = useCallback(
    (slot: InventoryItem, e: React.PointerEvent) => {
      onDragStart(inventory, slot, e);
    },
    [inventory, onDragStart]
  );

  const items = inventory.getItems();
  const itemMap = new Map<string, InventoryItem>();
  for (const slot of items) {
    if (slot.item) {
      itemMap.set(`${slot.gridX},${slot.gridY}`, slot);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      {label && (
        <div className="text-indigo-200 text-xs font-semibold tracking-wide uppercase">
          {label}
        </div>
      )}
      <NineSlicePanel className="w-full">
        <div
          ref={gridRef}
          className="grid w-full gap-px"
          style={{ gridTemplateColumns: `repeat(${inventory.cols}, 1fr)` }}
        >
          {Array.from({ length: inventory.rows }, (_, r) =>
            Array.from({ length: inventory.cols }, (_, c) => {
              const isHighlight = highlightCol === c && highlightRow === r;
              const cellItem = itemMap.get(`${c},${r}`);
              const isDragging = cellItem?.id === draggingItemId;
              return (
                <div
                  key={`${r}-${c}`}
                  className={`aspect-square relative rounded-sm border border-indigo-400/10 bg-slate-800/60 ${
                    isHighlight
                      ? highlightValid
                        ? "bg-emerald-500/25 border-emerald-400/40"
                        : "bg-red-500/25 border-red-400/40"
                      : "hover:bg-slate-700/40"
                  }`}
                >
                  {cellItem && !isDragging && (
                    <ItemCell slot={cellItem} onDragStart={handleDragStart} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </NineSlicePanel>
    </div>
  );
});
