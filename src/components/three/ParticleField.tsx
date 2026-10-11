// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — CFD/FEA SIMULATION PARTICLE FIELD
// Real-time floating particle nodes with vector velocity drift.
// ==============================================================================

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({ count = 350 }) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate deterministic particle cloud
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const cyan = new THREE.Color('#00e5ff');
    const blue = new THREE.Color('#3d7eff');
    const violet = new THREE.Color('#7c3aed');

    for (let i = 0; i < count; i++) {
      // Spatial distribution across frustum
      pos[i * 3] = (Math.random() - 0.5) * 35;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25 - 5;

      // Color interpolation: fluid thermal gradient
      const choice = Math.random();
      const c = choice < 0.6 ? cyan : choice < 0.85 ? blue : violet;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // Subtle flow field velocity along Z and Y
      pos[i * 3 + 2] += delta * 0.8;
      pos[i * 3 + 1] += Math.sin(pos[i * 3] * 0.2 + pos[i * 3 + 2] * 0.1) * delta * 0.2;

      // Recycle particles passing camera
      if (pos[i * 3 + 2] > 6) {
        pos[i * 3 + 2] = -25;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
