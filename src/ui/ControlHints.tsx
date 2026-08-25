import { useState, CSSProperties } from 'react';
import { input } from '../core/input/controls';
import type { GameAction } from '../core/input/controls';
import { useGameStore, CameraMode } from '../core/store/gameStore';

const CHIP_BG = 'rgba(10, 10, 10, 0.65)';
const CHIP_BG_ACTIVE = 'rgba(255, 255, 255, 0.4)';
const CHIP_BORDER = '1px solid rgba(255, 255, 255, 0.25)';
const TEXT_SHADOW = '0 1px 3px rgba(0, 0, 0, 0.9)';

const chipStyle = (active: boolean, extra?: CSSProperties): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: 700,
  color: 'white',
  textShadow: TEXT_SHADOW,
  backgroundColor: active ? CHIP_BG_ACTIVE : CHIP_BG,
  backdropFilter: 'blur(6px)',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
  border: CHIP_BORDER,
  borderRadius: '6px',
  userSelect: 'none',
  cursor: 'pointer',
  touchAction: 'none',
  transition: 'background-color 0.1s ease',
  ...extra,
});

const labelStyle: CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.5px',
  color: 'rgba(255,255,255,0.85)',
  textShadow: TEXT_SHADOW,
};

// Held while pressed - for movement/run, mirrors physical key-down/key-up behavior.
function HoldButton({ action, label, style }: { action: GameAction; label: string; style?: CSSProperties }) {
  const [active, setActive] = useState(false);

  const press = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    input.setButton(action, true);
    setActive(true);
  };

  const release = () => {
    input.setButton(action, false);
    setActive(false);
  };

  return (
    <div
      style={chipStyle(active, style)}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
    >
      {label}
    </div>
  );
}

// Fires once per click - for toggles like camera mode / mute.
function TapButton({ label, onTap, style }: { label: string; onTap: () => void; style?: CSSProperties }) {
  const [flash, setFlash] = useState(false);

  const handleClick = () => {
    onTap();
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
  };

  return (
    <div style={chipStyle(flash, style)} onClick={handleClick}>
      {label}
    </div>
  );
}

export function ControlHints() {
  const cameraMode = useGameStore((state) => state.cameraMode);
  const setCameraMode = useGameStore((state) => state.setCameraMode);
  const isSoundOn = useGameStore((state) => state.isSoundOn);
  const setIsSoundOn = useGameStore((state) => state.setIsSoundOn);

  return (
    <div style={{
      position: 'fixed',
      left: '20px',
      bottom: '20px',
      zIndex: 50,
      pointerEvents: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
    }}>
      <HoldButton action="MoveForward" label="↑" style={{ width: '38px', height: '38px' }} />
      <div style={{ display: 'flex', gap: '4px' }}>
        <HoldButton action="RotateLeft" label="←" style={{ width: '38px', height: '38px' }} />
        <HoldButton action="MoveBackward" label="↓" style={{ width: '38px', height: '38px' }} />
        <HoldButton action="RotateRight" label="→" style={{ width: '38px', height: '38px' }} />
      </div>

      <HoldButton
        action="Run"
        label="⇧ SHIFT TO RUN"
        style={{ width: '124px', height: '30px', fontSize: '11px', marginTop: '2px' }}
      />

      <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
        <TapButton
          label="C · CAMERA"
          onTap={() => setCameraMode(((cameraMode + 1) % 3) as CameraMode)}
          style={{ width: '80px', height: '26px', fontSize: '10px' }}
        />
        <TapButton
          label="M · MUTE"
          onTap={() => setIsSoundOn(!isSoundOn)}
          style={{ width: '80px', height: '26px', fontSize: '10px' }}
        />
      </div>

      <div style={{ ...labelStyle, marginTop: '2px' }}>
        WASD / ARROWS
      </div>
    </div>
  );
}
