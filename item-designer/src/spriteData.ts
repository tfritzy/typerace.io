export interface SwordFrame {
  frame: { x: number; y: number; w: number; h: number };
}

export interface SpriteSheet {
  frames: Record<string, SwordFrame>;
  meta: {
    image: string;
    size: { w: number; h: number };
  };
}

export const SPRITESHEET_PATH = "/Swordtember 2024 - Sheet/Swordtember_2024.png";
export const SPRITESHEET_JSON_PATH = "/Swordtember 2024 - Sheet/swordtember_2024.json";
