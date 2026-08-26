import { useControls } from 'leva'
import { Background } from './Background'
import { Stars } from './Stars'
import { DaySky } from './DaySky'
import { useGameStore } from '../../core/store/gameStore'

export function StarrySky() {
    const skyMode = useGameStore((state) => state.skyMode)
    const control = useControls('StarrySky', {
        intensity: { value: 0.1, min: 0, max: 1, step: 0.01 },
        axis: { value: [0.2, 1, 0] },
        speed: { value: 1.5, min: 0, max: 5, step: 0.01 },
    }, { collapsed: true })

    return (
        <group>
            <group visible={skyMode === 'night'}>
                <Stars speed={control.speed} axis={control.axis} />
            </group>
            <DaySky />
            <Background intensity={control.intensity} axis={control.axis} speed={control.speed} />
        </group>
    )
}