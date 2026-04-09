import { memo } from "react";
import { type Item } from "../itemConfig";
import { ItemSprite } from "./ItemSprite";

interface DragGhostProps {
  item: Item;
  x: number;
  y: number;
  cellSize: number;
}

export const DragGhost = memo(({ item, x, y, cellSize }: DragGhostProps) => {
  const half = cellSize / 2;
  return (
    <div
      className="absolute pointer-events-none opacity-85 z-50 select-none"
      style={{
        left: `${x - half}px`,
        top: `${y - half}px`,
        width: `${cellSize}px`,
        height: `${cellSize}px`,
      }}
    >
      <div className="w-full h-full">
        <ItemSprite itemType={item.type} />
      </div>
    </div>
  );
});
