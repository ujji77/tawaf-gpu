import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three/webgpu';
import { FLOOR_TILE_SIZE, FLOOR_GRID_RADIUS, FLOOR_TILE_INCLUDE_RADIUS } from '../core/worldConfig';

const MODEL_PATH = '/models/floor_whitetile_20x20_meters.glb';

useGLTF.preload(MODEL_PATH);

// The source glb is a 20x20m slab centered at (9, -0.013, -9) with its top surface at y=0.078;
// this recenters a single tile on the origin with the walkable surface at y=0.
const RECENTER_OFFSET: [number, number, number] = [-9, -0.078, 9];

interface TileSlot {
  key: string;
  position: [number, number, number];
}

const TILE_SLOTS: TileSlot[] = (() => {
  const slots: TileSlot[] = [];
  for (let gx = -FLOOR_GRID_RADIUS; gx <= FLOOR_GRID_RADIUS; gx++) {
    for (let gz = -FLOOR_GRID_RADIUS; gz <= FLOOR_GRID_RADIUS; gz++) {
      const x = gx * FLOOR_TILE_SIZE;
      const z = gz * FLOOR_TILE_SIZE;
      if (Math.hypot(x, z) > FLOOR_TILE_INCLUDE_RADIUS) continue;
      slots.push({
        key: `${gx}_${gz}`,
        position: [RECENTER_OFFSET[0] + x, RECENTER_OFFSET[1], RECENTER_OFFSET[2] + z],
      });
    }
  }
  return slots;
})();

export function Floor({ visible = true }: { visible?: boolean }) {
  const { scene } = useGLTF(MODEL_PATH);

  const clones = useMemo(
    () => TILE_SLOTS.map((slot) => ({ ...slot, object: scene.clone(true) as THREE.Object3D })),
    [scene]
  );

  return (
    <group visible={visible}>
      {clones.map(({ key, position, object }) => (
        <primitive key={key} object={object} position={position} />
      ))}
    </group>
  );
}
