export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;

export const ASSET_BASE = "/pixel_starships_kit";

export const SHIP_SPEED_MIN = 60;
export const SHIP_SPEED_MAX = 140;
export const SHIP_SPAWN_INTERVAL_MS = 3000;
export const SHIP_SCALE = 3;

export const ASTEROID_SPEED_MIN = 30;
export const ASTEROID_SPEED_MAX = 100;
export const ASTEROID_SPAWN_INTERVAL_MS = 1500;
export const ASTEROID_SCALE = 3;
export const ASTEROID_ROTATION_SPEED = 1.5;

export const ENGINE_FRAME_WIDTH = 32;
export const ENGINE_FRAME_HEIGHT = 32;
export const ENGINE_FRAME_COUNT = 5;
export const ENGINE_ANIMATION_SPEED = 0.15;

export const PLANET_FRAME_SIZE = 32;
export const PLANET_RING_FRAME_WIDTH = 54;
export const PLANET_RING_FRAME_HEIGHT = 32;
export const PLANET_SCALE = 6;

export const BACKGROUND_TILE_SIZE = 640;

export const STAR_PARTICLE_FRAME_SIZE = 7;
export const STAR_PARTICLE_FRAME_COUNT = 7;

export const COLORMAP_GRAYS = [0x01, 0x37, 0x41, 0x60, 0x80, 0xa0, 0xc0, 0xdf, 0xff];

export const COLOR_PRESETS = [
  [
    [0x28, 0x29, 0x33], [0x38, 0x57, 0x99], [0x27, 0x89, 0xcd], [0x42, 0xbf, 0xe8],
    [0x73, 0xef, 0xe8], [0x55, 0x53, 0x71], [0x74, 0x77, 0x97], [0x98, 0xa4, 0xb6],
    [0xcc, 0xd4, 0xda],
  ],
  [
    [0x33, 0x29, 0x28], [0x98, 0x53, 0x25], [0xcd, 0x70, 0x36], [0xe1, 0xa9, 0x52],
    [0xf0, 0xdd, 0x6f], [0x59, 0x53, 0x53], [0x7f, 0x76, 0x74], [0xa7, 0x9e, 0x9a],
    [0xd1, 0xcd, 0xca],
  ],
  [
    [0x29, 0x2e, 0x2d], [0x3f, 0x6f, 0x45], [0x42, 0xa4, 0x59], [0x59, 0xcf, 0x93],
    [0x97, 0xed, 0xca], [0x50, 0x5d, 0x5b], [0x76, 0x83, 0x7e], [0x9d, 0xaa, 0xa0],
    [0xcf, 0xd5, 0xcb],
  ],
  [
    [0x39, 0x2d, 0x37], [0x79, 0x35, 0x3a], [0xb0, 0x41, 0x36], [0xda, 0x5b, 0x3e],
    [0xed, 0xc2, 0xa6], [0x54, 0x4b, 0x4f], [0x7d, 0x6d, 0x73], [0xaa, 0x9d, 0x9f],
    [0xd1, 0xca, 0xcc],
  ],
];

