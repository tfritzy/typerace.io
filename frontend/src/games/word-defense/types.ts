import type { Container, Sprite, Text, Graphics } from "pixi.js";

export type Palette = [number, number, number][];

export interface SceneObject {
  x: number;
  y: number;
  width: number;
  height: number;
  data: Uint8Array;
  imageData: ImageData;
  bitmap: HTMLCanvasElement;
}

export interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  health: number;
  maxHealth: number;
  word: string;
  typedCount: number;
}

export enum TurretType {
  Bullet,
  Missile,
  Laser,
  Railgun,
}

export interface TurretSlot {
  baseAngle: number;
  angle: number;
  x: number;
  y: number;
  filled: boolean;
  destroyed: boolean;
  turretType: TurretType;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  target: Meteor;
  explosionRadius: number;
  age: number;
  fuseTime: number;
  launchAngle: number;
  speed: number;
}

export interface LaserBeam {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  age: number;
  duration: number;
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
  healthBar: Graphics;
}

export interface MeteorDestructionParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
}

export interface TurretVisuals {
  containers: (Container | null)[];
  emptySlotGfx: (Graphics | null)[];
  hitAreas: Graphics[];
}
