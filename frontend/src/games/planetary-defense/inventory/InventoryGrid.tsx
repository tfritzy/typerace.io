import { memo, useCallback, useEffect, useState } from "react";
import { type InventoryState, type InventoryItem } from "../inventoryState";
import { NineSlicePanel } from "./NineSlicePanel";
import { ItemCell } from "./ItemCell";

const SLOT_BG_SRC = "/elv_pixel_inventory_ui/Inventory_Slot_1.png";
const CELL_PX = 64;

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

  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <div
          className="text-green-400 tracking-wider"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "10px",
          }}
        >
          {label}
        </div>
      )}
      <NineSlicePanel>
        <div
          ref={gridRef}
          className="relative"
          style={{
            width: `${inventory.cols * CELL_PX}px`,
            height: `${inventory.rows * CELL_PX}px`,
          }}
        >
          {Array.from({ length: inventory.rows }, (_, r) =>
            Array.from({ length: inventory.cols }, (_, c) => {
              const isHighlight = highlightCol === c && highlightRow === r;
              return (
                <div
                  key={`${r}-${c}`}
                  className="absolute"
                  style={{
                    left: `${c * CELL_PX}px`,
                    top: `${r * CELL_PX}px`,
                    width: `${CELL_PX}px`,
                    height: `${CELL_PX}px`,
                  }}
                >
                  <img
                    src={SLOT_BG_SRC}
                    draggable={false}
                    className={`w-full h-full [image-rendering:pixelated] pointer-events-none ${
                      isHighlight
                        ? highlightValid
                          ? "brightness-150"
                          : "brightness-50 hue-rotate-180"
                        : ""
                    }`}
                    alt=""
                  />
                  {isHighlight && (
                    <div
                      className={`absolute inset-0 ${
                        highlightValid ? "bg-green-400/30" : "bg-red-500/30"
                      }`}
                    />
                  )}
                </div>
              );
            })
          )}
          {items
            .filter((slot) => slot.id !== draggingItemId)
            .map((slot) => (
            <ItemCell
              key={slot.id}
              slot={slot}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      </NineSlicePanel>
    </div>
  );
});
