import { KAABA_COLLISION_RADIUS } from '../../core/worldConfig';

export type HotspotId = 'black-stone' | 'kaaba-door' | 'maqam-ibrahim' | 'hijr-ismail' | 'yemeni-corner';

export interface Hotspot {
  id: HotspotId;
  title: string;
  subtitle: string;
  body: string;
  /** Where the character stands. */
  position: [number, number, number];
  /** Point the character faces on arrival. */
  lookAt: [number, number, number];
  radius: number;
}

const STAND = KAABA_COLLISION_RADIUS + 1.4;

function radial(x: number, z: number, minR: number): [number, number, number] {
  const len = Math.hypot(x, z) || 1;
  const r = Math.max(minR, len);
  return [(x / len) * r, 0, (z / len) * r];
}

/**
 * Stand-off points from named nodes on kaaba_in_mecca.glb
 * (Sketchfab scale ~0.007365, Y-up):
 * - Sphere / Hajjar Aswad
 * - Cube.003–004 / Kabaa Door
 * - Sphere.001 / SoI (Station of Ibrahim)
 * - Cylinder.004 / Hijr Ismail (Hateem)
 */
export const HOTSPOTS: Hotspot[] = [
  {
    id: 'black-stone',
    title: 'The Black Stone',
    subtitle: 'al-Hajar al-Aswad',
    body: 'Set in the eastern corner of the Kaaba. Tawaf begins and ends here. Pilgrims kiss, touch, or raise a hand toward it as they pass.',
    position: radial(-4.9, 4.91, STAND),
    lookAt: [-4.9, 1.4, 4.91],
    radius: 3.4,
  },
  {
    id: 'kaaba-door',
    title: 'The Kaaba Door',
    subtitle: 'Bab al-Kaaba',
    body: 'The gold door stands on the northeast wall, raised above the mataf. The stretch between the door and the Black Stone is the Multazam.',
    position: radial(-1.87, 4.68, STAND),
    lookAt: [-1.87, 2.2, 4.68],
    radius: 3.4,
  },
  {
    id: 'maqam-ibrahim',
    title: 'Maqam Ibrahim',
    subtitle: 'Station of Abraham',
    body: 'A glass pavilion facing the door, holding the stone said to bear Ibrahim\'s footprints. Two rak\'ahs are prayed behind it after tawaf.',
    position: [0.52, 0, 12.2],
    lookAt: [0, 1.5, 0],
    radius: 3.6,
  },
  {
    id: 'hijr-ismail',
    title: 'Hijr Ismail',
    subtitle: 'Hateem · House of Ismail',
    body: 'The white marble semicircle on the northwest side. It marks ground once inside the Kaaba, linked to Hajar and Ismail. Tawaf passes around it, not through it.',
    position: [9.6, 0, 0],
    lookAt: [8.2, 1.2, 0],
    radius: 3.6,
  },
  {
    id: 'yemeni-corner',
    title: 'The Yemeni Corner',
    subtitle: 'Rukn al-Yamani',
    body: 'The southern corner of the Kaaba. It is sunnah to touch it if you can, without kissing. Along the wall from here to the Black Stone, pilgrims recite Rabbana atina fid-dunya hasanah.',
    position: radial(-4.9, -4.91, STAND),
    lookAt: [-4.9, 1.4, -4.91],
    radius: 3.4,
  },
];

export function getHotspot(id: string | null): Hotspot | undefined {
  if (!id) return undefined;
  return HOTSPOTS.find((h) => h.id === id);
}

export function nextHotspotId(currentId: string | null, dir: 1 | -1): HotspotId {
  const ids = HOTSPOTS.map((h) => h.id);
  const from = currentId ? ids.indexOf(currentId as HotspotId) : dir === 1 ? -1 : 0;
  const idx = (from + dir + ids.length) % ids.length;
  return ids[idx];
}
