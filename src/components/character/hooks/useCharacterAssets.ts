import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import * as THREE from 'three/webgpu';
import { MODEL_PATHS } from '../config';

const findClip = (clips: THREE.AnimationClip[], match: string, name: string): THREE.AnimationClip | null => {
  const source = clips.find((clip) => clip.name.toLowerCase().includes(match));
  if (!source) return null;

  const clip = source.clone();
  clip.name = name;
  return clip;
};

// No idle clip ships with the model, so hold the first frame of the walk cycle as a static pose.
const createFreezeFrameClip = (source: THREE.AnimationClip, name: string): THREE.AnimationClip => {
  const tracks = source.tracks.map((track) => {
    const TrackType = track.constructor as new (name: string, times: ArrayLike<number>, values: ArrayLike<number>) => THREE.KeyframeTrack;
    const itemSize = track.values.length / track.times.length;
    return new TrackType(track.name, [0], track.values.slice(0, itemSize));
  });
  return new THREE.AnimationClip(name, 0, tracks);
};

export function useCharacterAssets() {
  const [meshData] = useGLTF(MODEL_PATHS);

  const mesh = meshData.scene;

  const { scene, animations, helmets } = useMemo((): { scene: THREE.Object3D | null; animations: THREE.AnimationClip[]; helmets: THREE.Mesh[] } => {

    if (!mesh) return { scene: null, animations: [], helmets: [] };

    const clonedScene = SkeletonUtils.clone(mesh as any);

    // The model ships its own baked-in materials/textures; nothing further to configure per-mesh.
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.frustumCulled = false;
      }
    });

    // --- Animations Setup ---
    const walkClip = findClip(meshData.animations, 'walking', 'Walk');
    const runClip = findClip(meshData.animations, 'running', 'Run');
    const idleClip = walkClip ? createFreezeFrameClip(walkClip, 'Idle') : null;

    const anims = [idleClip, walkClip, runClip].filter(
      (clip): clip is THREE.AnimationClip => clip !== null
    );

    return { scene: clonedScene, animations: anims, helmets: [] };
  }, [mesh, meshData.animations]);

  return { scene, animations, helmets };
}
