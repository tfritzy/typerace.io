export function pickEdgeSpawn(
  width: number,
  height: number
): { x: number; y: number; angle: number } {
  const pad = 40;
  const fromLeft = Math.random() > 0.5;

  if (fromLeft) {
    return {
      x: -pad,
      y: Math.random() * height,
      angle: -Math.PI / 4 + (Math.random() * Math.PI) / 2,
    };
  }
  return {
    x: width + pad,
    y: Math.random() * height,
    angle: Math.PI - Math.PI / 4 + (Math.random() * Math.PI) / 2,
  };
}

export function randInt(max: number): number {
  return Math.floor(Math.random() * max);
}
