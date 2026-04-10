import { memo } from "react";
import { type Item, getItemConfig } from "../itemConfig";
import { ItemSprite } from "./ItemSprite";

interface ItemCellProps {
  item: Item;
}

export const ItemCell = memo(({ item }: ItemCellProps) => {
  const config = getItemConfig(item.type);

  return (
    <div className="absolute inset-0 pointer-events-none touch-none select-none">
      <div className="absolute inset-[8%]">
        <ItemSprite itemType={item.type} />
      </div>
      {config.stackable && item.amount > 1 && (
        <span
          className="absolute right-0.5 bottom-0 text-[length:clamp(4px,0.6vw,7px)] text-white pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
        >
          {item.amount}
        </span>
      )}
      {item.price != null && (
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center bg-black/60 py-px">
          <span className="text-amber-300 pointer-events-none text-[length:clamp(4px,0.5vw,6px)]">
            {item.price}g
          </span>
        </div>
      )}
    </div>
  );
});
