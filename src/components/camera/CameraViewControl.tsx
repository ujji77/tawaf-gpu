import { useGameStore, CameraMode } from '../../core/store/gameStore';
import { CameraControls, CameraControlsImpl } from '@react-three/drei';
import { useFPVCamera } from './hooks/useFPVCamera';
import { useFollowCamera } from './hooks/useFollowCamera';
import { useKeyboardCamera } from './hooks/useKeyboardCamera';
import { HEAD_BONE_NAME } from '../character/config';
import {
  CAMERA_POSITION,
  CAMERA_LOOKAT,
  FOLLOW_LOOKAT_Y,
  FOLLOW_LOCK_AZIMUTH_OFFSET,
  FOLLOW_LOCK_DISTANCE,
  FOLLOW_LOCK_HEIGHT,
  BIRDS_EYE_POSITION,
  BIRDS_EYE_LOOKAT,
  BIRDS_EYE_POLAR,
  BIRDS_EYE_MIN_DISTANCE,
  BIRDS_EYE_MAX_DISTANCE,
} from './config';
import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three/webgpu';

type Props = {
  boneName?: string;
};

export function CameraViewControl({ boneName = HEAD_BONE_NAME }: Props) {
  const cameraMode = useGameStore((state) => state.cameraMode);
  const isViewLocked = useGameStore((state) => state.isViewLocked);
  const characterRef = useGameStore((state) => state.characterRef);
  const isGameLoaded = useGameStore((state) => state.isGameStarted);
  const isControlEnabled = useGameStore((state) => state.isControlEnabled);
  const setControlEnabled = useGameStore((state) => state.setControlEnabled);

  const controlsRef = useRef<CameraControls>(null);
  const isBirdsEye = cameraMode === CameraMode.BirdsEye;
  const keyboardEnabled =
    isControlEnabled &&
    cameraMode !== CameraMode.FPV;

  useFPVCamera({
    characterRef,
    boneName,
    enabled: cameraMode === CameraMode.FPV && isControlEnabled,
  });

  useFollowCamera({
    characterRef,
    controlsRef,
    enabled: cameraMode === CameraMode.Follow && isControlEnabled,
    viewLocked: isViewLocked,
  });

  useKeyboardCamera({
    controlsRef,
    cameraMode,
    enabled: keyboardEnabled,
  });

  const resetCamera = useCallback((earlyStop: boolean = true) => {
    if (!characterRef?.current || !controlsRef.current) return Promise.resolve();

    const character = characterRef.current;
    const { cameraMode, isViewLocked } = useGameStore.getState();
    const { pos, lookAt } =
      cameraMode === CameraMode.Follow && isViewLocked
        ? lockedFollowLookAt(character)
        : {
            pos: character.position.clone().add(CAMERA_POSITION),
            lookAt: character.position.clone().add(CAMERA_LOOKAT),
          };

    const controls = controlsRef.current;
    const originalThreshold = controls.restThreshold;
    controls.restThreshold = earlyStop ? 0.05 : originalThreshold;
    disablePointerControls(controls);

    return controls.setLookAt(
      pos.x, pos.y, pos.z,
      lookAt.x, lookAt.y, lookAt.z,
      true
    ).then(() => {
      if (controlsRef.current) {
        controlsRef.current.restThreshold = originalThreshold;
      }
    });
  }, [characterRef]);

  const applyBirdsEye = useCallback((earlyStop: boolean = false) => {
    if (!controlsRef.current) return Promise.resolve();

    const controls = controlsRef.current;
    const originalThreshold = controls.restThreshold;
    controls.restThreshold = earlyStop ? 0.05 : originalThreshold;
    disablePointerControls(controls);

    return controls.setLookAt(
      BIRDS_EYE_POSITION.x, BIRDS_EYE_POSITION.y, BIRDS_EYE_POSITION.z,
      BIRDS_EYE_LOOKAT.x, BIRDS_EYE_LOOKAT.y, BIRDS_EYE_LOOKAT.z,
      true
    ).then(() => {
      if (controlsRef.current) {
        controlsRef.current.restThreshold = originalThreshold;
      }
    });
  }, []);

  // initial sequence, reset camera to locked follow
  useEffect(() => {
    if (isGameLoaded && !isControlEnabled) {
      document.body.style.cursor = 'wait';

      let isMounted = true;

      resetCamera(true).then(() => {
        if (isMounted) {
          setControlEnabled(true);
          document.body.style.cursor = 'default';
        }
      });

      return () => {
        isMounted = false;
        document.body.style.cursor = 'default';
      };
    }
  }, [isGameLoaded, isControlEnabled, resetCamera, setControlEnabled]);

  useEffect(() => {
    if (!isControlEnabled || cameraMode === CameraMode.FPV) return;

    if (cameraMode === CameraMode.BirdsEye) {
      applyBirdsEye(false);
    } else {
      resetCamera(false);
    }
  }, [cameraMode, isControlEnabled, resetCamera, applyBirdsEye]);

  // CameraControls keeps applying its own damped transform to the camera every frame even
  // when `enabled={false}` (that prop only gates its pointer listeners) - it has to be fully
  // unmounted in FPV, otherwise it fights useFPVCamera and silently overwrites its transform.
  if (cameraMode === CameraMode.FPV) return null;

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      enabled={false}
      minDistance={isBirdsEye ? BIRDS_EYE_MIN_DISTANCE : 2}
      maxDistance={isBirdsEye ? BIRDS_EYE_MAX_DISTANCE : 20}
      minPolarAngle={isBirdsEye ? BIRDS_EYE_POLAR : 0}
      maxPolarAngle={isBirdsEye ? BIRDS_EYE_POLAR : Math.PI / 2}
      polarRotateSpeed={isBirdsEye ? 0 : 1}
      smoothTime={isControlEnabled ? (isBirdsEye ? 0.25 : 0.1) : 1}
    />
  );
}

function lockedFollowLookAt(character: THREE.Object3D) {
  const azimuth = character.rotation.y + FOLLOW_LOCK_AZIMUTH_OFFSET;
  const heightDelta = FOLLOW_LOCK_HEIGHT - FOLLOW_LOOKAT_Y;
  const horiz = Math.sqrt(Math.max(FOLLOW_LOCK_DISTANCE ** 2 - heightDelta ** 2, 0.01));
  const { x, y, z } = character.position;

  return {
    pos: new THREE.Vector3(
      x + Math.sin(azimuth) * horiz,
      y + FOLLOW_LOCK_HEIGHT,
      z + Math.cos(azimuth) * horiz
    ),
    lookAt: new THREE.Vector3(x, y + FOLLOW_LOOKAT_Y, z),
  };
}

function disablePointerControls(controls: CameraControls) {
  const none = CameraControlsImpl.ACTION.NONE;
  controls.mouseButtons.left = none;
  controls.mouseButtons.right = none;
  controls.mouseButtons.middle = none;
  controls.mouseButtons.wheel = none;
  controls.touches.one = none;
  controls.touches.two = none;
  controls.touches.three = none;
}
