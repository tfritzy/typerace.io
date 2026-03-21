export function noiseHash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = ((h ^ (h >> 13)) * 1274126177) | 0;
  return ((h ^ (h >> 16)) & 0xff) / 255;
}

export function valueNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const v00 = noiseHash(ix, iy);
  const v10 = noiseHash(ix + 1, iy);
  const v01 = noiseHash(ix, iy + 1);
  const v11 = noiseHash(ix + 1, iy + 1);
  return (v00 * (1 - sx) + v10 * sx) * (1 - sy) +
    (v01 * (1 - sx) + v11 * sx) * sy;
}
