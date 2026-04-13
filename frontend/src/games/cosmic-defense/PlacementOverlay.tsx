import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import type { PlacementSlot } from "./PlacementPoints";

interface PlacementOverlayProps {
  slots: PlacementSlot[];
  onSlotClick: (slot: PlacementSlot) => void;
}

const POINT_SIZE = (24 / CANVAS_WIDTH) * 100;

export const PlacementOverlay = ({ slots, onSlotClick }: PlacementOverlayProps) => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {slots.map((slot) =>
        slot.occupant ? null : (
          <button
            key={slot.index}
            className="absolute rounded-full pointer-events-auto cursor-pointer bg-[#788cc8]/35 hover:bg-[#788cc8]/70 transition-colors border-none p-0"
            style={{
              left: `${(slot.x / CANVAS_WIDTH) * 100}%`,
              top: `${(slot.y / CANVAS_HEIGHT) * 100}%`,
              width: `${POINT_SIZE}%`,
              aspectRatio: "1",
              transform: "translate(-50%, -50%)",
            }}
            onPointerUp={() => onSlotClick(slot)}
          />
        )
      )}
    </div>
  );
};
