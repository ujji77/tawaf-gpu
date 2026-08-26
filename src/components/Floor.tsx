import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three/webgpu';
import { FLOOR_TILE_SIZE, FLOOR_GRID_RADIUS, FLOOR_TILE_INCLUDE_RADIUS } from '../core/worldConfig';

const MODEL_PATH = '/models/floor_whitetile_20x20_meters.glb';

useGLTF.preload(MODEL_PATH);

// The source glb is a 20x20m slab centered at (9, -0.013, -9) with its top surface at y=0.078;
// baking this into the geometry recenters a tile on the origin with the walkable surface at y=0.
const RECENTER_OFFSET = new THREE.Vector3(-9, -0.078, 9);

const TILE_POSITIONS: THREE.Vector3[] = (() => {
  const slots: THREE.Vector3[] = [];
  for (let gx = -FLOOR_GRID_RADIUS; gx <= FLOOR_GRID_RADIUS; gx++) {
    for (let gz = -FLOOR_GRID_RADIUS; gz <= FLOOR_GRID_RADIUS; gz++) {
      const x = gx * FLOOR_TILE_SIZE;
      const z = gz * FLOOR_TILE_SIZE;
      if (Math.hypot(x, z) > FLOOR_TILE_INCLUDE_RADIUS) continue;
      slots.push(new THREE.Vector3(x, 0, z));
    }
  }
  return slots;
})();

export function Floor({ visible = true }: { visible?: boolean }) {
  const { scene } = useGLTF(MODEL_PATH);

  const mesh = useMemo(() => {
    scene.updateMatrixWorld(true);

    let source: THREE.Mesh | null = null;
    scene.traverse((child) => {
      if (!source && (child as THREE.Mesh).isMesh) {
        source = child as THREE.Mesh;
      }
    });
    if (!source) {
      throw new Error(`Floor GLB has no mesh: ${MODEL_PATH}`);
    }

    const geometry = source.geometry.clone();
    geometry.applyMatrix4(source.matrixWorld);
    geometry.applyMatrix4(
      new THREE.Matrix4().makeTranslation(RECENTER_OFFSET.x, RECENTER_OFFSET.y, RECENTER_OFFSET.z)
    );

    const instanced = new THREE.InstancedMesh(geometry, source.material, TILE_POSITIONS.length);
    const dummy = new THREE.Object3D();
    TILE_POSITIONS.forEach((pos, i) => {
      dummy.position.copy(pos);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    });
    instanced.instanceMatrix.needsUpdate = true;
    instanced.computeBoundingSphere();
    return instanced;
  }, [scene]);

  return <primitive object={mesh} visible={visible} />;
}
