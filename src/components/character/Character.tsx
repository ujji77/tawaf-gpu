import { useRef, useEffect, Suspense } from 'react';
import { Group } from 'three';
import { CharacterProps } from './config';
import { useCharacterAssets } from './hooks/useCharacterAssets';
import { useCharacterPhysics } from './hooks/useCharacterPhysics';
import { useGameStore, CameraMode } from '../../core/store/gameStore';
import { CharacterAudio, CharacterAudioHandle } from './CharacterAudio';

export const Character = ({ position = [0, 0, 0], scale = 1, visible = true }: CharacterProps) => {
  const groupRef = useRef<Group>(null);
  const audioRef = useRef<CharacterAudioHandle>(null);

  const setCharacterRef = useGameStore((state) => state.setCharacterRef);
  const { scene, animations, helmets } = useCharacterAssets();

  // Get camera mode from store
  const cameraMode = useGameStore((state) => state.cameraMode);

  useCharacterPhysics(groupRef, scene, animations, (event) => {
    audioRef.current?.playStep(event.type, event.volume);
  });

  // Publish character ref to global store
  useEffect(() => {
    setCharacterRef(groupRef);
    return () => setCharacterRef(null);
  }, [setCharacterRef]);

  useEffect(() => {
    if (helmets && helmets.length > 0) {
      const shouldBeVisible = cameraMode !== CameraMode.FPV;
      helmets.forEach((helmet) => {
        helmet.visible = shouldBeVisible;
      });
    }
  }, [cameraMode, helmets]);

  if (!scene) return null;

  return (
    <group ref={groupRef} position={position} scale={scale} visible={visible && cameraMode !== CameraMode.FPV} dispose={null}>
      {scene && <primitive object={scene} />}

      <Suspense fallback={null}>
        <CharacterAudio ref={audioRef} />
      </Suspense>
    </group>
  );
};
