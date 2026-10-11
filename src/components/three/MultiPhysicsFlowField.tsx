// ==============================================================================
// ADITHYA MECHNEXUS V18.1 — MULTI-PHYSICS FLOW FIELD
// High-fidelity scientific visualization system:
// Flowing parametric wireframe surfaces, connected node network (reference image),
// CFD streamlines, simulation particles, and subtle engineering grid.
// ==============================================================================

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Color definitions for Multi-Physics Palette
const COLOR_CYAN = new THREE.Color('#00e5ff');
const COLOR_BLUE = new THREE.Color('#3d7eff');
const COLOR_VIOLET = new THREE.Color('#7c3aed');
const COLOR_MAGENTA = new THREE.Color('#e040fb');

// ------------------------------------------------------------------------------
// LAYER 2 & 3: FLOWING PARAMETRIC WIREFRAME SURFACES WITH MULTI-PHYSICS PALETTE
// ------------------------------------------------------------------------------
const FlowingParametricSurface: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
  segX: number;
  segY: number;
  speed: number;
  phase: number;
  opacity: number;
  isReducedMotion: boolean;
}> = ({ position, rotation, width, height, segX, segY, speed, phase, opacity, isReducedMotion }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Initialize Plane Geometry
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, segX, segY);
    const count = geo.attributes.position.count;
    const colors = new Float32Array(count * 3);

    // Initial color allocation
    for (let i = 0; i < count; i++) {
      colors[i * 3] = COLOR_CYAN.r;
      colors[i * 3 + 1] = COLOR_CYAN.g;
      colors[i * 3 + 2] = COLOR_CYAN.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [width, height, segX, segY]);

  // Original vertex positions buffer
  const initialPositions = useMemo(() => {
    return (geometry.attributes.position.array as Float32Array).slice();
  }, [geometry]);

  // Vertex deformation frame loop
  useFrame((state) => {
    if (!meshRef.current || isReducedMotion) return;

    const t = state.clock.getElapsedTime() * speed + phase;
    const pos = geometry.attributes.position.array as Float32Array;
    const col = geometry.attributes.color.array as Float32Array;
    const count = geometry.attributes.position.count;

    for (let i = 0; i < count; i++) {
      const x = initialPositions[i * 3];
      const y = initialPositions[i * 3 + 1];

      // Multi-Physics Wave Formulation: CFD + Thermal + FEA Vibration
      const wave1 = Math.sin(x * 0.22 + t * 0.5) * Math.cos(y * 0.22 + t * 0.4) * 1.7;
      const wave2 = Math.sin((x + y) * 0.14 + t * 0.3) * 0.8;
      const wave3 = Math.cos(x * 0.08 - t * 0.2) * 0.5;
      const z = wave1 + wave2 + wave3;

      pos[i * 3 + 2] = z;

      // Color gradation by normalized height (multi-physics field: cyan -> blue -> violet -> magenta)
      const normZ = (z + 2.5) / 5.0; // 0 to 1
      let r = COLOR_CYAN.r, g = COLOR_CYAN.g, b = COLOR_CYAN.b;

      if (normZ < 0.33) {
        const factor = normZ / 0.33;
        r = THREE.MathUtils.lerp(COLOR_BLUE.r, COLOR_CYAN.r, factor);
        g = THREE.MathUtils.lerp(COLOR_BLUE.g, COLOR_CYAN.g, factor);
        b = THREE.MathUtils.lerp(COLOR_BLUE.b, COLOR_CYAN.b, factor);
      } else if (normZ < 0.66) {
        const factor = (normZ - 0.33) / 0.33;
        r = THREE.MathUtils.lerp(COLOR_CYAN.r, COLOR_VIOLET.r, factor);
        g = THREE.MathUtils.lerp(COLOR_CYAN.g, COLOR_VIOLET.g, factor);
        b = THREE.MathUtils.lerp(COLOR_CYAN.b, COLOR_VIOLET.b, factor);
      } else {
        const factor = (normZ - 0.66) / 0.34;
        r = THREE.MathUtils.lerp(COLOR_VIOLET.r, COLOR_MAGENTA.r, factor);
        g = THREE.MathUtils.lerp(COLOR_VIOLET.g, COLOR_MAGENTA.g, factor);
        b = THREE.MathUtils.lerp(COLOR_VIOLET.b, COLOR_MAGENTA.b, factor);
      }

      col[i * 3] = r;
      col[i * 3 + 1] = g;
      col[i * 3 + 2] = b;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  });

  // Clean disposal on unmount
  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} geometry={geometry}>
      <meshBasicMaterial
        wireframe
        vertexColors
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

