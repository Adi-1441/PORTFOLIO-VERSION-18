// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — LIVE POLYGON-NETWORK BACKGROUND
// Technical Aerospace Low-Poly Constellation Canvas 2D Engine
// Bowyer-Watson Delaunay triangulation, position-dependent teal/aqua & blue facets,
// warm-yellow node accents, delta-time RAF loop, pointer attraction, parallax,
// and accessible reduced-motion static fallback.
// ==============================================================================

import React, { useEffect, useRef, useState } from 'react';
import { useCursor } from '../../context/CursorContext';

// ------------------------------------------------------------------------------
// CONFIGURATION CONSTANTS (Easily tunable for aerospace aesthetics)
// ------------------------------------------------------------------------------
export const POLYGON_NETWORK_CONFIG = {
  // Node counts
  nodeCountDesktop: 115, // Desktop target: 90–140
  nodeCountMobile: 48,   // Mobile target: 40–60
  mobileBreakpoint: 768,

  // Geometry & Connections
  maxEdgeLengthDesktop: 240, // Max distance for triangle edges (desktop)
  maxEdgeLengthMobile: 170,  // Max distance for triangle edges (mobile)
  triangulationInterval: 4,  // Recalculate Delaunay every N frames (controlled mesh updates)

  // Motion & Physics
  driftSpeed: 18,            // Pixels per second base drift
  driftNoise: 4,             // Brownian jitter speed
  pointerRadius: 180,        // Radius of pointer attraction
  pointerStrength: 0.18,     // Restrained elastic pull towards pointer
  pointerDampening: 0.92,    // Elastic return dampening
  parallaxFactorX: 18,       // Parallax pixel amplitude X
  parallaxFactorY: 12,       // Parallax pixel amplitude Y
  parallaxLerp: 0.04,        // Parallax smoothing speed

  // Visual Nodes
  warmNodeRatio: 0.06,       // ~6% restrained warm-yellow telemetry nodes
  nodeRadiusCyanMin: 1.2,
  nodeRadiusCyanMax: 2.2,
  nodeRadiusWarm: 2.4,

  // Glowing Centers (relative 0.0 to 1.0)
  glowCenter: { x: 0.64, y: 0.70 }, // Lower-centre to centre-right focal point
  glowRadiusMinRatio: 0.35,
  glowRadiusMaxRatio: 0.55,
  glowPulsePeriod: 6.0,             // Seconds per breathing pulse

  // Facet Regions (normalized coordinates 0.0 to 1.0)
  facetRegions: {
    tealAquaCenter: { x: 0.65, y: 0.72, radius: 0.42 }, // Lower-centre to centre-right
    upperRightBlue: { x: 0.82, y: 0.22, radius: 0.38 }, // Blue facets upper-right
    midLeftBlue: { x: 0.24, y: 0.52, radius: 0.35 },    // Blue facets mid-left
  },

  // Aerospace Color Palette (Strictly NO Purple)
  palette: {
    bgVoid: '#02050e',
    vignetteInner: 'rgba(2, 6, 16, 0.40)',
    vignetteOuter: 'rgba(1, 3, 7, 0.88)',

    // Nodes
    nodeCyan: '#a5f3fc',
    nodeCyanGlow: 'rgba(0, 229, 255, 0.45)',
    nodeWarm: '#fbbf24',
    nodeWarmGlow: 'rgba(245, 158, 11, 0.65)',

    // Lines
    lineCyanWhite: 'rgba(195, 245, 255, 0.40)',
    lineCyanTeal: 'rgba(45, 212, 191, 0.28)',
    lineBlue: 'rgba(59, 130, 246, 0.22)',
    lineFaint: 'rgba(0, 229, 255, 0.08)',

    // Triangular Facets (R, G, B)
    facetAqua: { r: 45, g: 212, b: 191 },     // Bright teal/aqua #2dd4bf
    facetTealDark: { r: 13, g: 148, b: 136 }, // Deep teal #0d9488
    facetBlueBright: { r: 59, g: 130, b: 246 },// Sky-blue #3b82f6
    facetBlueDeep: { r: 30, g: 64, b: 175 },  // Royal aerospace blue #1e40af
  },

  // Pulses
  maxPulses: 3,
  pulseSpeed: 0.85,
};

