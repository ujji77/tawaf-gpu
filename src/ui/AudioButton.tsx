'use client';

import { useEffect } from 'react';
import { useGameStore } from '../core/store/gameStore';
import { WebGPUCanvas } from '@core';
import { DistortedCircle } from '@core';
import { Bgm } from '@core';
import { useShortcut } from '@core/hooks/useShortcut';

const tracks = [
    { id: 'ambient', url: '/audio/ambient.mp3', volume: 1.5 },
    { id: 'noise', url: '/audio/noise.m4a', volume: 0.1}
]
export default function AudioButton() {
    const listener = useGameStore(s => s.audioListener);
    const isGameStarted = useGameStore((state) => state.isGameStarted);
    const isSoundOn = useGameStore((state) => state.isSoundOn);
    const setIsSoundOn = useGameStore((state) => state.setIsSoundOn);
    const isMobile = useGameStore((state) => state.isMobile);

    const radius = 10;
    const size = 45;

    useEffect(() => {
        if (isGameStarted) {
            setIsSoundOn(true);
        }
    }, [isGameStarted]);

    useShortcut('m', () => {
        setIsSoundOn(!isSoundOn);
    });

    return (
        <WebGPUCanvas
            width={size}
            height={size}
            style={{
                position: 'fixed',
                zIndex: 20,
                ...(isMobile
                    ? { bottom: 0, right: 0 }
                    : {
                        left: 0,
                        bottom: 0,
                        opacity: 0,
                        pointerEvents: 'none',
                    }),
            }}
        >
            {/* Interaction Layer (Invisible Hitbox) */}
            <mesh
                onClick={() => setIsSoundOn(!isSoundOn)}
                onPointerOver={() => {
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'auto';
                }}
                visible={false} // Invisible but captures events
            >
                <circleGeometry args={[radius * 1.2, 32]} />
                <meshBasicMaterial />
            </mesh>

            <Bgm listener={listener} active={isSoundOn} tracks={tracks} />

            {/* Visual Layer */}
            <group>
                {[12.35, 0.58, 3.67].map((seed, i) => (
                    <DistortedCircle
                        key={i}
                        radius={radius}
                        distortionStrength={isSoundOn ? 1 : 0}
                        seed={seed}
                    />
                ))}
            </group>
        </WebGPUCanvas>
    );
}