import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three/webgpu';

const MODEL_PATH = '/models/kaaba_in_mecca.glb';

useGLTF.preload(MODEL_PATH);

// Stray disjoint backdrop plane left over from the source scan (unrelated to the building).
const ARTIFACT_NODE_NAME = 'Plane.002';

export function Kaaba({ visible = true }: { visible?: boolean }) {
  const { scene } = useGLTF(MODEL_PATH);

  const clone = useMemo(() => {
    const cloned = scene.clone(true) as THREE.Object3D;
    cloned.getObjectByName(ARTIFACT_NODE_NAME)?.removeFromParent();
    return cloned;
  }, [scene]);

  return (
    <group visible={visible}>
      <primitive object={clone} />
    </group>
  );
}
