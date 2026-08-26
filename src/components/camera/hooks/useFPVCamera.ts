import { useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, Vector3, Quaternion, Euler, MathUtils, Object3D, SkinnedMesh } from 'three';
import { useControls } from 'leva';
import { useGameStore } from '../../../core/store/gameStore';

interface UseFPVCameraOptions {
  characterRef: React.MutableRefObject<Group | null> | null;
  boneName: string;
  enabled: boolean;
}

export function useFPVCamera({
  characterRef,
  boneName,
  enabled,
}: UseFPVCameraOptions) {
  const { camera } = useThree();
  const isMobile = useGameStore((state) => state.isMobile);

  const targetBone = useRef<Object3D | undefined>(undefined);

  const pcTargetRotation = useRef({ x: 0, y: 0 });
  const mobileRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const lastTouchRef = useRef<{ x: number, y: number } | null>(null);

  const { vec3, quat, dummyEuler, mouseQuat, offsetVec } = useMemo(() => ({
    vec3: new Vector3(),
    quat: new Quaternion(),
    dummyEuler: new Euler(),
    mouseQuat: new Quaternion(),
    offsetVec: new Vector3(),
  }), []);

  const config = useControls('FPV Settings', {
    offsetX: { value: 0, min: -2, max: 2, step: 0.01 },
    offsetY: { value: 0.12, min: -2, max: 2, step: 0.01 },
    offsetZ: { value: -0.12, min: -2, max: 2, step: 0.01 },
    mouseRotationSmoothing: { value: 0.1, min: 0.01, max: 1, step: 0.01 },
    touchSensitivity: { value: 0.005, min: 0.001, max: 0.02, step: 0.001 },
  }, { collapsed: true });

  useEffect(() => {
    targetBone.current = undefined;
  }, [characterRef, boneName, enabled]);

  useEffect(() => {
    if (!enabled || isMobile) return;

    const onMouseMove = (e: MouseEvent) => {
      const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      const ndcY = (e.clientY / window.innerHeight) * 2 - 1;

      pcTargetRotation.current.x = MathUtils.degToRad(MathUtils.mapLinear(ndcX, -1, 1, 150, -150));
      pcTargetRotation.current.y = MathUtils.degToRad(MathUtils.mapLinear(ndcY, -1, 1, 90, -30));
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [enabled, isMobile]);

  useEffect(() => {
    if (!enabled || !isMobile) return;

    const isValidTouchArea = (t: Touch) => {
      const isJoystickArea = (t.clientX < window.innerWidth * 0.4) && (t.clientY > window.innerHeight * 0.4);
      const isSideBarArea = (t.clientX > window.innerWidth * 0.85) && (t.clientY < window.innerHeight * 0.2);
      return !isJoystickArea && !isSideBarArea;
    };

    const onTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        if (isValidTouchArea(t)) {
          lastTouchRef.current = { x: t.clientX, y: t.clientY };
          break;
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();

      let activeTouch: Touch | null = null;

      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        if (isValidTouchArea(t)) {
          activeTouch = t;
          break;
        }
      }

      if (activeTouch && lastTouchRef.current) {
        const deltaX = activeTouch.clientX - lastTouchRef.current.x;
        const deltaY = activeTouch.clientY - lastTouchRef.current.y;

        mobileRotation.current.x -= deltaX * config.touchSensitivity;
        mobileRotation.current.y -= deltaY * config.touchSensitivity;

        mobileRotation.current.y = MathUtils.clamp(mobileRotation.current.y, -Math.PI / 3, Math.PI / 3);

        lastTouchRef.current = { x: activeTouch.clientX, y: activeTouch.clientY };
      }
    };

    const onTouchEnd = () => {
      lastTouchRef.current = null;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [enabled, isMobile, config.touchSensitivity]);

  useFrame(() => {
    if (!enabled || !characterRef?.current) return;

    const character = characterRef.current;
    character.updateMatrixWorld(true);

    if (!targetBone.current || !isDescendantOf(targetBone.current, character)) {
      targetBone.current = findHeadBone(character, boneName);
    }

    if (targetBone.current) {
      targetBone.current.getWorldPosition(vec3);
    } else {
      character.getWorldPosition(vec3);
      vec3.y += 1.6;
    }

    // Walk direction is group local +Z; Three.js cameras look down -Z.
    character.getWorldQuaternion(quat);
    dummyEuler.setFromQuaternion(quat, 'YXZ');
    dummyEuler.x = 0;
    dummyEuler.z = 0;
    dummyEuler.y += Math.PI;
    quat.setFromEuler(dummyEuler);

    if (isMobile) {
      currentRotation.current.x = mobileRotation.current.x;
      currentRotation.current.y = mobileRotation.current.y;
    } else {
      currentRotation.current.x = MathUtils.lerp(
        pcTargetRotation.current.x,
        currentRotation.current.x,
        config.mouseRotationSmoothing
      );
      currentRotation.current.y = MathUtils.lerp(
        pcTargetRotation.current.y,
        currentRotation.current.y,
        config.mouseRotationSmoothing
      );
    }

    dummyEuler.set(currentRotation.current.y, currentRotation.current.x, 0, 'YXZ');
    mouseQuat.setFromEuler(dummyEuler);
    quat.multiply(mouseQuat);

    offsetVec.set(config.offsetX, config.offsetY, config.offsetZ);
    offsetVec.applyQuaternion(quat);
    vec3.add(offsetVec);

    camera.position.copy(vec3);
    camera.quaternion.copy(quat);
    camera.updateMatrixWorld(true);
  });
}

function isDescendantOf(node: Object3D, root: Object3D): boolean {
  let ancestor: Object3D | null = node;
  while (ancestor) {
    if (ancestor === root) return true;
    ancestor = ancestor.parent;
  }
  return false;
}

function isHeadName(name: string) {
  if (!name) return false;
  if (/headtop|_end/i.test(name)) return false;
  return /head/i.test(name);
}

function findHeadBone(character: Group, preferredName: string): Object3D | undefined {
  const exact = character.getObjectByName(preferredName);
  if (exact) return exact;

  let fromSkeleton: Object3D | undefined;
  character.traverse((obj) => {
    if (fromSkeleton) return;
    const mesh = obj as SkinnedMesh;
    if (!mesh.isSkinnedMesh || !mesh.skeleton) return;

    const named = mesh.skeleton.getBoneByName(preferredName);
    if (named) {
      fromSkeleton = named;
      return;
    }

    fromSkeleton = mesh.skeleton.bones.find((bone) => isHeadName(bone.name));
  });
  if (fromSkeleton) return fromSkeleton;

  let byName: Object3D | undefined;
  character.traverse((obj) => {
    if (!byName && isHeadName(obj.name)) byName = obj;
  });
  return byName;
}
