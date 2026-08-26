import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import * as THREE from 'three'
import { useGameStore } from '../core/store/gameStore'
import { daySunDirection } from './background/daySun'


export function DirectionalLight() {
    const directionalLightRef = useRef<THREE.DirectionalLight>(null)
    const helperRef = useRef<THREE.DirectionalLightHelper | null>(null)
    const { scene } = useThree()
    const skyMode = useGameStore((state) => state.skyMode)
    const isDay = skyMode === 'day'

    const { rotationSpeed, color, intensity, debug } = useControls('Directional Light', {
        rotationSpeed: { value: 0.5, min: 0, max: 2, step: 0.1 },
        color: { value: '#ffffff' },
        intensity: { value: 2.0, min: 0, max: 5, step: 0.1 },
        debug: { value: false },
    }, { collapsed: true })

    const nightPosition = useMemo(() => new THREE.Vector3(0, 2, 5), [])
    const positionRef = useRef(new THREE.Vector3())
    const rotationMatrixRef = useRef(new THREE.Matrix4())

    const lightColor = isDay ? '#ffe6c4' : color
    const lightIntensity = isDay ? 1.15 : intensity

    // Manage helper visibility
    useEffect(() => {
        if (!directionalLightRef.current) return
        
        if (debug && !helperRef.current) {
            // Create helper
            const helper = new THREE.DirectionalLightHelper(directionalLightRef.current, 1, 'red')
            helperRef.current = helper
            scene.add(helper)
        } else if (!debug && helperRef.current) {
            // Remove helper
            scene.remove(helperRef.current)
            helperRef.current.dispose()
            helperRef.current = null
        }
        
        return () => {
            // Cleanup on unmount
            if (helperRef.current) {
                scene.remove(helperRef.current)
                helperRef.current.dispose()
                helperRef.current = null
            }
        }
    }, [debug, scene])

    // Update light properties
    useEffect(() => {
        if (!directionalLightRef.current) return

        const light = directionalLightRef.current

        // Update light color and intensity
        light.color.set(lightColor)
        light.intensity = lightIntensity
    }, [lightColor, lightIntensity])

    useFrame((state) => {
        if (!directionalLightRef.current) return

        if (isDay) {
            positionRef.current.copy(daySunDirection).multiplyScalar(40)
        } else {
            const rotationY = state.clock.elapsedTime * rotationSpeed
            positionRef.current.copy(nightPosition)
            rotationMatrixRef.current.makeRotationY(rotationY)
            positionRef.current.applyMatrix4(rotationMatrixRef.current)
        }
        directionalLightRef.current.position.copy(positionRef.current)

        if (helperRef.current) {
            helperRef.current.update()
        }
    })

    return (
        <directionalLight ref={directionalLightRef} position={nightPosition.toArray()} intensity={1.0} />
    )
}

