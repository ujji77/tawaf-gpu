import { Environment, PerformanceMonitor, useGLTF } from "@react-three/drei";
import { LevaWrapper, AudioManager, KeyboardMapper } from "@core";
import { Canvas, useLoader } from "@react-three/fiber";
import { useEffect, Suspense, useState } from "react";
import { DirectionalLight } from "../components/DirectionalLight";
import { WebGPURenderer } from "three/webgpu";
import Effects from "../components/Effects/Effects";
import { useGameStore } from "../core/store/gameStore";
import { CameraViewControl } from "../components/camera/CameraViewControl";
import { DeviceDetector } from "../core/utils/DeviceDetector";
import { UI } from "../ui/UI";
import { WorldController } from "../components/WorldController";
import { input, keyBindings } from "../core/input/controls";
import { useShortcut } from "@core/hooks/useShortcut";
import { AudioLoader } from 'three';
import { MODEL_PATHS } from '../components/character/config';


useLoader.preload(AudioLoader,
    ['/audio/fs_grass1.mp3',
        '/audio/fs_grass2.mp3',
        '/audio/fs_grass3.mp3',
        '/audio/fs_grass4.mp3',
        '/audio/fs_grass5.mp3']);

useLoader.preload(AudioLoader, ['/audio/wave01.mp3']);

useGLTF.preload(MODEL_PATHS);

function SceneEnvironment() {
    const skyMode = useGameStore((state) => state.skyMode);
    return (
        <Environment
            files="/textures/potsdamer_platz_1k_nb.hdr"
            environmentIntensity={skyMode === 'day' ? 0.45 : 0.5}
        />
    );
}

function ScreenshotHotkey() {
    const requestScreenshot = useGameStore((state) => state.requestScreenshot);
    useShortcut('x', () => {
        if (!useGameStore.getState().isControlEnabled) return;
        requestScreenshot();
    });
    return null;
}

function HotspotHotkeys() {
    const cycleHotspot = useGameStore((state) => state.cycleHotspot);
    useShortcut('n', () => {
        if (!useGameStore.getState().isControlEnabled) return;
        cycleHotspot(1);
    });
    useShortcut('p', () => {
        if (!useGameStore.getState().isControlEnabled) return;
        cycleHotspot(-1);
    });
    return null;
}

export default function App() {
    const [dpr, setDpr] = useState(1.5);

    const toggleCameraMode = useGameStore((state) => state.toggleCameraMode);
    const toggleViewLock = useGameStore((state) => state.toggleViewLock);
    const toggleSkyMode = useGameStore((state) => state.toggleSkyMode);
    const setGpuError = useGameStore((state) => state.setGpuError);
    const setAudioListener = useGameStore((state) => state.setAudioListener);
    const gpuError = useGameStore((state) => state.gpuError);

    // Check WebGPU support on mount
    useEffect(() => {
        const checkWebGPU = async () => {
            if (!navigator.gpu) {
                setGpuError("WEBGPU NOT SUPPORTED");
                console.error("WebGPU is not supported in this browser");
                return;
            }
            try {
                const adapter = await navigator.gpu.requestAdapter();
                if (!adapter) {
                    setGpuError("NO GPU ADAPTER FOUND");
                    console.error("No GPU adapter found");
                    return;
                }
                console.log('WebGPU initialized successfully');
                setGpuError(null); // Clear any previous errors
            } catch (e) {
                setGpuError("GPU INIT FAILED");
                console.error("WebGPU initialization failed:", e);
            }
        };
        checkWebGPU();
    }, [setGpuError]);

    useShortcut('c', () => {
        toggleCameraMode();
    });

    useShortcut('v', () => {
        toggleViewLock();
    });

    useShortcut('t', () => {
        toggleSkyMode();
    });

    return <>
        <LevaWrapper collapsed={true} initialHidden={true} />
        <ScreenshotHotkey />
        <HotspotHotkeys />
        <DeviceDetector />
        <UI />
        <KeyboardMapper input={input} keyMap={keyBindings} />


        {!gpuError && (
            <Canvas
                camera={{
                    fov: 45,
                    near: 0.1,
                    far: 400,
                    position: [20, 20, 30]
                }}
                gl={(canvas) => {
                    const renderer = new WebGPURenderer({
                        ...canvas as any,
                        powerPreference: "high-performance",
                        antialias: true,
                        alpha: true,
                    });
                    renderer.setClearColor('#000000');
                    renderer.autoClear = true;
                    // renderer.inspector = new Inspector();
                    renderer.sortObjects = false;

                    return renderer.init().then(() => renderer);
                }}
                dpr={dpr}
            >
                <AudioManager onListenerCreated={setAudioListener} />

                <PerformanceMonitor
                    bounds={() => [28, 32]}
                    onFallback={() => setDpr(1)}
                    onChange={({ factor }) => {
                        const targetDpr = 1 + 1 * factor;
                        setDpr(targetDpr);
                    }}
                />

                <WorldController />

                <Suspense fallback={null}>
                    <color attach="background" args={['#000000']} />
                    <CameraViewControl />
                    <SceneEnvironment />
                    <DirectionalLight />
                    <Effects />
                </Suspense>
            </Canvas>
        )}
    </>
}
