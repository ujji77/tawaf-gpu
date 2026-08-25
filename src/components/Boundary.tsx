import { useMemo } from 'react';
import * as THREE from 'three/webgpu';
import { Fn, vec3, float, uv, smoothstep, sin } from 'three/tsl';
import { uTime } from '../core/shaders/uniforms';
import { FLOOR_BOUNDARY_RADIUS } from '../core/worldConfig';

const HEIGHT = 4;
const COLOR = new THREE.Color(0x33ff88);

export function Boundary({ visible = true }: { visible?: boolean }) {
  const material = useMemo(() => {
    const mat = new THREE.MeshBasicNodeMaterial();
    mat.transparent = true;
    mat.side = THREE.DoubleSide;
    mat.depthWrite = false;
    mat.blending = THREE.AdditiveBlending;

    mat.colorNode = vec3(COLOR.r, COLOR.g, COLOR.b);

    mat.opacityNode = Fn(() => {
      const v = uv().y; // 0 at bottom, 1 at top of the wall

      // Soft glow band: fades in from the ground and fades out before the top,
      // instead of a hard-edged cylinder.
      const vertical = smoothstep(float(0.0), float(0.35), v).mul(
        float(1.0).sub(smoothstep(float(0.55), float(1.0), v))
      );

      const shimmer = sin(v.mul(20.0).add(uTime.mul(1.5))).mul(0.08).add(0.92);

      return vertical.mul(shimmer).mul(0.08);
    })();

    return mat;
  }, []);

  return (
    <mesh visible={visible} position={[0, HEIGHT / 2, 0]} material={material}>
      <cylinderGeometry args={[FLOOR_BOUNDARY_RADIUS, FLOOR_BOUNDARY_RADIUS, HEIGHT, 128, 1, true]} />
    </mesh>
  );
}
