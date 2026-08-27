import { useGameStore } from './store/gameStore';

const BEACON_SRC = 'https://static.cloudflareinsights.com/beacon.min.js';

export type AnalyticsEvent = 'start' | 'hotspot' | 'screenshot' | 'restart';

export function initAnalytics() {
  const token = import.meta.env.VITE_CF_ANALYTICS_TOKEN;
  if (!token || document.querySelector(`script[src="${BEACON_SRC}"]`)) return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = BEACON_SRC;
  script.setAttribute('data-cf-beacon', JSON.stringify({ token }));
  document.head.appendChild(script);
}

export function track(name: AnalyticsEvent, extra = '') {
  if (typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') return;
  const payload = JSON.stringify({ name, extra });
  navigator.sendBeacon('/event', payload);
}

let unsub: (() => void) | null = null;

export function bindGameAnalytics() {
  if (unsub) return;

  unsub = useGameStore.subscribe((state, prev) => {
    if (state.isGameStarted && !prev.isGameStarted) {
      track('start');
    }
    if (state.nearbyHotspotId && state.nearbyHotspotId !== prev.nearbyHotspotId) {
      track('hotspot', state.nearbyHotspotId);
    }
    if (state.screenshotArmed && !prev.screenshotArmed) {
      track('screenshot');
    }
    if (state.sessionEpoch > prev.sessionEpoch) {
      track('restart');
    }
  });
}

export function _resetAnalyticsBindingForTests() {
  unsub?.();
  unsub = null;
}