// ------------------------------------------------------------------------------
// LAYER 5: CONNECTED NODE NETWORK (DIRECTLY INSPIRED BY USER REFERENCE IMAGE)
// Dynamic constellation of proximity-linked engineering nodes
// ------------------------------------------------------------------------------
const ConnectedNodeNetwork: React.FC<{
  nodeCount: number;
  connectionRadius: number;
  isReducedMotion: boolean;
}> = ({ nodeCount, connectionRadius, isReducedMotion }) => {
  const lineMeshRef = useRef<THREE.LineSegments>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Initialize node positions & velocities
  const [nodes, nodePositions, nodeColors] = useMemo(() => {
    const arr: Array<{ x: number; y: number; z: number; vx: number; vy: number; vz: number }> = [];
    const pos = new Float32Array(nodeCount * 3);
    const col = new Float32Array(nodeCount * 3);

    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 28;
      const y = (Math.random() - 0.5) * 16;
      const z = (Math.random() - 0.5) * 16 - 3;
      const vx = (Math.random() - 0.5) * 0.012;
      const vy = (Math.random() - 0.5) * 0.012;
      const vz = (Math.random() - 0.5) * 0.012;

      arr.push({ x, y, z, vx, vy, vz });
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Color assignment: cyan, blue, violet mix
      const rand = Math.random();
      const c = rand < 0.55 ? COLOR_CYAN : rand < 0.85 ? COLOR_BLUE : COLOR_VIOLET;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }

    return [arr, pos, col];
  }, [nodeCount]);

  // Pre-allocated line buffers for pairwise connection
  const maxLines = Math.floor(nodeCount * (nodeCount - 1) * 0.25);
  const linePositions = useMemo(() => new Float32Array(maxLines * 6), [maxLines]);
  const lineColors = useMemo(() => new Float32Array(maxLines * 6), [maxLines]);

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    return geo;
  }, [linePositions, lineColors]);

  const pointsGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));
    return geo;
  }, [nodePositions, nodeColors]);

  useFrame(() => {
    if (isReducedMotion) return;

    // Update node locations with subtle fluid velocity drift
    for (let i = 0; i < nodeCount; i++) {
      const n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      n.z += n.vz;

      // Soft boundary bounce
      if (Math.abs(n.x) > 15) n.vx *= -1;
      if (Math.abs(n.y) > 9) n.vy *= -1;
      if (n.z > 5 || n.z < -14) n.vz *= -1;

      nodePositions[i * 3] = n.x;
      nodePositions[i * 3 + 1] = n.y;
      nodePositions[i * 3 + 2] = n.z;
    }

    if (pointsRef.current) {
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Dynamic pairwise proximity connections (Reference Image constellation)
    let lineIdx = 0;
    const rSq = connectionRadius * connectionRadius;

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < rSq && lineIdx < maxLines) {
          const alpha = 1.0 - Math.sqrt(distSq) / connectionRadius;

          // Segment start
          linePositions[lineIdx * 6] = nodes[i].x;
          linePositions[lineIdx * 6 + 1] = nodes[i].y;
          linePositions[lineIdx * 6 + 2] = nodes[i].z;

          // Segment end
          linePositions[lineIdx * 6 + 3] = nodes[j].x;
          linePositions[lineIdx * 6 + 4] = nodes[j].y;
          linePositions[lineIdx * 6 + 5] = nodes[j].z;

          // Edge color scaled with proximity alpha
          lineColors[lineIdx * 6] = COLOR_CYAN.r * alpha * 0.8;
          lineColors[lineIdx * 6 + 1] = COLOR_CYAN.g * alpha * 0.8;
          lineColors[lineIdx * 6 + 2] = COLOR_CYAN.b * alpha * 0.8;

          lineColors[lineIdx * 6 + 3] = COLOR_BLUE.r * alpha * 0.8;
          lineColors[lineIdx * 6 + 4] = COLOR_BLUE.g * alpha * 0.8;
          lineColors[lineIdx * 6 + 5] = COLOR_BLUE.b * alpha * 0.8;

          lineIdx++;
        }
      }
    }

    // Update line geometry draw range
    lineGeometry.setDrawRange(0, lineIdx * 2);
    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.attributes.color.needsUpdate = true;
  });

  useEffect(() => {
    return () => {
      lineGeometry.dispose();
      pointsGeometry.dispose();
    };
  }, [lineGeometry, pointsGeometry]);

  return (
    <group>
      {/* Dynamic Proximity Lines */}
      <lineSegments ref={lineMeshRef} geometry={lineGeometry}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Nodes (Glowing Vertices) */}
      <points ref={pointsRef} geometry={pointsGeometry}>
        <pointsMaterial
          size={0.18}
          vertexColors
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

