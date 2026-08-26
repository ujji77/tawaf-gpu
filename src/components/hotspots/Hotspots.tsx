import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three/webgpu';
import { float, vec3 } from 'three/tsl';
import { useGameStore } from '../../core/store/gameStore';
import { HOTSPOTS, type HotspotId } from './config';
import { uTime } from '../../core/shaders/uniforms';

function createHotspotMaterial() {
  const mat = new THREE.MeshBasicNodeMaterial();
  mat.transparent = true;
  mat.depthWrite = false;
  mat.depthTest = true;
  mat.blending = THREE.AdditiveBlending;
  mat.colorNode = vec3(0.42, 0.32, 0.16);
  mat.opacityNode = float(0.2);
  return mat;
}

export function Hotspots({ visible = true }: { visible?: boolean }) {
  const characterRef = useGameStore((state) => state.characterRef);
  const goToHotspot = useGameStore((state) => state.goToHotspot);
  const hysteresis = useRef<string | null>(null);
  const root = useRef<THREE.Group>(null);
  const material = useMemo(() => createHotspotMaterial(), []);

  useFrame(() => {
    const { nearbyHotspotId, setNearbyHotspotId, isHudHidden } = useGameStore.getState();
    const show = visible && !isHudHidden;
    if (root.current) root.current.visible = show;

    const character = characterRef?.current;
    if (!character || !show) {
      if (nearbyHotspotId) setNearbyHotspotId(null);
      return;
    }

    const { x, z } = character.position;
    let closestId: string | null = null;
    let closestDist = Infinity;

    for (const hotspot of HOTSPOTS) {
      const dist = Math.hypot(x - hotspot.position[0], z - hotspot.position[2]);
      const reach = hotspot.id === hysteresis.current ? hotspot.radius + 0.8 : hotspot.radius;
      if (dist < reach && dist < closestDist) {
        closestDist = dist;
        closestId = hotspot.id;
      }
    }

    hysteresis.current = closestId;
    if (closestId !== nearbyHotspotId) setNearbyHotspotId(closestId);
  });

  return (
    <group ref={root} visible={visible}>
      {HOTSPOTS.map((hotspot) => (
        <HotspotMarker
          key={hotspot.id}
          id={hotspot.id}
          position={hotspot.position}
          material={material}
          onSelect={() => goToHotspot(hotspot.id)}
        />
      ))}
    </group>
  );
}

function HotspotMarker({
  id,
  position,
  material,
  onSelect,
}: {
  id: HotspotId;
  position: [number, number, number];
  material: THREE.MeshBasicNodeMaterial;
  onSelect: () => void;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    const { nearbyHotspotId, guidedHotspotId } = useGameStore.getState();
    const active = id === nearbyHotspotId || id === guidedHotspotId;
    group.current.scale.setScalar(active ? 1 + Math.sin(uTime.value * 2.2) * 0.06 : 1);
  });

  return (
    <group
      ref={group}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={material}>
        <ringGeometry args={[0.55, 0.78, 32]} />
      </mesh>
      <mesh position={[0, 1.15, 0]} material={material}>
        <cylinderGeometry args={[0.045, 0.045, 2.3, 8]} />
      </mesh>
      <mesh position={[0, 2.45, 0]} material={material}>
        <sphereGeometry args={[0.14, 16, 16]} />
      </mesh>
    </group>
  );
}
