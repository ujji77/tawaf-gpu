import { describe, expect, it } from 'vitest';
import {
  CHARACTER_SPAWN_POSITION,
  FLOOR_BOUNDARY_RADIUS,
  FLOOR_GRID_RADIUS,
  FLOOR_TILE_INCLUDE_RADIUS,
  FLOOR_TILE_SIZE,
  KAABA_COLLISION_RADIUS,
} from './worldConfig';

describe('worldConfig', () => {
  it('spawns the pilgrim just outside the Kaaba on the left wall', () => {
    const [x, y, z] = CHARACTER_SPAWN_POSITION;
    expect(y).toBe(0);
    expect(z).toBe(0);
    expect(x).toBe(-(KAABA_COLLISION_RADIUS + 1));
    expect(Math.hypot(x, z)).toBeGreaterThan(KAABA_COLLISION_RADIUS);
  });

  it('keeps the play-area wall past the tiled plaza', () => {
    expect(FLOOR_BOUNDARY_RADIUS).toBeGreaterThan(FLOOR_TILE_INCLUDE_RADIUS);
    expect(FLOOR_TILE_INCLUDE_RADIUS).toBeGreaterThan(FLOOR_TILE_SIZE);
    expect(FLOOR_GRID_RADIUS).toBe(2);
  });
});
