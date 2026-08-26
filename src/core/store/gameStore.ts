import { create } from 'zustand';
import { Group } from 'three';
import { AudioListener } from 'three/webgpu';
import * as THREE from 'three/webgpu';
import { nextHotspotId } from '../../components/hotspots/config';
import { CHARACTER_SPAWN_POSITION } from '../worldConfig';

export enum CameraMode {
  Follow  = 0,
  FPV = 1,
  Detached = 2,
  BirdsEye = 3,
}

export const CAMERA_MODE_COUNT = 4;

interface GameState {
  // ===== Camera State =====
  cameraMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;
  toggleCameraMode: () => void;

  isViewLocked: boolean;
  setViewLocked: (locked: boolean) => void;
  toggleViewLock: () => void;
  
  // ===== Character State =====
  characterRef: React.MutableRefObject<Group | null> | null;
  setCharacterRef: (ref: React.MutableRefObject<Group | null> | null) => void;

  activeTargets: string[];
  setActiveTargets: (targets: string[]) => void;

  readyStatus: Record<string, boolean>;
  setComponentReady: (id: string, isReady: boolean) => void;

  isSceneReady: () => boolean;

  isGameStarted: boolean;
  setIsGameStarted: (loaded: boolean) => void;

  isSoundOn: boolean;
  setIsSoundOn: (isSoundOn: boolean) => void;

  audioListener: AudioListener | null;
  setAudioListener: (listener: THREE.AudioListener) => void;

  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;

  quality: 'low' | 'high';
  toggleQuality: () => void;

  skyMode: 'night' | 'day';
  setSkyMode: (mode: 'night' | 'day') => void;
  toggleSkyMode: () => void;

  isControlEnabled: boolean; 
  setControlEnabled: (enabled: boolean) => void;

  isHudHidden: boolean;
  screenshotArmed: boolean;
  requestScreenshot: () => void;
  completeScreenshot: () => void;

  nearbyHotspotId: string | null;
  guidedHotspotId: string | null;
  setNearbyHotspotId: (id: string | null) => void;
  cycleHotspot: (dir: 1 | -1) => void;
  goToHotspot: (id: string) => void;
  cancelGuidedRun: () => void;
  completeGuidedRun: () => void;
  sessionEpoch: number;
  restartSession: () => void;

  // ===== WebGPU State =====
  gpuError: string | null;
  setGpuError: (error: string | null) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // ===== Camera State =====
  cameraMode: CameraMode.Follow,
  setCameraMode: (mode) => set({ cameraMode: mode }),
  toggleCameraMode: () => set((state) => ({
    cameraMode: (state.cameraMode + 1) % CAMERA_MODE_COUNT
  })),

  isViewLocked: true,
  setViewLocked: (locked) => set({ isViewLocked: locked }),
  toggleViewLock: () => set((state) => ({ isViewLocked: !state.isViewLocked })),
  
  // ===== Character State =====
  characterRef: null,
  setCharacterRef: (ref) => set({ characterRef: ref }),

  activeTargets: [],
  setActiveTargets: (targets) => set({ activeTargets: targets }),

  readyStatus: {},
  setComponentReady: (id, isReady) => set((state) => ({
    readyStatus: { ...state.readyStatus, [id]: isReady }
  })),

  isSceneReady: () => {
    const { activeTargets, readyStatus } = get();
    if (activeTargets.length === 0) return false;
    return activeTargets.every((target) => readyStatus[target] === true);
  },

  isGameStarted: false,
  setIsGameStarted: (loaded) => set({ isGameStarted: loaded }),

  isSoundOn: false,
  setIsSoundOn: (isSoundOn) => set({ isSoundOn: isSoundOn }),

  audioListener: null,
  setAudioListener: (listener) => set({ audioListener: listener }),

  isMobile: false,
  setIsMobile: (isMobile) => set({ isMobile: isMobile }),

  quality: 'high',
  toggleQuality: () => set((state) => ({ quality: state.quality === 'high' ? 'low' : 'high' })),

  skyMode: 'night',
  setSkyMode: (mode) => set({ skyMode: mode }),
  toggleSkyMode: () => set((state) => ({ skyMode: state.skyMode === 'night' ? 'day' : 'night' })),

  isControlEnabled: false,
  setControlEnabled: (enabled) => set({ isControlEnabled: enabled }),

  isHudHidden: false,
  screenshotArmed: false,
  requestScreenshot: () => {
    if (get().screenshotArmed) return;
    set({ isHudHidden: true, screenshotArmed: true });
  },
  completeScreenshot: () => set({ isHudHidden: false, screenshotArmed: false }),

  nearbyHotspotId: null,
  guidedHotspotId: null,
  setNearbyHotspotId: (id) => set({ nearbyHotspotId: id }),
  cycleHotspot: (dir) => {
    const { nearbyHotspotId, guidedHotspotId } = get();
    const next = nextHotspotId(guidedHotspotId ?? nearbyHotspotId, dir);
    set({ guidedHotspotId: next });
  },
  goToHotspot: (id) => {
    if (get().nearbyHotspotId === id && !get().guidedHotspotId) return;
    set({ guidedHotspotId: id });
  },
  cancelGuidedRun: () => set({ guidedHotspotId: null }),
  completeGuidedRun: () => set({ guidedHotspotId: null }),
  sessionEpoch: 0,
  restartSession: () => {
    const character = get().characterRef?.current;
    if (character) {
      character.position.set(
        CHARACTER_SPAWN_POSITION[0],
        CHARACTER_SPAWN_POSITION[1],
        CHARACTER_SPAWN_POSITION[2]
      );
      character.rotation.set(0, 0, 0);
    }
    set({
      guidedHotspotId: null,
      nearbyHotspotId: null,
      cameraMode: CameraMode.Follow,
      isGameStarted: false,
      isControlEnabled: false,
      sessionEpoch: get().sessionEpoch + 1,
    });
  },

  // ===== WebGPU State =====
  gpuError: null,
  setGpuError: (error) => set({ gpuError: error }),
}));