// ------------------------------------------------------------------------------
// GEOMETRIC & BOWYER-WATSON DELAUNAY ALGORITHM (Pure TypeScript, Zero Deps)
// ------------------------------------------------------------------------------
interface NodePoint {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  isWarm: boolean;
  shimmerPhase: number;
  shimmerSpeed: number;
  dragX: number;
  dragY: number;
}

interface Triangle {
  a: number;
  b: number;
  c: number;
}

interface RenderEdge {
  a: number;
  b: number;
  length: number;
}

interface RenderFacet {
  tri: Triangle;
  centroidX: number;
  centroidY: number;
  colorStr: string;
  alpha: number;
  currentAlpha: number;
}

interface EdgePulse {
  edgeIndex: number;
  progress: number; // 0.0 to 1.0
  speed: number;
}

// InCircumcircle robust geometric predicate
function inCircumcircle(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
  cx: number, cy: number
): boolean {
  const dax = ax - px;
  const day = ay - py;
  const dbx = bx - px;
  const dby = by - py;
  const dcx = cx - px;
  const dcy = cy - py;

  const det = (dax * dax + day * day) * (dbx * dcy - dcx * dby) -
              (dbx * dbx + dby * dby) * (dax * dcy - dcx * day) +
              (dcx * dcx + dcy * dcy) * (dax * dby - dbx * day);

  const ccw = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  return ccw > 0 ? det > 1e-6 : det < -1e-6;
}

// Computes Bowyer-Watson Delaunay Triangulation
function computeDelaunay(
  points: NodePoint[],
  width: number,
  height: number,
  maxEdgeLength: number
): { triangles: Triangle[]; edges: RenderEdge[] } {
  const n = points.length;
  if (n < 3) return { triangles: [], edges: [] };

  // 1. Create encompassing super-triangle
  const margin = Math.max(width, height) * 4;
  const midX = width / 2;
  const midY = height / 2;

  const superA = { x: midX - margin, y: midY - margin };
  const superB = { x: midX + margin, y: midY - margin };
  const superC = { x: midX, y: midY + margin * 2 };

  const allX = new Float64Array(n + 3);
  const allY = new Float64Array(n + 3);
  for (let i = 0; i < n; i++) {
    allX[i] = points[i].x;
    allY[i] = points[i].y;
  }
  allX[n] = superA.x; allY[n] = superA.y;
  allX[n + 1] = superB.x; allY[n + 1] = superB.y;
  allX[n + 2] = superC.x; allY[n + 2] = superC.y;

  let triangles: Triangle[] = [{ a: n, b: n + 1, c: n + 2 }];

  // 2. Incremental point insertion
  for (let i = 0; i < n; i++) {
    const px = allX[i];
    const py = allY[i];

    const bad: Triangle[] = [];
    for (let t = 0; t < triangles.length; t++) {
      const tri = triangles[t];
      if (inCircumcircle(
        px, py,
        allX[tri.a], allY[tri.a],
        allX[tri.b], allY[tri.b],
        allX[tri.c], allY[tri.c]
      )) {
        bad.push(tri);
      }
    }

    // Find boundary polygon
    const edgeCounts = new Map<string, number>();
    for (let b = 0; b < bad.length; b++) {
      const tri = bad[b];
      const triEdges = [
        [tri.a, tri.b],
        [tri.b, tri.c],
        [tri.c, tri.a]
      ];
      for (let e = 0; e < 3; e++) {
        const u = triEdges[e][0];
        const v = triEdges[e][1];
        const key = u < v ? `${u},${v}` : `${v},${u}`;
        edgeCounts.set(key, (edgeCounts.get(key) || 0) + 1);
      }
    }

    // Filter out bad triangles
    triangles = triangles.filter(t => !bad.includes(t));

    // Form new triangles with boundary edges
    edgeCounts.forEach((count, key) => {
      if (count === 1) {
        const comma = key.indexOf(',');
        const u = Number(key.substring(0, comma));
        const v = Number(key.substring(comma + 1));
        triangles.push({ a: u, b: v, c: i });
      }
    });
  }

  // 3. Remove triangles connected to super-triangle and filter edge lengths
  const validTriangles: Triangle[] = [];
  const edgeSet = new Map<string, RenderEdge>();
  const maxEdge2 = maxEdgeLength * maxEdgeLength;

  for (let t = 0; t < triangles.length; t++) {
    const tri = triangles[t];
    if (tri.a >= n || tri.b >= n || tri.c >= n) continue;

    const pA = points[tri.a];
    const pB = points[tri.b];
    const pC = points[tri.c];

    const dAB2 = (pA.x - pB.x) ** 2 + (pA.y - pB.y) ** 2;
    const dBC2 = (pB.x - pC.x) ** 2 + (pB.y - pC.y) ** 2;
    const dCA2 = (pC.x - pA.x) ** 2 + (pC.y - pA.y) ** 2;

    // Filter out excessively large triangles spanning open void
    if (dAB2 <= maxEdge2 && dBC2 <= maxEdge2 && dCA2 <= maxEdge2) {
      validTriangles.push(tri);

      // Collect unique edges
      const triEdges: [number, number, number][] = [
        [tri.a, tri.b, Math.sqrt(dAB2)],
        [tri.b, tri.c, Math.sqrt(dBC2)],
        [tri.c, tri.a, Math.sqrt(dCA2)]
      ];
      for (const [u, v, len] of triEdges) {
        const key = u < v ? `${u},${v}` : `${v},${u}`;
        if (!edgeSet.has(key)) {
          edgeSet.set(key, { a: u, b: v, length: len });
        }
      }
    }
  }

  return {
    triangles: validTriangles,
    edges: Array.from(edgeSet.values()),
  };
}

