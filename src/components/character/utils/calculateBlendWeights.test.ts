import { describe, expect, it } from 'vitest';
import { calculateBlendWeights } from './calculateBlendWeights';

const WALK = 1;
const RUN = 3.5;
const BACK = 0.6;

describe('calculateBlendWeights', () => {
  it('is fully idle when standing still', () => {
    expect(calculateBlendWeights(0, false, WALK, RUN, BACK)).toEqual({
      idle: 1,
      walk: 0,
      run: 0,
      back: 0,
    });
  });

  it('steps in place when rotating while stationary', () => {
    expect(calculateBlendWeights(0, true, WALK, RUN, BACK)).toEqual({
      idle: 0.3,
      walk: 0.7,
      run: 0,
      back: 0,
    });
  });

  it('blends idle into walk up to walk speed', () => {
    const halfway = calculateBlendWeights(WALK / 2, false, WALK, RUN, BACK);
    expect(halfway.idle).toBeCloseTo(0.5);
    expect(halfway.walk).toBeCloseTo(0.5);
    expect(halfway.run).toBe(0);
  });

  it('blends walk into run above walk speed', () => {
    const mid = calculateBlendWeights((WALK + RUN) / 2, false, WALK, RUN, BACK);
    expect(mid.walk).toBeCloseTo(0.5);
    expect(mid.run).toBeCloseTo(0.5);
    expect(mid.idle).toBe(0);
  });

  it('uses the back clip when moving backward', () => {
    const halfway = calculateBlendWeights(-BACK / 2, false, WALK, RUN, BACK);
    expect(halfway.back).toBeCloseTo(0.5);
    expect(halfway.idle).toBeCloseTo(0.5);
    expect(halfway.walk).toBe(0);
    expect(halfway.run).toBe(0);
  });
});
