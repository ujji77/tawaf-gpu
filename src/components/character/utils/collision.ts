import { Group } from 'three';
import { KAABA_COLLISION_RADIUS, FLOOR_BOUNDARY_RADIUS } from '../../../core/worldConfig';

/**
 * Keeps the character out of the Kaaba's footprint and inside the tiled play area.
 * Both are treated as simple circles centered on the origin.
 */
export const resolvePlayAreaCollision = (group: Group) => {
  const { x, z } = group.position;
  const dist = Math.hypot(x, z);

  if (dist < KAABA_COLLISION_RADIUS && dist > 1e-5) {
    const scale = KAABA_COLLISION_RADIUS / dist;
    group.position.x = x * scale;
    group.position.z = z * scale;
  } else if (dist > FLOOR_BOUNDARY_RADIUS) {
    const scale = FLOOR_BOUNDARY_RADIUS / dist;
    group.position.x = x * scale;
    group.position.z = z * scale;
  }
};
