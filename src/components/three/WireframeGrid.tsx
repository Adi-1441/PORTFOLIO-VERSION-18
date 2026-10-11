// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — CAD ENGINEERING WIREFRAME GROUND PLANE
// Infinite perspective grid with coordinate lines and vernier depth.
// ==============================================================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const WireframeGrid: React.FC = () => {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((_, delta) => {
    if (gridRef.current) {
      gridRef.current.position.z = (gridRef.current.position.z + delta * 0.4) % 2;
    }
  });

  return (
    <group position={[0, -4, 0]}>
      <gridHelper
        ref={gridRef}
        args={[80, 80, new THREE.Color('#00e5ff'), new THREE.Color('#112240')]}
      />
    </group>
  );
};
