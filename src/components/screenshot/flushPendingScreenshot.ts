import { useGameStore } from '../../core/store/gameStore';
import { downloadCanvasPng, snapshotSceneCanvas } from './downloadScenePng';

const SETTLE_FRAMES = 2;
let settle = 0;

/** Call immediately after the scene's post-process present. No extra render loop. */
export function flushPendingScreenshot(canvas: HTMLCanvasElement) {
  const { screenshotArmed, isHudHidden, completeScreenshot } = useGameStore.getState();
  if (!screenshotArmed || !isHudHidden) {
    settle = 0;
    return;
  }

  settle += 1;
  if (settle < SETTLE_FRAMES) return;
  settle = 0;

  try {
    const copy = snapshotSceneCanvas(canvas);
    completeScreenshot();
    downloadCanvasPng(copy);
  } catch (error) {
    console.error('Failed to save screenshot:', error);
    completeScreenshot();
  }
}
