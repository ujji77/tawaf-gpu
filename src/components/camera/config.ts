import * as THREE from 'three/webgpu';

export const CAMERA_POSITION = new THREE.Vector3(-4, 2, -0.5);
export const CAMERA_LOOKAT = new THREE.Vector3(0, 1, 0);

export const FOLLOW_LOOKAT_Y = 1;
export const FOLLOW_LOCK_DISTANCE = 4.2;
export const FOLLOW_LOCK_HEIGHT = 2;
/** 0 = in front of the character. Math.PI = behind. */
export const FOLLOW_LOCK_AZIMUTH_OFFSET = Math.PI;
export const FOLLOW_LOCK_POLAR = Math.acos(
  Math.min(1, Math.max(-1, (FOLLOW_LOCK_HEIGHT - FOLLOW_LOOKAT_Y) / FOLLOW_LOCK_DISTANCE))
);

export const BIRDS_EYE_POSITION = new THREE.Vector3(0, 48, 11);
export const BIRDS_EYE_LOOKAT = new THREE.Vector3(0, 0, 0);
export const BIRDS_EYE_POLAR = 0.22;
export const BIRDS_EYE_MIN_DISTANCE = 16;
export const BIRDS_EYE_MAX_DISTANCE = 140;
