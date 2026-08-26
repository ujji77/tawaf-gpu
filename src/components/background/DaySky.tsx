import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import { MathUtils, Vector3 } from 'three/webgpu';
import { useGameStore } from '../../core/store/gameStore';
import { daySunDirection } from './daySun';
import { SkyAtmosphere } from './SkyAtmosphere';

const sun = new Vector3();

export function DaySky() {
  const skyMode = useGameStore((state) => state.skyMode);
  const { camera } = useThree();

  const sky = useMemo(() => {
    const mesh = new SkyAtmosphere();
    mesh.scale.setScalar(450000);
    mesh.frustumCulled = false;
    return mesh;
  }, []);

  const params = useControls(
    'Day Sky',
    {
      turbidity: { value: 1.8, min: 0, max: 20, step: 0.1 },
      rayleigh: { value: 1.787, min: 0, max: 4, step: 0.001 },
      mieCoefficient: { value: 0.002, min: 0, max: 0.1, step: 0.001 },
      mieDirectionalG: { value: 0.631, min: 0, max: 1, step: 0.001 },
      elevation: { value: 2.6, min: 0, max: 90, step: 0.1 },
      azimuth: { value: 180, min: -180, max: 180, step: 0.1 },
      showSunDisc: true,
    },
    { collapsed: true }
  );

  const clouds = useControls(
    'Day Sky.Clouds',
    {
      coverage: { value: 0.27, min: 0, max: 1, step: 0.01 },
      density: { value: 0.77, min: 0, max: 1, step: 0.01 },
      elevation: { value: 0.5, min: 0, max: 1, step: 0.01 },
    },
    { collapsed: false }
  );

  useEffect(() => {
    return () => {
      sky.geometry.dispose();
      sky.material.dispose();
    };
  }, [sky]);

  useFrame(({ clock }) => {
    sky.visible = skyMode === 'day';
    if (!sky.visible) return;

    sky.position.copy(camera.position);

    sky.turbidity.value = params.turbidity;
    sky.rayleigh.value = params.rayleigh;
    sky.mieCoefficient.value = params.mieCoefficient;
    sky.mieDirectionalG.value = params.mieDirectionalG;
    sky.showSunDisc.value = params.showSunDisc ? 1 : 0;
    sky.cloudCoverage.value = clouds.coverage;
    sky.cloudDensity.value = clouds.density;
    sky.cloudElevation.value = clouds.elevation;
    sky.time.value = clock.elapsedTime;

    const phi = MathUtils.degToRad(90 - params.elevation);
    const theta = MathUtils.degToRad(params.azimuth);
    sun.setFromSphericalCoords(1, phi, theta);
    sky.sunPosition.value.copy(sun);
    daySunDirection.copy(sun);
  });

  return <primitive object={sky} />;
}
