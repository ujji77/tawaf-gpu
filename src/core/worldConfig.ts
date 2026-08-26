// Shared layout constants for the Kaaba plaza scene (floor tiling, collision boundaries).

// The Kaaba's core structure (kaaba_in_mecca.glb) is roughly a 9.4x9.4m square centered at
// the origin. Use its circumscribed-circle radius (plus a small buffer) so the collision
// boundary never lets the character clip into a corner.
export const KAABA_COLLISION_RADIUS = 6.8;

// Opening camera looks toward -Z, so the Kaaba's left wall is the -X face.
export const CHARACTER_SPAWN_POSITION: [number, number, number] = [
  -(KAABA_COLLISION_RADIUS + 1),
  0,
  0,
];

// floor_whitetile_20x20_meters.glb tiles repeated in a grid, centered on the origin.
export const FLOOR_TILE_SIZE = 20;
export const FLOOR_GRID_RADIUS = 2; // tiles span -2..2 on each axis (5x5 grid)
export const FLOOR_TILE_INCLUDE_RADIUS = 45; // tile-center cutoff, trims the grid into a rounded plaza
export const FLOOR_BOUNDARY_RADIUS = 48; // invisible play-area barrier, just past the tiled edge
