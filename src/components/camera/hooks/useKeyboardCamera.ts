import { useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { CameraMode } from '../../../core/store/gameStore';
import { input } from '../../../core/input/controls';

const ORBIT_SPEED = 1.4;
const PAN_SPEED = 12;
const ZOOM_SPEED = 10;
const BIRDS_EYE_ZOOM_SPEED = 36;

interface UseKeyboardCameraProps {
  controlsRef: React.MutableRefObject<CameraControls | null>;
  cameraMode: CameraMode;
  enabled: boolean;
}

export function useKeyboardCamera({
  controlsRef,
  cameraMode,
  enabled,
}: UseKeyboardCameraProps) {
  useFrame((_, delta) => {
    if (!enabled || !controlsRef.current) return;

    const controls = controlsRef.current;
    const dt = Math.min(delta, 0.1);

    const moveX =
      (input.isPressed('CameraRight') ? 1 : 0) -
      (input.isPressed('CameraLeft') ? 1 : 0);
    const moveY =
      (input.isPressed('CameraForward') ? 1 : 0) -
      (input.isPressed('CameraBackward') ? 1 : 0);
    const zoom =
      (input.isPressed('ZoomIn') ? 1 : 0) -
      (input.isPressed('ZoomOut') ? 1 : 0);

    if (moveX === 0 && moveY === 0 && zoom === 0) return;

    if (zoom !== 0) {
      const speed = cameraMode === CameraMode.BirdsEye ? BIRDS_EYE_ZOOM_SPEED : ZOOM_SPEED;
      controls.dolly(zoom * speed * dt, false);
    }

    if (moveX === 0 && moveY === 0) return;

    if (cameraMode === CameraMode.Follow) {
      controls.rotate(-moveX * ORBIT_SPEED * dt, -moveY * ORBIT_SPEED * dt, false);
      return;
    }

    const distance = Math.max(controls.distance, 6);
    const pan = distance * (PAN_SPEED / 10) * dt;

    if (moveY !== 0) controls.forward(moveY * pan, false);
    if (moveX !== 0) controls.truck(moveX * pan, 0, false);
  });
}
