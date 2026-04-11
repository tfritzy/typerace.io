import { useRef, useEffect } from "react";
import { SwordFrame, SPRITESHEET_PATH } from "./spriteData";

interface SpriteIconProps {
  frame: SwordFrame;
  size?: number;
}

export function SpriteIcon({ frame, size = 64 }: SpriteIconProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = SPRITESHEET_PATH;
    img.onload = () => {
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(
        img,
        frame.frame.x,
        frame.frame.y,
        frame.frame.w,
        frame.frame.h,
        0,
        0,
        size,
        size
      );
    };
  }, [frame, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size, imageRendering: "pixelated" }}
    />
  );
}
