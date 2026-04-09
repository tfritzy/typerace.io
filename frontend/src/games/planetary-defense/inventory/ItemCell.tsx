import { memo, useCallback } from "react";
import { type InventoryItem } from "../inventoryState";
import { getItemConfig } from "../itemConfig";
import { ItemSprite } from "./ItemSprite";

interface ItemCellProps {
  slot: InventoryItem;
  onDragStart: (slot: InventoryItem, e: React.PointerEvent) => void;
}

export const ItemCell = memo(({ slot, onDragStart }: ItemCellProps) => {
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (slot.item) onDragStart(slot, e);
    },
    [slot, onDragStart]
  );

  if (!slot.item) return null;

  const config = getItemConfig(slot.item.type);

  return (
    <div
      onPointerDown={handlePointerDown}
      className="absolute inset-0 cursor-grab touch-none"
    >
      <div className="absolute inset-[12%]">
        <ItemSprite itemType={slot.item.type} />
      </div>
      {config.stackable && slot.item.amount > 1 && (
        <span
          className="absolute right-0.5 bottom-0 text-white pointer-events-none"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "clamp(6px, 1vw, 10px)",
            WebkitTextStroke: "2px #000",
            paintOrder: "stroke fill",
          }}
        >
          {slot.item.amount}
        </span>
      )}
      {slot.item.price != null && (
        <div className="absolute bottom-0.5 left-0.5 right-0.5 flex items-center justify-center bg-black/80 rounded-sm">
          <span
            className="text-yellow-400 pointer-events-none"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: "clamp(5px, 0.8vw, 8px)",
            }}
          >
            {slot.item.price}g
          </span>
        </div>
      )}
    </div>
  );
});
