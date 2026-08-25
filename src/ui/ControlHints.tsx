import { useState, useEffect, CSSProperties } from 'react';
import { input } from '../core/input/controls';
import type { GameAction } from '../core/input/controls';
import { useGameStore, CameraMode, CAMERA_MODE_COUNT } from '../core/store/gameStore';

const PANEL_BG = 'rgba(8, 8, 8, 0.55)';
const KEY_BG = 'rgba(255, 255, 255, 0.08)';
const KEY_BG_ACTIVE = 'rgba(255, 255, 255, 0.38)';
const KEY_BORDER = '1px solid rgba(255, 255, 255, 0.18)';
const TEXT_SHADOW = '0 1px 3px rgba(0, 0, 0, 0.85)';

const CAMERA_MODE_LABEL: Record<CameraMode, string> = {
  [CameraMode.Follow]: 'Third Person',
  [CameraMode.FPV]: 'First Person',
  [CameraMode.Detached]: 'Tripod',
  [CameraMode.BirdsEye]: "Bird's Eye",
};

const panelStyle: CSSProperties = {
  position: 'fixed',
  left: '16px',
  bottom: '16px',
  zIndex: 50,
  pointerEvents: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '12px 14px 12px',
  backgroundColor: PANEL_BG,
  backdropFilter: 'blur(12px)',
  border: KEY_BORDER,
  borderRadius: '14px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  userSelect: 'none',
};

const sectionTitleStyle: CSSProperties = {
  fontSize: '9px',
  fontWeight: 700,
  letterSpacing: '1.4px',
  color: 'rgba(255,255,255,0.55)',
  textShadow: TEXT_SHADOW,
  textAlign: 'center',
  marginBottom: '6px',
};

const keyStyle = (active: boolean, extra?: CSSProperties): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  fontSize: '13px',
  fontWeight: 700,
  color: 'white',
  textShadow: TEXT_SHADOW,
  backgroundColor: active ? KEY_BG_ACTIVE : KEY_BG,
  border: KEY_BORDER,
  borderRadius: '8px',
  cursor: 'pointer',
  touchAction: 'none',
  transition: 'background-color 0.08s ease, transform 0.08s ease',
  transform: active ? 'translateY(1px)' : 'none',
  ...extra,
});

function HoldKey({
  action,
  label,
  style,
}: {
  action: GameAction;
  label: string;
  style?: CSSProperties;
}) {
  const active = input.isPressed(action);

  const press = (e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    input.setButton(action, true);
  };

  const release = () => {
    input.setButton(action, false);
  };

  return (
    <div
      style={keyStyle(active, style)}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
    >
      {label}
    </div>
  );
}

function Pad({
  title,
  up,
  down,
  left,
  right,
  upLabel,
  downLabel,
  leftLabel,
  rightLabel,
}: {
  title: string;
  up: GameAction;
  down: GameAction;
  left: GameAction;
  right: GameAction;
  upLabel: string;
  downLabel: string;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={sectionTitleStyle}>{title}</div>
      <HoldKey action={up} label={upLabel} />
      <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
        <HoldKey action={left} label={leftLabel} />
        <HoldKey action={down} label={downLabel} />
        <HoldKey action={right} label={rightLabel} />
      </div>
    </div>
  );
}

export function ControlHints() {
  const [, setTick] = useState(0);
  const cameraMode = useGameStore((state) => state.cameraMode);
  const setCameraMode = useGameStore((state) => state.setCameraMode);
  const isSoundOn = useGameStore((state) => state.isSoundOn);
  const setIsSoundOn = useGameStore((state) => state.setIsSoundOn);

  const isControlEnabled = useGameStore((state) => state.isControlEnabled);

  useEffect(() => {
    if (!isControlEnabled) return;
    let id = 0;
    const loop = () => {
      setTick((t) => (t + 1) % 1_000_000);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [isControlEnabled]);

  const cycleCamera = () => {
    setCameraMode(((cameraMode + 1) % CAMERA_MODE_COUNT) as CameraMode);
  };

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
        <div>
          <Pad
            title="MOVE"
            up="MoveForward"
            down="MoveBackward"
            left="RotateLeft"
            right="RotateRight"
            upLabel="↑"
            downLabel="↓"
            leftLabel="←"
            rightLabel="→"
          />
          <HoldKey
            action="Run"
            label="⇧  RUN"
            style={{ width: '116px', height: '28px', fontSize: '10px', marginTop: '8px' }}
          />
        </div>

        <div>
          <Pad
            title="CAMERA"
            up="CameraForward"
            down="CameraBackward"
            left="CameraLeft"
            right="CameraRight"
            upLabel="W"
            downLabel="S"
            leftLabel="A"
            rightLabel="D"
          />
          <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
            <HoldKey
              action="ZoomIn"
              label="Q  IN"
              style={{ width: '56px', height: '28px', fontSize: '10px' }}
            />
            <HoldKey
              action="ZoomOut"
              label="E  OUT"
              style={{ width: '56px', height: '28px', fontSize: '10px' }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          type="button"
          onClick={cycleCamera}
          style={{
            ...keyStyle(false, {
              width: 'auto',
              flex: 1,
              height: '28px',
              fontSize: '10px',
              letterSpacing: '0.4px',
              cursor: 'pointer',
            }),
            border: KEY_BORDER,
            fontFamily: 'inherit',
          }}
        >
          C · {CAMERA_MODE_LABEL[cameraMode]}
        </button>
        <button
          type="button"
          onClick={() => setIsSoundOn(!isSoundOn)}
          style={{
            ...keyStyle(!isSoundOn, {
              width: '64px',
              height: '28px',
              fontSize: '10px',
              letterSpacing: '0.4px',
              cursor: 'pointer',
            }),
            border: KEY_BORDER,
            fontFamily: 'inherit',
          }}
        >
          M · {isSoundOn ? 'MUTE' : 'UNMUTE'}
        </button>
      </div>
    </div>
  );
}
