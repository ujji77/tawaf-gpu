import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three/webgpu';

const MODEL_PATH = '/models/kaaba_in_mecca.glb';

useGLTF.preload(MODEL_PATH);

export function Kaaba({ visible = true }: { visible?: boolean }) {
  const { scene } = useGLTF(MODEL_PATH);

  const clone = useMemo(() => scene.clone(true) as THREE.Object3D, [scene]);

  return (
    <group visible={visible}>
      <primitive object={clone} />
    </group>
  );
}
