import { useProgress } from "@react-three/drei";
import { useEffect, useRef, useState, useMemo } from "react";
import { useGameStore } from "../core/store/gameStore";
import gsap from "gsap";

// --- Sub Components ---
const Key = ({ children }: { children: React.ReactNode }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: '18px', height: '22px', padding: '0 5px', margin: '0 4px',
        border: '1px solid #555', borderRadius: '4px', background: 'rgba(255,255,255,0.05)',
        fontFamily: 'monospace', fontSize: '0.7rem', fontWeight: 'bold', color: '#ccc',
        lineHeight: 1, verticalAlign: 'middle', boxSizing: 'border-box'
    }}>
        {children}
    </span>
);

const InstructionRow = ({ input, label }: { input: React.ReactNode, label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
        {input}
        <span style={{ marginLeft: '6px', fontSize: '0.7rem', letterSpacing: '1px', fontWeight: 500, transform: 'translateY(1px)' }}>
            {label}
        </span>
    </div>
);

const GitHubIcon = () => (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
    </svg>
);

const REPOS = [
    {
        href: 'https://github.com/ujji77/tawaf-gpu',
        label: 'tawaf-gpu',
        hint: 'this repo · fork it',
    },
    {
        href: 'https://github.com/momentchan/false-earth',
        label: 'false-earth',
        hint: 'original engine',
    },
] as const;

function RepoLinks({ compact }: { compact?: boolean }) {
    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: compact ? '8px 16px' : '12px 22px',
            justifyContent: 'flex-start',
            marginTop: compact ? '0.85rem' : '1.4rem',
        }}>
            {REPOS.map((repo) => (
                <a
                    key={repo.href}
                    href={repo.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#ddd',
                        textDecoration: 'none',
                        fontSize: '0.68rem',
                        letterSpacing: '0.06em',
                        opacity: 0.9,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.color = '#ddd'; }}
                >
                    <GitHubIcon />
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', lineHeight: 1.2 }}>
                        <span style={{ fontWeight: 600 }}>{repo.label}</span>
                        <span style={{ fontSize: '0.58rem', letterSpacing: '0.04em', color: '#888', fontWeight: 400 }}>
                            {repo.hint}
                        </span>
                    </span>
                </a>
            ))}
        </div>
    );
}

// --- Main Component ---

