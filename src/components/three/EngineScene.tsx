// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — LEGACY ENGINE SCENE COMPATIBILITY WRAPPER
// Note: As per inspection, EngineScene was exclusively hosting the obsolete
// background. The live aerospace polygon network background is now mounted
// persistently at the application root layout (PolygonNetworkBackground.tsx),
// eliminating duplicate WebGL contexts and canvas recreation across page routes.
// ==============================================================================

import React from 'react';

export const EngineScene: React.FC = () => {
  // Background layer is persistently mounted at application root.
  return null;
};

