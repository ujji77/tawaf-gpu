import { Suspense, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useControls } from 'leva';
import {
    uTime,
    uDeltaTime,
    uGlobalHueShift,
} from '../core/shaders/uniforms';
import { CosmicSystem } from './cosmic/CosmicSystem';
import { StarrySky } from './background/StarrySky';
import { useGameStore } from '../core/store/gameStore';
import { CHARACTER_SPAWN_POSITION } from '../core/worldConfig';
import { AsyncCompile } from '@core';
import { Floor } from './Floor';
import { Kaaba } from './Kaaba';
import { Boundary } from './Boundary';
import { Character } from './character';
import { Hotspots } from './hotspots/Hotspots';

export function WorldController() {
    const setActiveTargets = useGameStore((state) => state.setActiveTargets);
    const setComponentReady = useGameStore((state) => state.setComponentReady);

    const debugMode = new URLSearchParams(window.location.search).get('debug') === 'true';

    // Enable eruda console only in debug mode (?debug=true)
    useEffect(() => {
        if (!debugMode) return;

        let cancelled = false;

        (async () => {
            try {
                const mod = await import('eruda');
                if (cancelled) return;
                const eruda: any = (mod as any).default ?? mod;
                if (typeof eruda.init === 'function') {
                    eruda.init();
                }
            } catch (e) {
                console.error('Failed to initialize eruda', e);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [debugMode]);

    const { enableEnv, enableFloor, enableKaaba, enableCharacter } = useControls('Game.Content', {
        enableEnv: { value: true, label: 'Environment' },
        enableCharacter: { value: true, label: '👤 Character' },
        enableFloor: { value: true, label: '⬜ Floor' },
        enableKaaba: { value: true, label: '🕋 Kaaba' },
    }, { collapsed: true });


    const { timeScale, globalHue } = useControls('Game.System', {
        timeScale: { value: 1.0, min: 0.0, max: 2.0, label: 'Game Speed' },
        globalHue: { value: 0.0, min: 0.0, max: 1.0, label: 'Global Hue' },
    });

    useEffect(() => {
        const targets: string[] = [];
        if (enableFloor) targets.push('floor');
        if (enableKaaba) targets.push('kaaba');
        if (enableCharacter) targets.push('character');
        setActiveTargets(targets);
    }, [enableFloor, enableKaaba, enableCharacter, setActiveTargets]);

    useFrame((_state, rawDelta) => {
        const delta = Math.min(rawDelta, 0.1);
        uGlobalHueShift.value = globalHue;

        uTime.value += delta * timeScale;
        uDeltaTime.value = delta * timeScale;
    });

    return <>
        {/* Environment - use group visibility to avoid remounting */}
        <Suspense fallback={null}>
            <group visible={enableEnv}>
                <StarrySky />
                <CosmicSystem />
            </group>

            {/* Major components - toggle visibility instead of unmounting */}
            <AsyncCompile id="floor" onReady={setComponentReady} debug={debugMode}>
                <Floor visible={enableFloor} />
            </AsyncCompile>

            <Boundary visible={enableFloor} />

            <AsyncCompile id="kaaba" onReady={setComponentReady} debug={debugMode}>
                <Kaaba visible={enableKaaba} />
            </AsyncCompile>

            <Hotspots visible={enableKaaba} />

            <AsyncCompile id="character" onReady={setComponentReady} debug={debugMode}>
                <Character position={CHARACTER_SPAWN_POSITION} scale={1} visible={enableCharacter} />
            </AsyncCompile>
        </Suspense>
    </>
}