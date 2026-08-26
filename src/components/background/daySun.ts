import { Vector3 } from 'three/webgpu';

/** Shared sun direction for the daytime SkyMesh and directional light. */
export const daySunDirection = new Vector3(0, 0.15, -1).normalize();
