import { memo } from "react";
import { type Item } from "../itemConfig";
import { ItemSprite } from "./ItemSprite";

const CELL_PX = 64;

interface DragGhostProps {
  item: Item;
  x: number;
  y: number;
}

export const DragGhost = memo(({ item, x, y }: DragGhostProps) => {
  return (
    <div
      className="absolute pointer-events-none opacity-80 z-50"
      style={{
        left: `${x - CELL_PX / 2}px`,
        top: `${y - CELL_PX / 2}px`,
        width: `${CELL_PX}px`,
        height: `${CELL_PX}px`,
      }}
    >
      <div className="w-full h-full relative">
        <div className="absolute inset-0.5 bg-indigo-900/80 border border-indigo-500/50 rounded-sm" />
        <div className="absolute inset-2">
          <ItemSprite itemType={item.type} />
        </div>
      </div>
    </div>
  );
});
