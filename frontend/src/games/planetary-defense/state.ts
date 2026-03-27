import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import {
  ShipType, ColorPreset, MeteorType,
  SHIP_TYPE_COUNT, COLOR_PRESET_COUNT, METEOR_TYPE_COUNT,
} from "./types";
import { pickEdgeSpawn, randInt } from "./utils";

export interface ShipState {
  id: number;
  x: number;
  y: number;
  vx: number;
  shipType: ShipType;
  colorPreset: ColorPreset;
  hasShield: boolean;
}

export interface MeteorState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  meteorType: MeteorType;
  variant: number;
}

export interface GameState {
  ships: ShipState[];
  meteors: MeteorState[];
  nextId: number;
}

export type GameAction =
  | { type: "spawnShip" }
  | { type: "spawnMeteor" }
  | { type: "update"; dt: number };

function reduce(state: GameState, action: GameAction): void {
  switch (action.type) {
    case "spawnShip": {
      state.ships.push({
        id: state.nextId++,
        x: -100,
        y: 100 + Math.random() * (CANVAS_HEIGHT - 200),
        vx: 60 + Math.random() * 80,
        shipType: randInt(SHIP_TYPE_COUNT),
        colorPreset: randInt(COLOR_PRESET_COUNT),
        hasShield: Math.random() > 0.5,
      });
      break;
    }
    case "spawnMeteor": {
      const { x, y, angle } = pickEdgeSpawn(CANVAS_WIDTH, CANVAS_HEIGHT);
      const speed = 30 + Math.random() * 70;
      const rotDir = Math.random() > 0.5 ? 1 : -1;
      state.meteors.push({
        id: state.nextId++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: 0,
        rotationSpeed: (0.5 + Math.random() * 1.5) * rotDir,
        meteorType: randInt(METEOR_TYPE_COUNT),
        variant: randInt(16),
      });
      break;
    }
    case "update": {
      const dt = action.dt;
      for (const ship of state.ships) {
        ship.x += ship.vx * dt;
      }
      for (const m of state.meteors) {
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.rotation += m.rotationSpeed * dt;
      }
      const pad = 100;
      state.ships = state.ships.filter((s) => s.x <= CANVAS_WIDTH + 200);
      state.meteors = state.meteors.filter(
        (m) =>
          m.x >= -pad &&
          m.x <= CANVAS_WIDTH + pad &&
          m.y >= -pad &&
          m.y <= CANVAS_HEIGHT + pad
      );
      break;
    }
  }
}

export class GameStore {
  state: GameState;

  constructor() {
    this.state = { ships: [], meteors: [], nextId: 1 };
  }

  dispatch(action: GameAction): void {
    reduce(this.state, action);
  }
}
