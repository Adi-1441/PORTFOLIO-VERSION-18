// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — DYNAMIC LUCIDE ICON RESOLVER
// Safely maps icon string names to React Lucide components with fallback.
// ==============================================================================

import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name,
  size = 18,
  color,
  className,
  style,
}) => {
  // Lucide icon components are PascalCase
  const cleanName = name
    .trim()
    .replace(/[-_ ]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, c => c.toUpperCase());

  // @ts-ignore
  const IconComponent = (Icons as Record<string, React.FC<any>>)[cleanName] || Icons.Layers;

  return <IconComponent size={size} color={color} className={className} style={style} />;
};

export const AVAILABLE_CMS_ICONS = [
  'Layers', 'Compass', 'User', 'Cpu', 'FolderGit2', 'Boxes', 'Activity',
  'Wind', 'Flame', 'Grid', 'ShieldCheck', 'Sparkles', 'BookOpen',
  'FileText', 'Link2', 'Mail', 'Wrench', 'Settings', 'Atom', 'Database',
  'Zap', 'Award', 'PenTool', 'Terminal', 'Cog', 'HardDrive', 'Microscope',
  'Rocket', 'Code', 'Workflow', 'Server', 'Gauge', 'Binary', 'Radio'
];
