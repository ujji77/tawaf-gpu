// src/ui/components/hooks/useFollowCamera.ts
import { useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { Group } from 'three';

interface UseFollowCameraProps {
  characterRef: React.MutableRefObject<Group | null> | null;
  controlsRef: React.MutableRefObject<CameraControls | null>;
  enabled: boolean;
}

export function useFollowCamera({
  characterRef,
  controlsRef,
  enabled,
}: UseFollowCameraProps) {
  useFrame(() => {
    if (!enabled || !controlsRef.current || !characterRef?.current) return;

    const { x, y, z } = characterRef.current.position;
    controlsRef.current.moveTo(x, y + 1.0, z, true);
  });
}
