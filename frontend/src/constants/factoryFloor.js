/** World-space factory floor bounds (XZ). Y is floor at 0 for machine roots. */
export const FLOOR_HALF_EXTENT = 14;
export const GRID_SNAP = 0.5;
export const MACHINE_Y = 0;

export function snapToGrid(value, step = GRID_SNAP) {
  return Math.round(value / step) * step;
}

export function clampToFloor(x, z) {
  const h = FLOOR_HALF_EXTENT;
  return [
    Math.min(h, Math.max(-h, x)),
    MACHINE_Y,
    Math.min(h, Math.max(-h, z)),
  ];
}

export function snapPositionOnFloor(x, z) {
  return clampToFloor(snapToGrid(x), snapToGrid(z));
}
