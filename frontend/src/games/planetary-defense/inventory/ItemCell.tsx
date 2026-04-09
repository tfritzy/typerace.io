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
      <div className="absolute inset-[10%]">
        <ItemSprite itemType={slot.item.type} />
      </div>
      {config.stackable && slot.item.amount > 1 && (
        <span
          className="absolute right-0.5 bottom-0 text-[length:clamp(6px,1vw,11px)] font-bold text-white pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
        >
          {slot.item.amount}
        </span>
      )}
      {slot.item.price != null && (
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-black/70 rounded-b-sm py-px">
          <span className="text-amber-300 pointer-events-none text-[length:clamp(5px,0.8vw,9px)] font-semibold">
            {slot.item.price}g
          </span>
        </div>
      )}
    </div>
  );
});
