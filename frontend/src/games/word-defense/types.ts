export interface SceneObject {
  x: number;
  y: number;
  width: number;
  height: number;
  data: Uint8Array;
  imageData: ImageData;
  bitmap: HTMLCanvasElement;
}

export interface Meteor extends SceneObject {
  vx: number;
  vy: number;
  radius: number;
  word: string;
  typedCount: number;
}

export interface TurretSlot {
  angle: number;
  x: number;
  y: number;
  filled: boolean;
}

export interface Bullet {
  x: number;
  y: number;
  target: Meteor;
}
