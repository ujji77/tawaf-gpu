import { CSSProperties } from 'react';
import { useGameStore } from '../core/store/gameStore';
import { getHotspot } from '../components/hotspots/config';

const FONT = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const GLASS = 'blur(28px) saturate(160%)';
const HAIRLINE = '1px solid rgba(255, 255, 255, 0.12)';

const cardStyle: CSSProperties = {
  position: 'absolute',
  left: '18px',
  bottom: '18px',
  width: 'min(340px, calc(100vw - 220px))',
  zIndex: 40,
  pointerEvents: 'auto',
  padding: '18px 18px 14px',
  boxSizing: 'border-box',
  background:
    'linear-gradient(180deg, rgba(8,10,14,0.56) 0%, rgba(6,8,12,0.66) 100%)',
  backdropFilter: GLASS,
  WebkitBackdropFilter: GLASS,
  border: HAIRLINE,
  borderRadius: '22px',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(255,255,255,0.04)',
  color: 'rgba(255,255,255,0.88)',
  fontFamily: FONT,
};

export function HotspotPopup() {
  const isMobile = useGameStore((state) => state.isMobile);
  const nearbyHotspotId = useGameStore((state) => state.nearbyHotspotId);
  const guidedHotspotId = useGameStore((state) => state.guidedHotspotId);
  const cycleHotspot = useGameStore((state) => state.cycleHotspot);

  const approaching = Boolean(guidedHotspotId && guidedHotspotId !== nearbyHotspotId);
  const hotspot = getHotspot(nearbyHotspotId ?? guidedHotspotId);
  if (!hotspot) return null;

  return (
    <aside style={{ ...cardStyle, bottom: isMobile ? '148px' : '18px' }} aria-live="polite">
      <div
        style={{
          fontSize: '9px',
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '8px',
        }}
      >
        {approaching ? 'Walking to' : 'Site'}
      </div>
      <div style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '0.01em' }}>
        {hotspot.title}
      </div>
      <div
        style={{
          marginTop: '4px',
          fontSize: '12px',
          color: 'rgba(227, 201, 140, 0.92)',
          letterSpacing: '0.04em',
        }}
      >
        {hotspot.subtitle}
      </div>
      <p
        style={{
          margin: '12px 0 0',
          fontSize: '13px',
          lineHeight: 1.5,
          color: 'rgba(255,255,255,0.72)',
        }}
      >
        {hotspot.body}
      </p>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginTop: '14px',
        }}
      >
        <CycleButton label="P  Previous" onClick={() => cycleHotspot(-1)} />
        <CycleButton label="N  Next" onClick={() => cycleHotspot(1)} />
      </div>
    </aside>
  );
}

function CycleButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        height: '32px',
        border: HAIRLINE,
        borderRadius: '11px',
        background: 'rgba(255,255,255,0.06)',
        color: 'rgba(255,255,255,0.8)',
        fontFamily: FONT,
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.04em',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
