import { InputSystem } from '@core';

export type GameAction =
  | 'MoveForward' | 'MoveBackward' | 'RotateLeft' | 'RotateRight' | 'Run' | 'Jump'
  | 'CameraForward' | 'CameraBackward' | 'CameraLeft' | 'CameraRight'
  | 'ZoomIn' | 'ZoomOut';

export const input = new InputSystem<GameAction>();

export const keyBindings: Record<string, GameAction> = {
  ArrowUp: 'MoveForward',
  ArrowDown: 'MoveBackward',
  ArrowLeft: 'RotateLeft',
  ArrowRight: 'RotateRight',
  ShiftLeft: 'Run', ShiftRight: 'Run',
  Space: 'Jump',

  KeyW: 'CameraForward',
  KeyS: 'CameraBackward',
  KeyA: 'CameraLeft',
  KeyD: 'CameraRight',
  KeyQ: 'ZoomIn',
  KeyE: 'ZoomOut',
};