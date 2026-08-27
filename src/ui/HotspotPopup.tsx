import { CSSProperties } from 'react';
import { useGameStore } from '../core/store/gameStore';
import { getHotspot } from '../components/hotspots/config';

const FONT = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const GLASS = 'blur(28px) saturate(160%)';
// Mobile: lighter, less tinted fill so the scene reads through, more blur to keep text legible.
const GLASS_CLEAR = 'blur(34px) saturate(110%)';
const MOBILE_BG =
  'linear-gradient(180deg, rgba(18,19,22,0.30) 0%, rgba(13,14,17,0.40) 100%)';
const HAIRLINE = '1px solid rgba(255, 255, 255, 0.12)';

const cardStyle: CSSProperties = {
  position: 'absolute',
  left: '18px',
  bottom: '18px',
  width: 'min(340px, calc(100vw - 220px))',
  maxWidth: '440px',
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
  const dismissedHotspotId = useGameStore((state) => state.dismissedHotspotId);
  const cycleHotspot = useGameStore((state) => state.cycleHotspot);
  const dismissHotspot = useGameStore((state) => state.dismissHotspot);

  const approaching = Boolean(guidedHotspotId && guidedHotspotId !== nearbyHotspotId);
  const activeId = nearbyHotspotId ?? guidedHotspotId;
  const hotspot = getHotspot(activeId);
  if (!hotspot || activeId === dismissedHotspotId) return null;

  return (
    <aside
      style={{
        ...cardStyle,
        bottom: isMobile ? '150px' : '18px',
        // Wider on mobile: the marker card was pinched into ~170px next to the
        // joystick reservation. Give it the full width minus side margins.
        width: isMobile ? 'calc(100vw - 36px)' : cardStyle.width,
        background: isMobile ? MOBILE_BG : cardStyle.background,
        backdropFilter: isMobile ? GLASS_CLEAR : GLASS,
        WebkitBackdropFilter: isMobile ? GLASS_CLEAR : GLASS,
        textShadow: isMobile ? '0 1px 2px rgba(0,0,0,0.4)' : undefined,
      }}
      aria-live="polite"
    >
      <CloseButton onClick={dismissHotspot} />
      <div
        style={{
          fontSize: '9px',
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '8px',
          paddingRight: '34px',
        }}
      >
        {approaching ? 'Walking to' : 'Site'}
      </div>
      <div
        style={{
          fontSize: '18px',
          fontWeight: 600,
          letterSpacing: '0.01em',
          paddingRight: '34px',
        }}
      >
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
        <CycleButton
          label={isMobile ? 'Previous' : 'P  Previous'}
          onClick={() => cycleHotspot(-1)}
        />
        <CycleButton
          label={isMobile ? 'Next' : 'N  Next'}
          onClick={() => cycleHotspot(1)}
        />
      </div>
    </aside>
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close"
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        border: HAIRLINE,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)',
        color: 'rgba(255,255,255,0.75)',
        cursor: 'pointer',
        lineHeight: 0,
      }}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M1 1L11 11M11 1L1 11"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </button>
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
