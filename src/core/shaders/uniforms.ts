import { uniform } from "three/tsl";
import type { StorageBufferAttribute } from "three/webgpu";

export const uTime = uniform(0.0);
export const uDeltaTime = uniform(0.016);
export const uGlobalHueShift = uniform(0.0);

// Cosmic Wave System
export const uActiveWaveCount = uniform(0);
export const GlobalWaveState = {
  buffer: null as StorageBufferAttribute | null,
};