// ------------------------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------------------------
export const PolygonNetworkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { reducedMotion, pointerRef } = useCursor();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      setHasError(true);
      return;
    }

    let isDestroyed = false;
    let animId: number | null = null;
    let lastTimestamp = performance.now();
    let frameCount = 0;
    let timeAccumulator = 0;

    // Dynamic sizing and performance adaptation
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let isMobile = width < POLYGON_NETWORK_CONFIG.mobileBreakpoint;
    let targetNodeCount = isMobile
      ? POLYGON_NETWORK_CONFIG.nodeCountMobile
      : POLYGON_NETWORK_CONFIG.nodeCountDesktop;
    let maxEdgeLength = isMobile
      ? POLYGON_NETWORK_CONFIG.maxEdgeLengthMobile
      : POLYGON_NETWORK_CONFIG.maxEdgeLengthDesktop;

    // Parallax tracking
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    // Performance adaptation metrics
    let recentFrameTimes: number[] = [];
    let isPerformanceThrottled = false;

    // Initial node generation with organic distribution (dense center/right, sparse edges)
    const initNodes = (count: number): NodePoint[] => {
      const result: NodePoint[] = [];
      const padding = 40;

      for (let i = 0; i < count; i++) {
        // Biased distribution: more nodes in center-right and lower-center
        const biasU = Math.random();
        const biasV = Math.random();
        let posX: number;
        let posY: number;

        if (biasU < 0.65) {
          // Cluster around lower-center / center-right
          posX = width * (0.35 + Math.random() * 0.55);
          posY = height * (0.30 + Math.random() * 0.60);
        } else {
          // Distributed across entire canvas
          posX = padding + Math.random() * (width - padding * 2);
          posY = padding + Math.random() * (height - padding * 2);
        }

        const angle = Math.random() * Math.PI * 2;
        const speed = (0.5 + Math.random() * 0.5) * POLYGON_NETWORK_CONFIG.driftSpeed;
        const isWarm = Math.random() < POLYGON_NETWORK_CONFIG.warmNodeRatio;

        result.push({
          x: posX,
          y: posY,
          baseX: posX,
          baseY: posY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: isWarm
            ? POLYGON_NETWORK_CONFIG.nodeRadiusWarm
            : POLYGON_NETWORK_CONFIG.nodeRadiusCyanMin +
              Math.random() * (POLYGON_NETWORK_CONFIG.nodeRadiusCyanMax - POLYGON_NETWORK_CONFIG.nodeRadiusCyanMin),
          isWarm,
          shimmerPhase: Math.random() * Math.PI * 2,
          shimmerSpeed: 0.8 + Math.random() * 1.4,
          dragX: 0,
          dragY: 0,
        });
      }
      return result;
    };

    let nodes = initNodes(targetNodeCount);
    let cachedMesh: { triangles: Triangle[]; edges: RenderEdge[] } = { triangles: [], edges: [] };
    let cachedFacets: RenderFacet[] = [];
    let pulses: EdgePulse[] = [];

    // Resize handler with canvas buffer resolution scaling
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      isMobile = width < POLYGON_NETWORK_CONFIG.mobileBreakpoint;
      targetNodeCount = isMobile
        ? POLYGON_NETWORK_CONFIG.nodeCountMobile
        : (isPerformanceThrottled ? 85 : POLYGON_NETWORK_CONFIG.nodeCountDesktop);
      maxEdgeLength = isMobile
        ? POLYGON_NETWORK_CONFIG.maxEdgeLengthMobile
        : POLYGON_NETWORK_CONFIG.maxEdgeLengthDesktop;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Rescale existing nodes to fit new dimensions
      nodes.forEach(n => {
        n.x = Math.max(20, Math.min(width - 20, (n.x / (canvas.width / dpr || width)) * width));
        n.y = Math.max(20, Math.min(height - 20, (n.y / (canvas.height / dpr || height)) * height));
      });

      // Adjust node count if transitioning between mobile/desktop
      if (nodes.length < targetNodeCount) {
        const extra = initNodes(targetNodeCount - nodes.length);
        nodes.push(...extra);
      } else if (nodes.length > targetNodeCount) {
        nodes = nodes.slice(0, targetNodeCount);
      }

      // Force immediate Delaunay rebuild on resize
      try {
        cachedMesh = computeDelaunay(nodes, width, height, maxEdgeLength);
        cachedFacets = buildFacets(cachedMesh.triangles, nodes, width, height);
      } catch (err) {
        console.error('[POLYGON BG] Triangulation resize error:', err);
      }
    };

    // Calculate position-dependent color and opacity for each facet
    const buildFacets = (triangles: Triangle[], pts: NodePoint[], w: number, h: number): RenderFacet[] => {
      const facets: RenderFacet[] = [];
      const { facetRegions, palette } = POLYGON_NETWORK_CONFIG;

      for (let i = 0; i < triangles.length; i++) {
        const tri = triangles[i];
        const pA = pts[tri.a];
        const pB = pts[tri.b];
        const pC = pts[tri.c];

        const cx = (pA.x + pB.x + pC.x) / 3;
        const cy = (pA.y + pB.y + pC.y) / 3;
        const nx = cx / w;
        const ny = cy / h;

        // Distance to Teal/Aqua focal center
        const dAqua = Math.hypot(nx - facetRegions.tealAquaCenter.x, ny - facetRegions.tealAquaCenter.y);
        const aquaWeight = Math.max(0, 1 - dAqua / facetRegions.tealAquaCenter.radius);

        // Distance to Upper-Right Blue
        const dBlueUR = Math.hypot(nx - facetRegions.upperRightBlue.x, ny - facetRegions.upperRightBlue.y);
        const blueURWeight = Math.max(0, 1 - dBlueUR / facetRegions.upperRightBlue.radius);

        // Distance to Mid-Left Blue
        const dBlueML = Math.hypot(nx - facetRegions.midLeftBlue.x, ny - facetRegions.midLeftBlue.y);
        const blueMLWeight = Math.max(0, 1 - dBlueML / facetRegions.midLeftBlue.radius);

        // Edge fade factor (sparse nodes and minimal fills near edges)
        const edgeDistX = Math.min(nx, 1 - nx);
        const edgeDistY = Math.min(ny, 1 - ny);
        const edgeWeight = Math.min(1, Math.min(edgeDistX, edgeDistY) / 0.12);

        // Compute blended facet color and opacity
        let r = palette.facetBlueDeep.r;
        let g = palette.facetBlueDeep.g;
        let b = palette.facetBlueDeep.b;
        let alpha = 0.02;

        if (aquaWeight > blueURWeight && aquaWeight > blueMLWeight) {
          // Dominant Teal/Aqua facet (lower-center to center-right)
          const factor = Math.min(1, aquaWeight * 1.3);
          r = Math.round(palette.facetTealDark.r * (1 - factor) + palette.facetAqua.r * factor);
          g = Math.round(palette.facetTealDark.g * (1 - factor) + palette.facetAqua.g * factor);
          b = Math.round(palette.facetTealDark.b * (1 - factor) + palette.facetAqua.b * factor);
          alpha = (0.05 + factor * 0.16) * edgeWeight;
        } else if (blueURWeight > blueMLWeight) {
          // Upper-Right Sky Blue facet
          const factor = Math.min(1, blueURWeight * 1.2);
          r = Math.round(palette.facetBlueDeep.r * (1 - factor) + palette.facetBlueBright.r * factor);
          g = Math.round(palette.facetBlueDeep.g * (1 - factor) + palette.facetBlueBright.g * factor);
          b = Math.round(palette.facetBlueDeep.b * (1 - factor) + palette.facetBlueBright.b * factor);
          alpha = (0.04 + factor * 0.13) * edgeWeight;
        } else if (blueMLWeight > 0.05) {
          // Mid-Left Atmospheric Blue facet
          const factor = Math.min(1, blueMLWeight * 1.2);
          r = palette.facetBlueDeep.r;
          g = Math.round(palette.facetBlueDeep.g + factor * 35);
          b = Math.round(palette.facetBlueDeep.b + factor * 50);
          alpha = (0.03 + factor * 0.11) * edgeWeight;
        } else {
          // Background/Peripheral facet: ultra-sheer dark cyan
          r = 10;
          g = 45;
          b = 90;
          alpha = 0.025 * edgeWeight;
        }

        facets.push({
          tri,
          centroidX: cx,
          centroidY: cy,
          colorStr: `${r}, ${g}, ${b}`,
          alpha,
          currentAlpha: alpha,
        });
      }

      return facets;
    };

    // Initialize dimensions and initial mesh
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    // Handle document visibility to pause animation and avoid tab-sleep stutter
    let isTabHidden = document.hidden;
    const handleVisibilityChange = () => {
      isTabHidden = document.hidden;
      if (!isTabHidden) {
        lastTimestamp = performance.now();
        if (!animId && !reducedMotion) {
          animId = requestAnimationFrame(renderLoop);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // --------------------------------------------------------------------------
    // MAIN COORDINATED RAF LOOP (DELTA-TIME DRIVEN)
    // --------------------------------------------------------------------------
    const renderLoop = (timestamp: number) => {
      if (isDestroyed) return;

      if (isTabHidden) {
        animId = null;
        return;
      }

      // Delta-time clamped between 0.001s and 0.064s (resists frame drops)
      const rawDelta = (timestamp - lastTimestamp) / 1000;
      const dt = Math.min(Math.max(rawDelta, 0.001), 0.064);
      lastTimestamp = timestamp;
      timeAccumulator += dt;
      frameCount++;

      // Track frame times for adaptive performance regulation
      recentFrameTimes.push(rawDelta * 1000);
      if (recentFrameTimes.length > 40) {
        recentFrameTimes.shift();
        const avgFrameTime = recentFrameTimes.reduce((a, b) => a + b, 0) / recentFrameTimes.length;
        if (avgFrameTime > 25 && !isPerformanceThrottled && !isMobile) {
          // Throttling down to lighter node count on slower GPUs
          isPerformanceThrottled = true;
          targetNodeCount = 85;
          nodes = nodes.slice(0, targetNodeCount);
        }
      }

      try {
        // Read mouse position from shared pointerRef without React re-renders
        const pointer = pointerRef.current;
        const hasPointer = pointer && pointer.active && pointer.x > 0 && pointer.y > 0;

        // 1. UPDATE PARALLAX SMOOTHING
        let targetOffsetX = 0;
        let targetOffsetY = 0;
        if (hasPointer && !reducedMotion) {
          const normPX = (pointer.x / width) - 0.5;
          const normPY = (pointer.y / height) - 0.5;
          targetOffsetX = -normPX * POLYGON_NETWORK_CONFIG.parallaxFactorX;
          targetOffsetY = -normPY * POLYGON_NETWORK_CONFIG.parallaxFactorY;
        }
        currentParallaxX += (targetOffsetX - currentParallaxX) * POLYGON_NETWORK_CONFIG.parallaxLerp;
        currentParallaxY += (targetOffsetY - currentParallaxY) * POLYGON_NETWORK_CONFIG.parallaxLerp;

        // 2. UPDATE NODES (Physics, Drift, Pointer Attraction)
        const pRadius = POLYGON_NETWORK_CONFIG.pointerRadius;
        const pStrength = POLYGON_NETWORK_CONFIG.pointerStrength;

        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];

          if (!reducedMotion) {
            // Natural Brownian drift
            node.x += node.vx * dt;
            node.y += node.vy * dt;

            // Soft wall bounce within margins
            const margin = 15;
            if (node.x < margin) {
              node.x = margin;
              node.vx = Math.abs(node.vx);
            } else if (node.x > width - margin) {
              node.x = width - margin;
              node.vx = -Math.abs(node.vx);
            }
            if (node.y < margin) {
              node.y = margin;
              node.vy = Math.abs(node.vy);
            } else if (node.y > height - margin) {
              node.y = height - margin;
              node.vy = -Math.abs(node.vy);
            }

            // Gentle Pointer Attraction
            if (hasPointer) {
              const dx = pointer.x - node.x;
              const dy = pointer.y - node.y;
              const dist = Math.hypot(dx, dy);

              if (dist < pRadius && dist > 1) {
                const pullFactor = (1 - dist / pRadius) * pStrength;
                node.dragX += (dx * pullFactor - node.dragX) * 0.12;
                node.dragY += (dy * pullFactor - node.dragY) * 0.12;
              } else {
                node.dragX *= POLYGON_NETWORK_CONFIG.pointerDampening;
                node.dragY *= POLYGON_NETWORK_CONFIG.pointerDampening;
              }
            } else {
              node.dragX *= POLYGON_NETWORK_CONFIG.pointerDampening;
              node.dragY *= POLYGON_NETWORK_CONFIG.pointerDampening;
            }
          }
        }

        // 3. CONTROLLED DELAUNAY MESH UPDATE (Every N frames to eliminate CPU overhead)
        if (!reducedMotion && frameCount % POLYGON_NETWORK_CONFIG.triangulationInterval === 0) {
          // Compute updated Delaunay based on effective rendered positions
          const effectivePoints = nodes.map(n => ({
            ...n,
            x: n.x + n.dragX,
            y: n.y + n.dragY,
          }));

          cachedMesh = computeDelaunay(effectivePoints, width, height, maxEdgeLength);
          cachedFacets = buildFacets(cachedMesh.triangles, effectivePoints, width, height);

          // Spawn occasional subtle edge pulse
          if (pulses.length < POLYGON_NETWORK_CONFIG.maxPulses && Math.random() < 0.08 && cachedMesh.edges.length > 0) {
            const randomEdge = Math.floor(Math.random() * cachedMesh.edges.length);
            pulses.push({
              edgeIndex: randomEdge,
              progress: 0,
              speed: POLYGON_NETWORK_CONFIG.pulseSpeed + Math.random() * 0.5,
            });
          }
        }

        // Update active edge pulses
        if (!reducedMotion) {
          for (let p = pulses.length - 1; p >= 0; p--) {
            pulses[p].progress += pulses[p].speed * dt;
            if (pulses[p].progress >= 1.0) {
              pulses.splice(p, 1);
            }
          }
        }

        // 4. CANVAS RENDERING
        ctx.save();
        ctx.scale(dpr, dpr);

        // Clear canvas with near-black navy base
        ctx.fillStyle = POLYGON_NETWORK_CONFIG.palette.bgVoid;
        ctx.fillRect(0, 0, width, height);

        // SLOW CENTRAL GLOW: concentrated around lower-centre to centre-right
        const glowPulse = reducedMotion
          ? 1.0
          : 0.88 + 0.12 * Math.sin((timeAccumulator / POLYGON_NETWORK_CONFIG.glowPulsePeriod) * Math.PI * 2);
        const glowX = width * POLYGON_NETWORK_CONFIG.glowCenter.x;
        const glowY = height * POLYGON_NETWORK_CONFIG.glowCenter.y;
        const glowR = Math.min(width, height) * 0.52 * glowPulse;

        const radialGlow = ctx.createRadialGradient(glowX, glowY, 15, glowX, glowY, glowR);
        radialGlow.addColorStop(0, `rgba(45, 212, 191, ${0.16 * glowPulse})`);
        radialGlow.addColorStop(0.35, `rgba(13, 148, 136, ${0.09 * glowPulse})`);
        radialGlow.addColorStop(0.70, `rgba(30, 64, 175, ${0.04 * glowPulse})`);
        radialGlow.addColorStop(1, 'rgba(2, 5, 14, 0)');

        ctx.fillStyle = radialGlow;
        ctx.fillRect(0, 0, width, height);

        // Apply Parallax Translation
        ctx.save();
        ctx.translate(currentParallaxX, currentParallaxY);

        // A. RENDER TRANSLUCENT TRIANGULAR FACETS
        const totalFacets = cachedFacets.length;
        for (let f = 0; f < totalFacets; f++) {
          const facet = cachedFacets[f];
          const tri = facet.tri;
          const pA = nodes[tri.a];
          const pB = nodes[tri.b];
          const pC = nodes[tri.c];
          if (!pA || !pB || !pC) continue;

          const ax = pA.x + pA.dragX;
          const ay = pA.y + pA.dragY;
          const bx = pB.x + pB.dragX;
          const by = pB.y + pB.dragY;
          const cx = pC.x + pC.dragX;
          const cy = pC.y + pC.dragY;

          // Subtle sinusoidal opacity shimmer per facet
          const shimmer = reducedMotion
            ? 1.0
            : 0.85 + 0.15 * Math.sin(timeAccumulator * 1.2 + (pA.shimmerPhase + pB.shimmerPhase) * 0.5);
          const effectiveAlpha = facet.alpha * shimmer;

          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.lineTo(cx, cy);
          ctx.closePath();

          ctx.fillStyle = `rgba(${facet.colorStr}, ${effectiveAlpha})`;
          ctx.fill();
        }

        // B. RENDER FINE MESH LINES
        const edges = cachedMesh.edges;
        const totalEdges = edges.length;
        for (let e = 0; e < totalEdges; e++) {
          const edge = edges[e];
          const pA = nodes[edge.a];
          const pB = nodes[edge.b];
          if (!pA || !pB) continue;

          const ax = pA.x + pA.dragX;
          const ay = pA.y + pA.dragY;
          const bx = pB.x + pB.dragX;
          const by = pB.y + pB.dragY;

          const midX = (ax + bx) * 0.5;
          const midY = (ay + by) * 0.5;
          const normX = midX / width;
          const normY = midY / height;

          // Check proximity to bright teal/aqua cluster
          const dTeal = Math.hypot(
            normX - POLYGON_NETWORK_CONFIG.glowCenter.x,
            normY - POLYGON_NETWORK_CONFIG.glowCenter.y
          );

          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);

          if (dTeal < 0.28) {
            // Bright fine cyan-white in the central glow area
            ctx.strokeStyle = POLYGON_NETWORK_CONFIG.palette.lineCyanWhite;
            ctx.lineWidth = 0.95;
          } else if (dTeal < 0.45) {
            // Teal-cyan lines in mid area
            ctx.strokeStyle = POLYGON_NETWORK_CONFIG.palette.lineCyanTeal;
            ctx.lineWidth = 0.8;
          } else if (normX > 0.65 && normY < 0.45) {
            // Blue lines toward upper-right
            ctx.strokeStyle = POLYGON_NETWORK_CONFIG.palette.lineBlue;
            ctx.lineWidth = 0.75;
          } else {
            // Faint subtle lines near edges
            ctx.strokeStyle = POLYGON_NETWORK_CONFIG.palette.lineFaint;
            ctx.lineWidth = 0.65;
          }

          ctx.stroke();
        }

        // C. RENDER PULSES TRAVELING ALONG EDGES
        if (!reducedMotion && pulses.length > 0) {
          for (let p = 0; p < pulses.length; p++) {
            const pulse = pulses[p];
            const edge = edges[pulse.edgeIndex];
            if (!edge) continue;

            const pA = nodes[edge.a];
            const pB = nodes[edge.b];
            if (!pA || !pB) continue;

            const ax = pA.x + pA.dragX;
            const ay = pA.y + pA.dragY;
            const bx = pB.x + pB.dragX;
            const by = pB.y + pB.dragY;

            const px = ax + (bx - ax) * pulse.progress;
            const py = ay + (by - ay) * pulse.progress;

            // Pulse particle glow
            ctx.beginPath();
            ctx.arc(px, py, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0; // Reset
          }
        }

        // D. RENDER NODES
        const totalNodes = nodes.length;
        for (let i = 0; i < totalNodes; i++) {
          const node = nodes[i];
          const rx = node.x + node.dragX;
          const ry = node.y + node.dragY;

          // Shimmer factor
          const shimmer = reducedMotion
            ? 1.0
            : 0.8 + 0.2 * Math.sin(timeAccumulator * node.shimmerSpeed + node.shimmerPhase);

          if (node.isWarm) {
            // RESTRAINED WARM-YELLOW TELEMETRY NODE (~6% of nodes)
            // 1. Soft Warm Halo
            ctx.beginPath();
            ctx.arc(rx, ry, node.radius * 3.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(245, 158, 11, ${0.22 * shimmer})`;
            ctx.fill();

            // 2. Bright Warm Core
            ctx.beginPath();
            ctx.arc(rx, ry, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = POLYGON_NETWORK_CONFIG.palette.nodeWarm;
            ctx.fill();
          } else {
            // PALE-CYAN NODE
            const isFocal = (
              Math.hypot(
                (rx / width) - POLYGON_NETWORK_CONFIG.glowCenter.x,
                (ry / height) - POLYGON_NETWORK_CONFIG.glowCenter.y
              ) < 0.32
            );

            if (isFocal) {
              // Soft Cyan Halo for focal nodes
              ctx.beginPath();
              ctx.arc(rx, ry, node.radius * 2.4, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(0, 229, 255, ${0.28 * shimmer})`;
              ctx.fill();
            }

            // Core pale-cyan / white node
            ctx.beginPath();
            ctx.arc(rx, ry, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = isFocal ? '#ffffff' : POLYGON_NETWORK_CONFIG.palette.nodeCyan;
            ctx.fill();
          }
        }

        ctx.restore(); // Restore parallax translation

        // VIGNETTE OVERLAY (Integrated soft vignette for aerospace depth and contrast)
        const vignette = ctx.createRadialGradient(
          width * 0.5, height * 0.5, Math.min(width, height) * 0.32,
          width * 0.5, height * 0.5, Math.max(width, height) * 0.72
        );
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(0.65, POLYGON_NETWORK_CONFIG.palette.vignetteInner);
        vignette.addColorStop(1, POLYGON_NETWORK_CONFIG.palette.vignetteOuter);

        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        ctx.restore(); // Restore dpr scale

      } catch (loopError) {
        console.error('[POLYGON BG] Animation frame exception:', loopError);
        setHasError(true);
        return;
      }

      // If prefers-reduced-motion is active, render only one static frame
      if (!reducedMotion) {
        animId = requestAnimationFrame(renderLoop);
      }
    };

    // Initial render trigger
    if (reducedMotion) {
      renderLoop(performance.now());
    } else {
      animId = requestAnimationFrame(renderLoop);
    }

    return () => {
      isDestroyed = true;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reducedMotion, pointerRef]);

  // Graceful Error Fallback (Background failure must never crash or disable the portfolio)
  if (hasError) {
    return (
      <div
        id="polygon-network-bg-layer"
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          background: 'radial-gradient(ellipse at 65% 70%, rgba(20, 184, 166, 0.15) 0%, rgba(5, 12, 28, 0.85) 55%, #02050e 100%)',
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      id="polygon-network-bg-layer"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