export interface SpriteRegion {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const SHIP_REGIONS: SpriteRegion[] = [
  { x: 119, y: 4, w: 32, h: 29 },
  { x: 235, y: 5, w: 22, h: 28 },
  { x: 70, y: 7, w: 33, h: 24 },
  { x: 280, y: 7, w: 30, h: 24 },
  { x: 3, y: 9, w: 21, h: 20 },
  { x: 36, y: 9, w: 22, h: 20 },
  { x: 189, y: 9, w: 24, h: 19 },
  { x: 34, y: 37, w: 26, h: 27 },
  { x: 115, y: 40, w: 25, h: 22 },
  { x: 82, y: 41, w: 23, h: 20 },
  { x: 238, y: 42, w: 17, h: 18 },
  { x: 276, y: 42, w: 24, h: 19 },
  { x: 205, y: 43, w: 22, h: 16 },
  { x: 175, y: 46, w: 16, h: 10 },
  { x: 197, y: 69, w: 32, h: 27 },
  { x: 263, y: 70, w: 26, h: 24 },
  { x: 11, y: 73, w: 33, h: 20 },
  { x: 82, y: 73, w: 38, h: 20 },
  { x: 130, y: 75, w: 14, h: 16 },
  { x: 167, y: 100, w: 26, h: 29 },
  { x: 137, y: 101, w: 22, h: 28 },
  { x: 219, y: 101, w: 48, h: 27 },
  { x: 37, y: 103, w: 25, h: 25 },
  { x: 95, y: 106, w: 21, h: 18 },
  { x: 46, y: 131, w: 33, h: 31 },
  { x: 199, y: 132, w: 57, h: 29 },
  { x: 269, y: 134, w: 39, h: 26 },
  { x: 1, y: 135, w: 28, h: 24 },
  { x: 112, y: 139, w: 20, h: 16 },
  { x: 155, y: 139, w: 23, h: 16 },
  { x: 42, y: 164, w: 37, h: 30 },
  { x: 217, y: 166, w: 32, h: 26 },
  { x: 135, y: 167, w: 20, h: 23 },
  { x: 95, y: 168, w: 28, h: 22 },
  { x: 182, y: 170, w: 23, h: 20 },
  { x: 287, y: 170, w: 15, h: 18 },
  { x: 71, y: 198, w: 36, h: 24 },
  { x: 269, y: 200, w: 26, h: 21 },
  { x: 3, y: 201, w: 21, h: 19 },
  { x: 180, y: 201, w: 27, h: 19 },
  { x: 132, y: 202, w: 21, h: 17 },
  { x: 221, y: 202, w: 23, h: 18 },
  { x: 37, y: 203, w: 20, h: 16 },
  { x: 131, y: 227, w: 39, h: 31 },
  { x: 68, y: 231, w: 34, h: 23 },
  { x: 212, y: 231, w: 35, h: 24 },
  { x: 17, y: 232, w: 23, h: 21 },
  { x: 270, y: 236, w: 16, h: 14 },
  { x: 50, y: 264, w: 22, h: 22 },
  { x: 222, y: 264, w: 23, h: 22 },
  { x: 272, y: 264, w: 26, h: 21 },
  { x: 187, y: 265, w: 21, h: 21 },
  { x: 98, y: 266, w: 21, h: 18 },
  { x: 143, y: 266, w: 25, h: 18 },
  { x: 12, y: 267, w: 24, h: 17 },
  { x: 184, y: 293, w: 38, h: 25 },
  { x: 147, y: 294, w: 25, h: 25 },
  { x: 112, y: 296, w: 24, h: 22 },
  { x: 272, y: 296, w: 26, h: 21 },
  { x: 11, y: 297, w: 19, h: 19 },
  { x: 57, y: 297, w: 29, h: 21 },
  { x: 239, y: 298, w: 22, h: 18 },
];

export const ASTEROID_BIG_REGIONS: SpriteRegion[] = [
  { x: 1, y: 1, w: 14, h: 15 },
  { x: 18, y: 1, w: 17, h: 15 },
  { x: 55, y: 1, w: 15, h: 15 },
  { x: 38, y: 2, w: 14, h: 13 },
];

export const ASTEROID_SMALL_REGIONS: SpriteRegion[] = [
  { x: 36, y: 1, w: 9, h: 9 },
  { x: 48, y: 1, w: 10, h: 9 },
  { x: 1, y: 2, w: 9, h: 8 },
  { x: 25, y: 2, w: 8, h: 7 },
  { x: 60, y: 2, w: 9, h: 8 },
  { x: 72, y: 2, w: 8, h: 7 },
  { x: 13, y: 3, w: 9, h: 7 },
];

export const PLANET_COUNT = 18;
export const PLANET_RING_COUNT = 13;
