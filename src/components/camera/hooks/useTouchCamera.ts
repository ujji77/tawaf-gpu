import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import { CameraMode } from '../../../core/store/gameStore';
import { cameraDragState } from '../cameraDragState';

// Radians of orbit per pixel dragged. Tuned to feel roughly 1:1 with the scene.
const TOUCH_ORBIT_SENSITIVITY = 0.0045;
const DRAG_GRACE_MS = 250;

interface UseTouchCameraProps {
  controlsRef: React.MutableRefObject<CameraControls | null>;
  cameraMode: CameraMode;
  enabled: boolean;
}

/**
 * Drag anywhere outside the joystick / sidebar to orbit the camera on touch
 * devices. FPV already has its own look gesture; this covers the Follow,
 * Detached and Bird's-eye modes, which otherwise only respond to a keyboard.
 */
export function useTouchCamera({ controlsRef, cameraMode, enabled }: UseTouchCameraProps) {
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const pending = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    // Keep clear of the movement joystick (bottom-left) and the sidebar
    // (top-right) - same carve-outs the FPV look gesture uses.
    const isValidTouchArea = (t: Touch) => {
      const isJoystickArea =
        t.clientX < window.innerWidth * 0.4 && t.clientY > window.innerHeight * 0.4;
      const isSideBarArea =
        t.clientX > window.innerWidth * 0.85 && t.clientY < window.innerHeight * 0.2;
      return !isJoystickArea && !isSideBarArea;
    };

    const pickTouch = (touches: TouchList) => {
      for (let i = 0; i < touches.length; i++) {
        if (isValidTouchArea(touches[i])) return touches[i];
      }
      return null;
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = pickTouch(e.touches);
      if (t) lastTouch.current = { x: t.clientX, y: t.clientY };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!lastTouch.current) return;
      const t = pickTouch(e.touches);
      if (!t) return;

      if (e.cancelable) e.preventDefault();

      pending.current.x += t.clientX - lastTouch.current.x;
      pending.current.y += t.clientY - lastTouch.current.y;
      lastTouch.current = { x: t.clientX, y: t.clientY };
      cameraDragState.activeUntil = performance.now() + DRAG_GRACE_MS;
    };

    const onTouchEnd = () => {
      lastTouch.current = null;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchEnd);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      lastTouch.current = null;
      pending.current.x = 0;
      pending.current.y = 0;
    };
  }, [enabled]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!enabled || !controls) return;

    const { x, y } = pending.current;
    if (x === 0 && y === 0) return;
    pending.current.x = 0;
    pending.current.y = 0;

    // Bird's-eye locks the polar angle, so only spin the azimuth there.
    const polar = cameraMode === CameraMode.BirdsEye ? 0 : -y * TOUCH_ORBIT_SENSITIVITY;
    controls.rotate(-x * TOUCH_ORBIT_SENSITIVITY, polar, false);
  });
}
