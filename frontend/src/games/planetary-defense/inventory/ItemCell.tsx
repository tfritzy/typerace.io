import { memo, useCallback } from "react";
import { type InventoryItem } from "../inventoryState";
import { getItemConfig } from "../itemConfig";
import { ItemSprite } from "./ItemSprite";

const SLOT_BG_SRC = "/elv_pixel_inventory_ui/Inventory_Slot_1.png";

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
      className="absolute cursor-grab touch-none"
      style={{
        left: `${slot.gridX * 64}px`,
        top: `${slot.gridY * 64}px`,
        width: "64px",
        height: "64px",
      }}
    >
      <img
        src={SLOT_BG_SRC}
        draggable={false}
        className="absolute inset-0 w-full h-full [image-rendering:pixelated] pointer-events-none"
        alt=""
      />
      <div className="absolute inset-2">
        <ItemSprite itemType={slot.item.type} />
      </div>
      {config.stackable && slot.item.amount > 1 && (
        <span
          className="absolute right-1 bottom-0.5 text-white pointer-events-none"
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: "10px",
            WebkitTextStroke: "2px #000",
            paintOrder: "stroke fill",
          }}
        >
          {slot.item.amount}
        </span>
      )}
      {slot.item.price != null && (
        <div className="absolute bottom-0.5 left-0.5 right-0.5 h-4 bg-black/80 rounded-sm flex items-center pl-1">
          <span
            className="text-yellow-400 pointer-events-none"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: "8px",
            }}
          >
            {slot.item.price}g
          </span>
        </div>
      )}
    </div>
  );
});
