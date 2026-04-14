import { SHIP_BLUEPRINTS } from "./shipCatalog";
import type { EntityType } from "./types";

interface ShopPanelProps {
  onSelectShip: (entityType: EntityType) => void;
  onClose: () => void;
  shipPreviews: Map<EntityType, string>;
}

export const ShopPanel = ({ onSelectShip, onClose, shipPreviews }: ShopPanelProps) => {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-20 bg-black/60"
      onClick={onClose}
    >
      <div
        className="rounded-lg p-3.5 max-w-[560px] w-[90%] max-h-[80vh] border border-white/10 flex flex-col"
        style={{ background: "linear-gradient(180deg, rgba(12,14,30,0.97) 0%, rgba(8,10,24,0.97) 100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 px-0.5">
          <span className="text-[#cdd6f4] text-sm font-semibold tracking-wide">
            Defensive Fleet
          </span>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-[#585b70] text-lg cursor-pointer px-0.5 leading-none"
          >
            ✕
          </button>
        </div>
        <div className="grid grid-cols-5 gap-1.5 overflow-y-auto">
          {SHIP_BLUEPRINTS.map((bp) => (
            <button
              key={bp.entityType}
              className="flex flex-col items-center p-2.5 px-1 pb-2 rounded-md border border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/10 hover:border-white/20 transition-colors"
              onClick={() => onSelectShip(bp.entityType)}
            >
              <div className="w-14 h-14 flex items-center justify-center mb-1.5">
                {shipPreviews.get(bp.entityType) ? (
                  <img
                    src={shipPreviews.get(bp.entityType)}
                    alt={bp.entityType}
                    className="max-w-14 max-h-14"
                    style={{ imageRendering: "pixelated" }}
                  />
                ) : (
                  <div className="w-8 h-8 bg-white/15 rounded" />
                )}
              </div>
              <span className="text-[#bac2de] text-[10px] font-medium mb-0.5 text-center">
                {bp.entityType}
              </span>
              <span className="text-[#f9e2af] text-[9px] font-medium">
                {bp.cost} gold
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