export function LoadingScreen() {
    // Store & Hooks
    const { active, progress: downloadProgress } = useProgress();
    const activeTargets = useGameStore((state) => state.activeTargets);
    const readyStatus = useGameStore((state) => state.readyStatus);
    const isMobile = useGameStore((state) => state.isMobile);
    const setIsGameStarted = useGameStore((state) => state.setIsGameStarted);
    const isGameStarted = useGameStore((state) => state.isGameStarted);
    const gpuError = useGameStore((state) => state.gpuError);

    // Local State
    const [isReadyToStart, setIsReadyToStart] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isLandscape, setIsLandscape] = useState(false); // New State for Landscape detection

    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<gsap.core.Tween | null>(null);

    // Orientation detection hook
    useEffect(() => {
        const checkOrientation = () => {
            setIsLandscape(window.innerWidth > window.innerHeight);
        };
        checkOrientation();
        window.addEventListener('resize', checkOrientation);
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    const total = activeTargets.length;
    const loaded = activeTargets.filter((id) => readyStatus[id]).length;
    const compileProgress = total === 0 ? 0 : (loaded / total) * 100;

    const displayProgress = useMemo(() => {
        if (active) return Math.round(downloadProgress * 0.5);
        return Math.min(Math.round(50 + compileProgress * 0.5), 99);
    }, [active, downloadProgress, compileProgress]);

    useEffect(() => {
        if (!active && loaded === total && total > 0) {
            const t = setTimeout(() => setIsReadyToStart(true), 200);
            return () => clearTimeout(t);
        }
    }, [active, loaded, total]);

    useEffect(() => {
        if (isGameStarted) return;
        setIsVisible(true);
        if (!active && loaded === total && total > 0) {
            setIsReadyToStart(true);
        }
        if (animationRef.current) {
            animationRef.current.kill();
            animationRef.current = null;
        }
        if (containerRef.current) {
            gsap.set(containerRef.current, { opacity: 1 });
        }
    }, [isGameStarted, active, loaded, total]);

    const handleStart = () => {
        if (!isReadyToStart || gpuError) return;
        setIsGameStarted(true);
        if (containerRef.current) {
            animationRef.current = gsap.to(containerRef.current, {
                opacity: 0,
                duration: 1,
                ease: "power2.inOut",
                onComplete: () => setIsVisible(false)
            });
        }
    };

    useEffect(() => {
        return () => {
            if (animationRef.current) animationRef.current.kill();
        };
    }, []);

    if (!isVisible) return null;

    // --- Dynamic Styles ---
    const isMobileLandscape = isMobile && isLandscape;

    const containerStyle: React.CSSProperties = {
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100dvh',
        background: '#000', zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontFamily: 'Cousine',
        pointerEvents: 'auto',
        fontSize: isMobile ? '0.8rem' : '0.9rem',
        opacity: 0.99,
        // In landscape, we want strict overflow handling
        overflow: 'hidden',
        padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)'
    };

    const entryContainerStyle: React.CSSProperties = {
        opacity: 1,
        maxWidth: isMobileLandscape ? '92%' : (isMobile ? '100%' : '640px'),
        padding: isMobileLandscape ? '16px 20px' : (isMobile ? '28px 24px' : '40px'),
        animation: 'fadeIn 2s ease',
        display: 'flex',
        flexDirection: isMobileLandscape ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isMobileLandscape ? '32px' : '0px',
        height: isMobileLandscape ? '100%' : 'auto',
        maxHeight: '100%',
        overflowY: 'auto',
        boxSizing: 'border-box',
    };

    const playButtonStyle: React.CSSProperties = {
        color: gpuError ? '#ff4444' : 'white',
        backgroundColor: 'transparent',
        border: 'none',
        letterSpacing: '3px',
        transition: 'all 0.5s ease',
        transform: 'scale(1)',
        cursor: gpuError ? 'default' : (isReadyToStart ? 'pointer' : 'wait'),
        opacity: gpuError ? 0.8 : 1,
        whiteSpace: 'nowrap',
        animation: isReadyToStart ? 'breathe 2s infinite ease-in-out' : 'none',
    };

    return (
        <div ref={containerRef} style={containerStyle}>
            <div className='entry' style={entryContainerStyle}>

                {/* Left Side: Content Text */}
                <div style={{
                    flex: isMobileLandscape ? '1' : 'auto',
                    textAlign: isMobileLandscape ? 'left' : 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: isMobileLandscape ? 'center' : 'flex-start'
                }}>
                    {/* Title */}
                    <div style={{
                        fontSize: '1rem', fontWeight: 'bold',
                        letterSpacing: isMobile ? '0.3rem' : '0.5rem',
                        marginBottom: isMobileLandscape ? '0.35rem' : '0.55rem',
                    }}>
                        TAWAF
                    </div>
                    <div style={{
                        fontSize: isMobileLandscape ? '0.58rem' : '0.68rem',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        color: '#888',
                        marginBottom: isMobileLandscape ? '0.9rem' : '1.6rem',
                    }}>
                        an open-source learning scene
                    </div>

                    {/* Intro Text */}
                    <div style={{
                        textAlign: 'left',
                        display: 'inline-block',
                        lineHeight: isMobileLandscape ? '1.45' : '1.65',
                        color: '#ccc',
                        marginBottom: isMobileLandscape ? '0' : '1.5rem',
                        fontSize: isMobileLandscape ? '0.72rem' : '0.86rem',
                    }}>
                        <p style={{ margin: '0 0 0.85em' }}>
                            Tawaf is the seven circuits around the Kaaba that open and close
                            Hajj and Umrah. This demo puts you on the mataf so you can walk
                            that ground and meet the sites as they appear — not as a list,
                            but as places you stand in.
                        </p>
                        {!isMobileLandscape && (
                            <p style={{ margin: '0 0 0.85em' }}>
                                Markers sit at the Black Stone, the Kaaba door, Maqam Ibrahim,
                                Hijr Ismail, and the Yemeni Corner. Walk into one for a short
                                note, or press <span style={{ color: '#eee' }}>N</span> to be
                                guided around the circuit. Fork the scene, rewrite the cards,
                                add stops — the lesson is a config file.
                            </p>
                        )}
                        {isMobileLandscape && (
                            <p style={{ margin: '0 0 0.85em' }}>
                                Approach a marker for a short note, or press N to be guided
                                around the circuit. Fork it and write your own lesson.
                            </p>
                        )}
                        <RepoLinks compact={isMobileLandscape} />
                    </div>
                </div>

                {/* Right Side: Interaction Area */}
                <div style={{
                    flex: isMobileLandscape ? '0.8' : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: isMobileLandscape ? '200px' : 'auto'
                }}>
                    {/* Play Button & Progress Bar */}
                    <div className='play'>
                        <button
                            onClick={handleStart}
                            disabled={!isReadyToStart || !!gpuError}
                            style={playButtonStyle}
                            onMouseEnter={(e) => (isReadyToStart && !gpuError) && (e.currentTarget.style.transform = 'scale(1.02)')}
                            onMouseLeave={(e) => (isReadyToStart && !gpuError) && (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            {gpuError ? (
                                <span style={{ letterSpacing: '2px' }}>SYSTEM INCOMPATIBLE</span>
                            ) : isReadyToStart ? (
                                "[ START ]"
                            ) : (
                                <span>
                                    {active ? "LOADING" : "CALIBRATING"}... {displayProgress}%
                                </span>
                            )}
                        </button>

                        <div style={{
                            width: '100%', maxWidth: '250px', height: '1px', background: '#222', margin: '10px auto',
                            opacity: (isReadyToStart || gpuError) ? 0 : 1, transition: 'opacity 0.5s'
                        }}>
                            <div style={{ width: `${displayProgress}%`, height: '100%', background: '#666', transition: 'width 0.2s' }} />
                        </div>
                    </div>

                    {/* Bottom Area: Controls */}
                    <div style={{
                        marginTop: isMobileLandscape ? '15px' : '40px',
                        color: '#ccc', opacity: 0.8, animation: 'fadeIn 3s ease',
                        userSelect: 'none', display: 'flex', justifyContent: 'center', gap: '24px',
                        flexDirection: 'row',
                    }}>
                        {gpuError ? (
                            <div style={{ fontSize: '0.8rem', maxWidth: '400px', lineHeight: '1.4', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.7rem' }}>ERROR CODE: {gpuError}</p>
                            </div>
                        ) : (
                            isMobile ? (
                                <>
                                    <InstructionRow input={<Key>L-STICK</Key>} label="MOVE" />
                                    {/* Hide 'Touch' instruction on very small landscape screens if crowded */}
                                    <InstructionRow input={<Key>TOUCH</Key>} label="LOOK" />
                                </>
                            ) : (
                                <>
                                    <InstructionRow input={<><Key>↑</Key><Key>←</Key><Key>↓</Key><Key>→</Key></>} label="MOVE" />
                                    <InstructionRow input={<Key>SHIFT</Key>} label="RUN" />
                                    <InstructionRow input={<Key>N</Key>} label="SITES" />
                                </>
                            )
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}