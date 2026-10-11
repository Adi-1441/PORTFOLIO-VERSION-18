// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — CFD STREAMLINE FLOW CURVES
// Aerodynamic streamline curves visualizing fluid velocity vectors.
// ==============================================================================

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const FlowLines: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const list: THREE.Line[] = [];
    const seedPoints = [
      [[-15, 2, -10], [-5, 4, -8], [4, 1, -6], [15, 3, -12]],
      [[-18, -1, -8], [-7, -2, -6], [2, 0, -5], [16, -1, -9]],
      [[-14, 5, -12], [-3, 3, -9], [5, 4, -7], [18, 6, -14]],
      [[-16, -3, -11], [-6, -4, -8], [6, -2, -6], [17, -4, -10]],
    ];

    seedPoints.forEach((pts, idx) => {
      const v = pts.map(p => new THREE.Vector3(p[0], p[1], p[2]));
      const curve = new THREE.CatmullRomCurve3(v);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: idx % 2 === 0 ? '#00e5ff' : '#3d7eff',
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });

      list.push(new THREE.Line(geometry, material));
    });

    return list;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {lines.map((lineObj, idx) => (
        <primitive key={idx} object={lineObj} />
      ))}
    </group>
  );
};
