import { useState, useEffect, CSSProperties } from 'react';
import { input } from '../core/input/controls';
import type { GameAction } from '../core/input/controls';
import { useGameStore, CameraMode, CAMERA_MODE_COUNT } from '../core/store/gameStore';

const FONT = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const GLASS =
  'blur(28px) saturate(160%)';
const HAIRLINE = '1px solid rgba(255, 255, 255, 0.12)';

const CAMERA_MODE_LABEL: Record<CameraMode, string> = {
  [CameraMode.Follow]: '3rd person',
  [CameraMode.FPV]: '1st person',
  [CameraMode.Detached]: 'Tripod',
  [CameraMode.BirdsEye]: "Bird's eye",
};

const railStyle: CSSProperties = {
  position: 'fixed',
  top: '14px',
  right: '14px',
  bottom: '14px',
  width: '168px',
  zIndex: 50,
  pointerEvents: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '12px 10px',
  boxSizing: 'border-box',
  overflow: 'hidden',
  background:
    'linear-gradient(180deg, rgba(8,10,14,0.52) 0%, rgba(6,8,12,0.62) 100%)',
  backdropFilter: GLASS,
  WebkitBackdropFilter: GLASS,
  border: HAIRLINE,
  borderRadius: '20px',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(255,255,255,0.04)',
  color: 'rgba(255,255,255,0.82)',
  fontFamily: FONT,
  userSelect: 'none',
};

const sectionLabelStyle: CSSProperties = {
  fontSize: '8px',
  fontWeight: 600,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.38)',
  marginBottom: '6px',
};

const keyBase = (active: boolean, extra?: CSSProperties): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.04em',
  color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.72)',
  background: active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)',
  border: active ? '1px solid rgba(255,255,255,0.28)' : HAIRLINE,
  borderRadius: '9px',
  cursor: 'pointer',
  touchAction: 'none',
  transition: 'background 0.16s ease, border-color 0.16s ease, color 0.16s ease',
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
      style={keyBase(active, style)}
      onPointerDown={press}
      onPointerUp={release}
      onPointerCancel={release}
    >
      {label}
    </div>
  );
}

function Pad({
  up,
  down,
  left,
  right,
  upLabel,
  downLabel,
  leftLabel,
  rightLabel,
}: {
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
      <HoldKey action={up} label={upLabel} />
      <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
        <HoldKey action={left} label={leftLabel} />
        <HoldKey action={down} label={downLabel} />
        <HoldKey action={right} label={rightLabel} />
      </div>
    </div>
  );
}

function RowButton({
  hint,
  label,
  active,
  onClick,
}: {
  hint: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        height: '28px',
        padding: '0 6px',
        margin: 0,
        background: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
        border: HAIRLINE,
        borderRadius: '10px',
        color: 'rgba(255,255,255,0.78)',
        fontFamily: FONT,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span
        style={{
          ...keyBase(!!active, {
            width: '20px',
            height: '20px',
            fontSize: '9px',
            borderRadius: '6px',
            flexShrink: 0,
            cursor: 'inherit',
          }),
        }}
      >
        {hint}
      </span>
      <span
        style={{
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.04em',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={sectionLabelStyle}>{title}</div>
      {children}
    </div>
  );
}

export function ControlHints() {
  const [, setTick] = useState(0);
  const cameraMode = useGameStore((state) => state.cameraMode);
  const setCameraMode = useGameStore((state) => state.setCameraMode);
  const isViewLocked = useGameStore((state) => state.isViewLocked);
  const toggleViewLock = useGameStore((state) => state.toggleViewLock);
  const isSoundOn = useGameStore((state) => state.isSoundOn);
  const setIsSoundOn = useGameStore((state) => state.setIsSoundOn);
  const quality = useGameStore((state) => state.quality);
  const toggleQuality = useGameStore((state) => state.toggleQuality);
  const skyMode = useGameStore((state) => state.skyMode);
  const toggleSkyMode = useGameStore((state) => state.toggleSkyMode);
  const requestScreenshot = useGameStore((state) => state.requestScreenshot);
  const cycleHotspot = useGameStore((state) => state.cycleHotspot);
  const restartSession = useGameStore((state) => state.restartSession);
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
    <nav style={railStyle} aria-label="Controls">
      <Section title="Move">
        <Pad
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
          label="⇧  Run"
          style={{
            width: '100%',
            height: '26px',
            fontSize: '10px',
            letterSpacing: '0.08em',
            marginTop: '6px',
          }}
        />
      </Section>

      <Section title="Camera">
        <Pad
          up="CameraForward"
          down="CameraBackward"
          left="CameraLeft"
          right="CameraRight"
          upLabel="W"
          downLabel="S"
          leftLabel="A"
          rightLabel="D"
        />
        <div style={{ display: 'flex', gap: '5px', marginTop: '6px' }}>
          <HoldKey
            action="ZoomOut"
            label="Q  −"
            style={{ flex: 1, width: 'auto', height: '26px', fontSize: '10px' }}
          />
          <HoldKey
            action="ZoomIn"
            label="E  +"
            style={{ flex: 1, width: 'auto', height: '26px', fontSize: '10px' }}
          />
        </div>
      </Section>

      <div style={{ flex: 1, minHeight: 0 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <RowButton
          hint="V"
          label={isViewLocked ? 'View lock' : 'View free'}
          active={isViewLocked}
          onClick={toggleViewLock}
        />
        <RowButton hint="C" label={CAMERA_MODE_LABEL[cameraMode]} onClick={cycleCamera} />
        <RowButton
          hint="M"
          label={isSoundOn ? 'Sound on' : 'Muted'}
          active={!isSoundOn}
          onClick={() => setIsSoundOn(!isSoundOn)}
        />
        <RowButton
          hint="T"
          label={skyMode === 'day' ? 'Day' : 'Night'}
          active={skyMode === 'day'}
          onClick={toggleSkyMode}
        />
        <RowButton
          hint="·"
          label={quality === 'high' ? 'Quality' : 'Performance'}
          active={quality === 'high'}
          onClick={toggleQuality}
        />
        <div style={{ display: 'flex', gap: '5px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <RowButton hint="P" label="Prev" onClick={() => cycleHotspot(-1)} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <RowButton hint="N" label="Next" onClick={() => cycleHotspot(1)} />
          </div>
        </div>
        <RowButton hint="X" label="Screenshot" onClick={requestScreenshot} />
        <RowButton hint="R" label="Restart" onClick={restartSession} />
      </div>
    </nav>
  );
}
