import { describe, expect, it } from 'vitest';
import type { Group } from 'three';
import { FLOOR_BOUNDARY_RADIUS, KAABA_COLLISION_RADIUS } from '../../../core/worldConfig';
import { resolvePlayAreaCollision } from './collision';

function pawn(x: number, z: number) {
  return { position: { x, y: 0, z } } as Group;
}

function dist(group: Group) {
  return Math.hypot(group.position.x, group.position.z);
}

describe('resolvePlayAreaCollision', () => {
  it('pushes a pawn out of the Kaaba onto the collision circle', () => {
    const group = pawn(-1, 0);
    resolvePlayAreaCollision(group);
    expect(dist(group)).toBeCloseTo(KAABA_COLLISION_RADIUS, 5);
    expect(group.position.x).toBeLessThan(0);
    expect(group.position.z).toBeCloseTo(0, 5);
  });

  it('pulls a pawn back from beyond the plaza edge', () => {
    const group = pawn(0, 80);
    resolvePlayAreaCollision(group);
    expect(dist(group)).toBeCloseTo(FLOOR_BOUNDARY_RADIUS, 5);
    expect(group.position.x).toBeCloseTo(0, 5);
    expect(group.position.z).toBeGreaterThan(0);
  });

  it('leaves a pawn on the mataf alone', () => {
    const group = pawn(-(KAABA_COLLISION_RADIUS + 1), 0);
    const { x, z } = group.position;
    resolvePlayAreaCollision(group);
    expect(group.position.x).toBe(x);
    expect(group.position.z).toBe(z);
  });
});
