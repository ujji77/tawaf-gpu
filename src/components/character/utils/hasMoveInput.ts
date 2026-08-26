import { input } from '../../../core/input/controls';

export function hasMoveInput() {
  return (
    input.isPressed('MoveForward') ||
    input.isPressed('MoveBackward') ||
    input.isPressed('RotateLeft') ||
    input.isPressed('RotateRight') ||
    Math.abs(input.getAxis('horizontal')) > 0.1 ||
    Math.abs(input.getAxis('vertical')) > 0.1
  );
}
