// Shared flag between useTouchCamera (writer) and useFollowCamera (reader).
// While a touch-drag orbit is in progress the locked follow camera must not
// ease itself back behind the pilgrim, the same way a WASD orbit defers it on
// desktop.
export const cameraDragState = {
  /** performance.now() timestamp up to which a drag counts as active. */
  activeUntil: 0,
};
