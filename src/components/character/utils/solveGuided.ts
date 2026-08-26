import * as THREE from 'three/webgpu';
import { Group } from 'three';
import { PhysicsState } from '../config';
import { resolvePlayAreaCollision } from './collision';

const ARRIVE_DISTANCE = 0.55;
const TURN_RATE = 4.2;

const getShortestAngleDifference = (from: number, to: number) => {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
};

export const solveGuided = (
  group: Group,
  s: PhysicsState,
  delta: number,
  dest: { x: number; z: number },
  lookAt: { x: number; z: number },
  onArrive: () => void
) => {
  const dx = dest.x - group.position.x;
  const dz = dest.z - group.position.z;
  const dist = Math.hypot(dx, dz);

  if (dist < ARRIVE_DISTANCE) {
    const faceX = lookAt.x - group.position.x;
    const faceZ = lookAt.z - group.position.z;
    if (faceX * faceX + faceZ * faceZ > 0.01) {
      const faceYaw = Math.atan2(faceX, faceZ);
      group.rotation.y += getShortestAngleDifference(group.rotation.y, faceYaw) * Math.min(1, delta * TURN_RATE);
    }
    s.speed = THREE.MathUtils.lerp(s.speed, 0, s.speedLerpFactor);
    s.rotationVelocity = 0;
    if (Math.abs(s.speed) < 0.05) onArrive();
    resolvePlayAreaCollision(group);
    return;
  }

  const targetYaw = Math.atan2(dx, dz);
  const diff = getShortestAngleDifference(group.rotation.y, targetYaw);
  group.rotation.y += diff * Math.min(1, delta * TURN_RATE);

  const aligned = 1 - Math.min(Math.abs(diff) / 1.2, 1);
  const targetSpeed = s.runSpeed * (0.35 + 0.65 * aligned);
  s.speed = THREE.MathUtils.lerp(s.speed, targetSpeed, s.speedLerpFactor);

  if (Math.abs(s.speed) > 0.01) {
    group.translateZ(s.speed * delta);
  }

  s.rotationVelocity = 0;
  resolvePlayAreaCollision(group);
};
