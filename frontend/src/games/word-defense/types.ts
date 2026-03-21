import type { Container, Sprite, Text, Graphics } from "pixi.js";

export interface SceneObject {
  x: number;
  y: number;
  width: number;
  height: number;
  data: Uint8Array;
  imageData: ImageData;
  bitmap: HTMLCanvasElement;
  colors?: Uint8Array;
}

export interface Meteor extends SceneObject {
  vx: number;
  vy: number;
  radius: number;
  word: string;
  typedCount: number;
}

export interface TurretSlot {
  baseAngle: number;
  angle: number;
  x: number;
  y: number;
  filled: boolean;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  target: Meteor;
}

export interface WaveConfig {
  waveNumber: number;
  totalMeteors: number;
  spawnIntervalMin: number;
  spawnIntervalMax: number;
  meteorRadiusMin: number;
  meteorRadiusMax: number;
  meteorSpeed: number;
}

export type WavePhase = "active" | "complete";

export interface MeteorObject {
  data: Meteor;
  container: Container;
  sprite: Sprite;
  untypedText: Text;
  typedText: Text;
}

export interface TurretVisuals {
  containers: (Container | null)[];
  emptySlotGfx: (Graphics | null)[];
  hitAreas: Graphics[];
}
