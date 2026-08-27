import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bindGameAnalytics, track, _resetAnalyticsBindingForTests } from './analytics';
import { CameraMode, useGameStore } from './store/gameStore';

describe('track', () => {
  it('posts the event name with sendBeacon', () => {
    const sendBeacon = vi.fn(() => true);
    vi.stubGlobal('navigator', { sendBeacon });
    track('hotspot', 'black-stone');
    expect(sendBeacon).toHaveBeenCalledWith(
      '/event',
      JSON.stringify({ name: 'hotspot', extra: 'black-stone' })
    );
    vi.unstubAllGlobals();
  });
});

describe('bindGameAnalytics', () => {
  beforeEach(() => {
    _resetAnalyticsBindingForTests();
    useGameStore.setState({
      isGameStarted: false,
      nearbyHotspotId: null,
      screenshotArmed: false,
      sessionEpoch: 0,
      cameraMode: CameraMode.Follow,
    });
  });

  afterEach(() => {
    _resetAnalyticsBindingForTests();
    vi.unstubAllGlobals();
  });

  it('records start, hotspot, screenshot, and restart', () => {
    const sendBeacon = vi.fn(() => true);
    vi.stubGlobal('navigator', { sendBeacon });
    bindGameAnalytics();

    useGameStore.getState().setIsGameStarted(true);
    useGameStore.getState().setNearbyHotspotId('black-stone');
    useGameStore.getState().requestScreenshot();
    useGameStore.getState().restartSession();

    const names = sendBeacon.mock.calls.map((call) => JSON.parse(call[1] as string).name);
    expect(names).toEqual(['start', 'hotspot', 'screenshot', 'restart']);
  });
});
