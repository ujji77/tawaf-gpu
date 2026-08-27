import { describe, expect, it } from 'vitest';
import { KAABA_COLLISION_RADIUS } from '../../core/worldConfig';
import { getHotspot, HOTSPOTS, nextHotspotId, type HotspotId } from './config';

const TAWAF_ORDER: HotspotId[] = [
  'black-stone',
  'kaaba-door',
  'maqam-ibrahim',
  'hijr-ismail',
  'yemeni-corner',
];

describe('HOTSPOTS', () => {
  it('lists the five tawaf stops in circuit order', () => {
    expect(HOTSPOTS.map((site) => site.id)).toEqual(TAWAF_ORDER);
  });

  it('stands every pilgrim outside the Kaaba collision circle', () => {
    for (const site of HOTSPOTS) {
      const dist = Math.hypot(site.position[0], site.position[2]);
      expect(dist).toBeGreaterThan(KAABA_COLLISION_RADIUS);
    }
  });

  it('gives every stop a title, body, look-at, and trigger radius', () => {
    for (const site of HOTSPOTS) {
      expect(site.title.length).toBeGreaterThan(0);
      expect(site.body.length).toBeGreaterThan(0);
      expect(site.radius).toBeGreaterThan(0);
      expect(site.lookAt).toHaveLength(3);
    }
  });
});

describe('getHotspot', () => {
  it('returns the stop for a known id', () => {
    expect(getHotspot('black-stone')?.title).toBe('The Black Stone');
  });

  it('returns undefined for a missing or empty id', () => {
    expect(getHotspot(null)).toBeUndefined();
    expect(getHotspot('not-a-site')).toBeUndefined();
  });
});

describe('nextHotspotId', () => {
  it('starts at the Black Stone when N is pressed with no current stop', () => {
    expect(nextHotspotId(null, 1)).toBe('black-stone');
  });

  it('starts at the Yemeni Corner when P is pressed with no current stop', () => {
    expect(nextHotspotId(null, -1)).toBe('yemeni-corner');
  });

  it('walks the circuit forward and wraps', () => {
    expect(nextHotspotId('black-stone', 1)).toBe('kaaba-door');
    expect(nextHotspotId('yemeni-corner', 1)).toBe('black-stone');
  });

  it('walks the circuit backward and wraps', () => {
    expect(nextHotspotId('kaaba-door', -1)).toBe('black-stone');
    expect(nextHotspotId('black-stone', -1)).toBe('yemeni-corner');
  });
});
