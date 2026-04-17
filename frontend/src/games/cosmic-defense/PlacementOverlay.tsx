import { Plus } from "lucide-react";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { PlacementSlot } from "./PlacementPoints";

interface PlacementOverlayProps {
  slots: PlacementSlot[];
  onSlotClick: (slot: PlacementSlot) => void;
  activeSlotIndex: number | null;
}

const BUTTON_SIZE_PX = 48;

export const PlacementOverlay = ({ slots, onSlotClick, activeSlotIndex }: PlacementOverlayProps) => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {slots.map((slot) => {
        if (slot.occupant) return null;
        const isActive = activeSlotIndex === slot.index;
        return (
          <div
            key={slot.index}
            className="absolute"
            style={{
              left: `${(slot.x / CANVAS_WIDTH) * 100}%`,
              top: `${(slot.y / CANVAS_HEIGHT) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <button
              className={`pointer-events-auto cursor-pointer rounded-full flex items-center justify-center transition-all duration-200 ease-out ${
                isActive
                  ? "border-2 border-solid border-[#8ba4e8]/70 bg-[#788cc8]/15 shadow-[0_0_16px_4px_rgba(120,140,200,0.25)]"
                  : "border-2 border-dashed slot-marker"
              }`}
              style={{ width: BUTTON_SIZE_PX, height: BUTTON_SIZE_PX }}
              onClick={() => onSlotClick(slot)}
            >
              <Plus
                className={`w-4 h-4 pointer-events-none ${
                  isActive ? "text-[#8ba4e8]/80" : "slot-icon text-[#8ba4e8]"
                }`}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
};
