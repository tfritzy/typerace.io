import { describe, expect, it } from "vitest";
import { followPoint, type Point } from "./smoothMotion";

const simulate = (fps: number, durationMs: number) => {
  const frameMs = 1000 / fps;
  const point: Point = { x: 0, y: 0 };
  const target = { x: 100, y: 50 };

  for (let elapsed = 0; elapsed < durationMs; elapsed += frameMs) {
    followPoint(
      point,
      target,
      Math.min(frameMs, durationMs - elapsed),
    );
  }

  return point;
};

describe("followPoint", () => {
  it("moves the same distance regardless of frame rate", () => {
    const at60Fps = simulate(60, 50);
    const at144Fps = simulate(144, 50);

    expect(at60Fps.x).toBeCloseTo(at144Fps.x, 10);
    expect(at60Fps.y).toBeCloseTo(at144Fps.y, 10);
  });

  it("does not move when no time has elapsed", () => {
    const point = { x: 10, y: 20 };
    followPoint(point, { x: 100, y: 200 }, 0);
    expect(point).toEqual({ x: 10, y: 20 });
  });

  it("settles exactly on the target", () => {
    const point = { x: 99.9, y: 49.9 };
    followPoint(point, { x: 100, y: 50 }, 16);
    expect(point).toEqual({ x: 100, y: 50 });
  });
});