// ------------------------------------------------------------------------------
// LAYER 4: SIMULATION DATA PARTICLES
// Drifting along flow field lines with velocity renewal
// ------------------------------------------------------------------------------
const FlowParticles: React.FC<{
  count: number;
  isReducedMotion: boolean;
}> = ({ count, isReducedMotion }) => {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 36;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 24 - 4;

      const rand = Math.random();
      const c = rand < 0.5 ? COLOR_CYAN : rand < 0.8 ? COLOR_BLUE : COLOR_MAGENTA;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  useFrame((_, delta) => {
    if (isReducedMotion || !pointsRef.current) return;

    const pos = geometry.attributes.position.array as Float32Array;
    const clampedDelta = Math.min(delta, 0.05);

    for (let i = 0; i < count; i++) {
      // Flow along Z and undulating Y
      pos[i * 3 + 2] += clampedDelta * 0.9;
      pos[i * 3 + 1] += Math.sin(pos[i * 3] * 0.2 + pos[i * 3 + 2] * 0.1) * clampedDelta * 0.25;

      // Recycle particles passing viewer
      if (pos[i * 3 + 2] > 7) {
        pos[i * 3 + 2] = -24;
      }
    }

    geometry.attributes.position.needsUpdate = true;
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

// ------------------------------------------------------------------------------
// LAYER 6: CFD STREAMLINES
// Vector flow curves moving smoothly through space
// ------------------------------------------------------------------------------
const CFDStreamlines: React.FC<{ isReducedMotion: boolean }> = ({ isReducedMotion }) => {
  const groupRef = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const list: THREE.Line[] = [];
    const seedPoints = [
      [[-18, 3, -12], [-8, 5, -8], [2, 2, -6], [16, 4, -10]],
      [[-20, -2, -10], [-9, -3, -7], [3, -1, -5], [17, -2, -9]],
      [[-16, 6, -14], [-5, 4, -9], [6, 5, -8], [19, 7, -13]],
      [[-17, -4, -12], [-7, -5, -8], [5, -3, -6], [18, -4, -11]],
      [[-15, 0, -8], [-4, 1, -5], [7, 0, -6], [15, 1, -8]],
    ];

    seedPoints.forEach((pts, idx) => {
      const v = pts.map(p => new THREE.Vector3(p[0], p[1], p[2]));
      const curve = new THREE.CatmullRomCurve3(v);
      const points = curve.getPoints(60);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const color = idx % 3 === 0 ? COLOR_CYAN : idx % 3 === 1 ? COLOR_BLUE : COLOR_VIOLET;

      const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });

      list.push(new THREE.Line(geometry, material));
    });

    return list;
  }, []);

  useFrame((state) => {
    if (isReducedMotion || !groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.35) * 0.3;
    groupRef.current.position.x = Math.cos(t * 0.25) * 0.2;
  });

  useEffect(() => {
    return () => {
      lines.forEach((l) => {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      });
    };
  }, [lines]);

  return (
    <group ref={groupRef}>
      {lines.map((lineObj, idx) => (
        <primitive key={idx} object={lineObj} />
      ))}
    </group>
  );
};

