// src/ui/components/hooks/useFollowCamera.ts
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { Group } from 'three';
import { input } from '../../../core/input/controls';
import { FOLLOW_LOCK_POLAR, FOLLOW_LOOKAT_Y } from '../config';

const LOCK_IDLE_DELAY_MS = 1600;
const LOCK_TRACK_LAMBDA = 8;
const LOCK_RECENTER_LAMBDA = 2.4;

interface UseFollowCameraProps {
  characterRef: React.MutableRefObject<Group | null> | null;
  controlsRef: React.MutableRefObject<CameraControls | null>;
  enabled: boolean;
  viewLocked: boolean;
}

export function useFollowCamera({
  characterRef,
  controlsRef,
  enabled,
  viewLocked,
}: UseFollowCameraProps) {
  const lastOrbitAt = useRef(0);
  const userOrbited = useRef(false);

  useEffect(() => {
    if (!viewLocked) return;
    lastOrbitAt.current = 0;
    userOrbited.current = true;
  }, [viewLocked]);

  useFrame((_, delta) => {
    if (!enabled || !controlsRef.current || !characterRef?.current) return;

    const character = characterRef.current;
    const controls = controlsRef.current;
    const dt = Math.min(delta, 0.1);
    const { x, y, z } = character.position;

    controls.moveTo(x, y + FOLLOW_LOOKAT_Y, z, true);

    if (!viewLocked) return;

    const orbiting =
      input.isPressed('CameraLeft') ||
      input.isPressed('CameraRight') ||
      input.isPressed('CameraForward') ||
      input.isPressed('CameraBackward');

    if (orbiting) {
      lastOrbitAt.current = performance.now();
      userOrbited.current = true;
      return;
    }

    if (userOrbited.current && performance.now() - lastOrbitAt.current < LOCK_IDLE_DELAY_MS) {
      return;
    }

    const lambda = userOrbited.current ? LOCK_RECENTER_LAMBDA : LOCK_TRACK_LAMBDA;
    const t = 1 - Math.exp(-lambda * dt);

    const targetAzimuth = character.rotation.y + Math.PI;
    const azimuthDelta = Math.atan2(
      Math.sin(targetAzimuth - controls.azimuthAngle),
      Math.cos(targetAzimuth - controls.azimuthAngle)
    );
    const polarDelta = FOLLOW_LOCK_POLAR - controls.polarAngle;

    controls.azimuthAngle += azimuthDelta * t;
    controls.polarAngle += polarDelta * t;

    if (userOrbited.current && Math.abs(azimuthDelta) < 0.02 && Math.abs(polarDelta) < 0.02) {
      userOrbited.current = false;
    }
  });
}
