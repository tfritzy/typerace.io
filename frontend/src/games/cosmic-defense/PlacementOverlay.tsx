import { Plus } from "lucide-react";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { PlacementSlot } from "./PlacementPoints";

interface PlacementOverlayProps {
  slots: PlacementSlot[];
  onSlotClick: (slot: PlacementSlot) => void;
}

const BUTTON_SIZE = (140 / CANVAS_WIDTH) * 100;

export const PlacementOverlay = ({ slots, onSlotClick }: PlacementOverlayProps) => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {slots.map((slot) =>
        slot.occupant ? null : (
          <button
            key={slot.index}
            className="absolute rounded-full pointer-events-auto cursor-pointer hover:bg-accent/15 transition-colors p-0 flex items-center justify-center"
            style={{
              left: `${(slot.x / CANVAS_WIDTH) * 100}%`,
              top: `${(slot.y / CANVAS_HEIGHT) * 100}%`,
              width: `${BUTTON_SIZE}%`,
              aspectRatio: "1",
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => onSlotClick(slot)}
          >
            <Plus className="w-3 h-3 text-accent/40 pointer-events-none" />
          </button>
        )
      )}
    </div>
  );
};
