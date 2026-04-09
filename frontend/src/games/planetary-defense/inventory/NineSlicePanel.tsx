import { type ReactNode } from "react";

const NINE_SLICE_SRC = "/elv_pixel_inventory_ui/Inventory_9Slices.png";

interface NineSlicePanelProps {
  children: ReactNode;
  className?: string;
}

export const NineSlicePanel = ({ children, className = "" }: NineSlicePanelProps) => {
  return (
    <div
      className={`relative ${className}`}
      style={{
        borderImage: `url(${NINE_SLICE_SRC}) 8 fill / 16px / 0 round`,
        imageRendering: "pixelated",
        borderStyle: "solid",
        borderWidth: "16px",
      }}
    >
      {children}
    </div>
  );
};