// ------------------------------------------------------------------------------
// LAYER 7: SUBTLE ENGINEERING COORDINATE GRID
// Ground plane coordinates supporting scientific laboratory aesthetic
// ------------------------------------------------------------------------------
const SubtleCoordinateGrid: React.FC = () => {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((_, delta) => {
    if (gridRef.current) {
      gridRef.current.position.z = (gridRef.current.position.z + delta * 0.3) % 2;
    }
  });

  return (
    <group position={[0, -5, 0]}>
      <gridHelper
        ref={gridRef}
        args={[80, 80, new THREE.Color('#00e5ff'), new THREE.Color('#09162e')]}
      />
    </group>
  );
};

// ------------------------------------------------------------------------------
// MASTER MULTI-PHYSICS FLOW FIELD COMPONENT
// Adaptable device density, camera parallax, and performance governance
// ------------------------------------------------------------------------------
export const MultiPhysicsFlowField: React.FC = () => {
  const [deviceProfile, setDeviceProfile] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaMotion.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaMotion.addEventListener('change', handleMotionChange);

    // Responsive device profile detection
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        setDeviceProfile('mobile');
      } else if (width <= 1100) {
        setDeviceProfile('tablet');
      } else {
        setDeviceProfile('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      mediaMotion.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Adaptive density metrics
  const nodeCount = deviceProfile === 'desktop' ? 85 : deviceProfile === 'tablet' ? 50 : 28;
  const particleCount = deviceProfile === 'desktop' ? 380 : deviceProfile === 'tablet' ? 200 : 95;
  const connectionRadius = deviceProfile === 'desktop' ? 4.6 : deviceProfile === 'tablet' ? 4.2 : 3.8;

  return (
    <group>
      {/* LAYER 8: SUBTLE TECHNICAL STUDIO LIGHTING */}
      <ambientLight intensity={0.35} />
      <pointLight position={[-12, 8, 4]} intensity={2.0} color="#00e5ff" distance={30} />
      <pointLight position={[12, -6, 2]} intensity={1.8} color="#3d7eff" distance={30} />
      <pointLight position={[0, 10, -8]} intensity={1.5} color="#7c3aed" distance={25} />
      <pointLight position={[6, 8, -5]} intensity={1.2} color="#e040fb" distance={20} />

      {/* LAYER 2 & 3: FLOWING PARAMETRIC WIREFRAME SURFACES */}
      <FlowingParametricSurface
        position={[2, -0.5, -8]}
        rotation={[-Math.PI / 4, 0.15, -0.1]}
        width={36}
        height={24}
        segX={deviceProfile === 'desktop' ? 42 : 28}
        segY={deviceProfile === 'desktop' ? 28 : 20}
        speed={0.35}
        phase={0}
        opacity={0.32}
        isReducedMotion={isReducedMotion}
      />

      {deviceProfile !== 'mobile' && (
        <FlowingParametricSurface
          position={[-4, 2.5, -11]}
          rotation={[-Math.PI / 3.5, -0.2, 0.15]}
          width={30}
          height={20}
          segX={deviceProfile === 'desktop' ? 34 : 24}
          segY={deviceProfile === 'desktop' ? 24 : 16}
          speed={0.28}
          phase={Math.PI / 3}
          opacity={0.24}
          isReducedMotion={isReducedMotion}
        />
      )}

      {/* LAYER 5: CONNECTED NODE NETWORK (REFERENCE IMAGE CHARACTER) */}
      <ConnectedNodeNetwork
        nodeCount={nodeCount}
        connectionRadius={connectionRadius}
        isReducedMotion={isReducedMotion}
      />

      {/* LAYER 4: SIMULATION PARTICLES */}
      <FlowParticles count={particleCount} isReducedMotion={isReducedMotion} />

      {/* LAYER 6: CFD STREAMLINES */}
      <CFDStreamlines isReducedMotion={isReducedMotion} />

      {/* LAYER 7: SUBTLE COORDINATE ENGINEERING GRID */}
      <SubtleCoordinateGrid />
    </group>
  );
};
