import { beforeEach, describe, expect, it } from 'vitest';
import { CameraMode, useGameStore } from './gameStore';
import { CHARACTER_SPAWN_POSITION } from '../worldConfig';

beforeEach(() => {
  useGameStore.setState({
    cameraMode: CameraMode.Follow,
    isViewLocked: true,
    characterRef: null,
    activeTargets: [],
    readyStatus: {},
    isGameStarted: false,
    skyMode: 'night',
    isControlEnabled: false,
    isHudHidden: false,
    screenshotArmed: false,
    nearbyHotspotId: null,
    guidedHotspotId: null,
    dismissedHotspotId: null,
    sessionEpoch: 0,
    gpuError: null,
  });
});

describe('gameStore hotspots', () => {
  it('sends N from nowhere to the Black Stone', () => {
    useGameStore.getState().cycleHotspot(1);
    expect(useGameStore.getState().guidedHotspotId).toBe('black-stone');
  });

  it('advances from the current nearby stop', () => {
    useGameStore.setState({ nearbyHotspotId: 'black-stone' });
    useGameStore.getState().cycleHotspot(1);
    expect(useGameStore.getState().guidedHotspotId).toBe('kaaba-door');
  });

  it('does not start a guided run when already standing at that stop', () => {
    useGameStore.setState({ nearbyHotspotId: 'maqam-ibrahim' });
    useGameStore.getState().goToHotspot('maqam-ibrahim');
    expect(useGameStore.getState().guidedHotspotId).toBeNull();
  });

  it('runs to a clicked stop that is not the nearby one', () => {
    useGameStore.setState({ nearbyHotspotId: 'black-stone' });
    useGameStore.getState().goToHotspot('yemeni-corner');
    expect(useGameStore.getState().guidedHotspotId).toBe('yemeni-corner');
  });
});

describe('gameStore hotspot card dismissal', () => {
  it('remembers which stop the card was closed on', () => {
    useGameStore.setState({ nearbyHotspotId: 'black-stone' });
    useGameStore.getState().dismissHotspot();
    expect(useGameStore.getState().dismissedHotspotId).toBe('black-stone');
  });

  it('re-arms the card when a different stop comes into range', () => {
    useGameStore.setState({ nearbyHotspotId: 'black-stone', dismissedHotspotId: 'black-stone' });
    useGameStore.getState().setNearbyHotspotId('kaaba-door');
    expect(useGameStore.getState().dismissedHotspotId).toBeNull();
  });

  it('re-arms the card when leaving every stop', () => {
    useGameStore.setState({ nearbyHotspotId: 'black-stone', dismissedHotspotId: 'black-stone' });
    useGameStore.getState().setNearbyHotspotId(null);
    expect(useGameStore.getState().dismissedHotspotId).toBeNull();
  });

  it('keeps the card closed while you stay at the dismissed stop', () => {
    useGameStore.setState({ nearbyHotspotId: 'black-stone', dismissedHotspotId: 'black-stone' });
    useGameStore.getState().setNearbyHotspotId('black-stone');
    expect(useGameStore.getState().dismissedHotspotId).toBe('black-stone');
  });

  it('re-arms the card when cycling to the next stop', () => {
    useGameStore.setState({ nearbyHotspotId: 'black-stone', dismissedHotspotId: 'black-stone' });
    useGameStore.getState().cycleHotspot(1);
    expect(useGameStore.getState().dismissedHotspotId).toBeNull();
  });
});

describe('gameStore screenshot and restart', () => {
  it('hides the HUD when a screenshot is armed, and restores it after capture', () => {
    useGameStore.getState().requestScreenshot();
    expect(useGameStore.getState().isHudHidden).toBe(true);
    expect(useGameStore.getState().screenshotArmed).toBe(true);

    useGameStore.getState().requestScreenshot();
    expect(useGameStore.getState().screenshotArmed).toBe(true);

    useGameStore.getState().completeScreenshot();
    expect(useGameStore.getState().isHudHidden).toBe(false);
    expect(useGameStore.getState().screenshotArmed).toBe(false);
  });

  it('returns to the intro and spawn without dropping the character ref', () => {
    const position = { x: 12, y: 0, z: -4, set: (x: number, y: number, z: number) => {
      position.x = x;
      position.y = y;
      position.z = z;
    } };
    const rotation = { set: () => undefined };
    const characterRef = { current: { position, rotation } };

    useGameStore.setState({
      characterRef: characterRef as never,
      isGameStarted: true,
      isControlEnabled: true,
      cameraMode: CameraMode.FPV,
      nearbyHotspotId: 'kaaba-door',
      guidedHotspotId: 'hijr-ismail',
      dismissedHotspotId: 'kaaba-door',
      sessionEpoch: 3,
    });

    useGameStore.getState().restartSession();
    const state = useGameStore.getState();

    expect(state.dismissedHotspotId).toBeNull();

    expect(position.x).toBe(CHARACTER_SPAWN_POSITION[0]);
    expect(position.z).toBe(CHARACTER_SPAWN_POSITION[2]);
    expect(state.isGameStarted).toBe(false);
    expect(state.isControlEnabled).toBe(false);
    expect(state.cameraMode).toBe(CameraMode.Follow);
    expect(state.nearbyHotspotId).toBeNull();
    expect(state.guidedHotspotId).toBeNull();
    expect(state.sessionEpoch).toBe(4);
  });
});

describe('gameStore scene readiness', () => {
  it('is not ready until every compile target reports in', () => {
    useGameStore.getState().setActiveTargets(['floor', 'kaaba', 'character']);
    expect(useGameStore.getState().isSceneReady()).toBe(false);

    useGameStore.getState().setComponentReady('floor', true);
    useGameStore.getState().setComponentReady('kaaba', true);
    expect(useGameStore.getState().isSceneReady()).toBe(false);

    useGameStore.getState().setComponentReady('character', true);
    expect(useGameStore.getState().isSceneReady()).toBe(true);
  });
});
