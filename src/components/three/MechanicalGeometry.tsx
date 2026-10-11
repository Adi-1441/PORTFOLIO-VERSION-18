// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — FLOATING MECHANICAL GEOMETRY
// Precision gears, FEA triangulated mesh surfaces, and gimbal assemblies.
// ==============================================================================

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const MechanicalGeometry: React.FC = () => {
  const gearGroupRef = useRef<THREE.Group>(null);
  const ringGroupRef = useRef<THREE.Group>(null);
  const feaSurfaceRef = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    // Gear assembly rotation
    if (gearGroupRef.current) {
      gearGroupRef.current.rotation.z += delta * 0.15;
      gearGroupRef.current.rotation.y += delta * 0.05;
    }

    // Outer gimbal gyro rotation
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.x += delta * 0.08;
      ringGroupRef.current.rotation.y -= delta * 0.12;
    }

    // Torus pitch circle
    if (torusRef.current) {
      torusRef.current.rotation.x += delta * 0.2;
      torusRef.current.rotation.z += delta * 0.1;
    }

    // FEA Surface subtle breathing wave
    if (feaSurfaceRef.current) {
      const time = state.clock.getElapsedTime();
      feaSurfaceRef.current.rotation.y = Math.sin(time * 0.3) * 0.2;
      feaSurfaceRef.current.position.y = 1 + Math.sin(time * 0.5) * 0.3;
    }
  });

  return (
    <group position={[3.5, 0.5, -6]}>
      {/* Central Rotating Mechanical Gear Assembly */}
      <group ref={gearGroupRef}>
        {/* Core Hub */}
        <mesh>
          <cylinderGeometry args={[1.2, 1.2, 0.4, 24]} />
          <meshStandardMaterial
            color="#081426"
            roughness={0.3}
            metalness={0.8}
            wireframe={true}
          />
        </mesh>

        {/* Pitch Circle Indicator */}
        <mesh>
          <ringGeometry args={[1.5, 1.55, 36]} />
          <meshBasicMaterial color="#00e5ff" side={THREE.DoubleSide} transparent opacity={0.6} />
        </mesh>

        {/* Outer Teeth Ring */}
        <mesh>
          <torusGeometry args={[2.0, 0.08, 16, 48]} />
          <meshStandardMaterial color="#3d7eff" emissive="#00e5ff" emissiveIntensity={0.2} wireframe />
        </mesh>
      </group>

      {/* Gyroscopic Gimbal Rings (Engineering Kinematics) */}
      <group ref={ringGroupRef}>
        <mesh>
          <torusGeometry args={[3.2, 0.04, 16, 64]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.35} />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[3.6, 0.03, 16, 64]} />
          <meshBasicMaterial color="#7c3aed" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* FEA Triangular Surface Mesh Representation */}
      <mesh ref={feaSurfaceRef} position={[-7, 1.5, -4]} rotation={[0.4, 0.8, 0]}>
        <icosahedronGeometry args={[2.2, 2]} />
        <meshStandardMaterial
          color="#0b1b36"
          emissive="#3d7eff"
          emissiveIntensity={0.15}
          wireframe={true}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Secondary Abstract Rotor on Left */}
      <mesh ref={torusRef} position={[-9, -2, -8]}>
        <torusKnotGeometry args={[1.5, 0.3, 64, 16, 2, 3]} />
        <meshStandardMaterial
          color="#061224"
          emissive="#7c3aed"
          emissiveIntensity={0.25}
          wireframe={true}
        />
      </mesh>
    </group>
  );
};
