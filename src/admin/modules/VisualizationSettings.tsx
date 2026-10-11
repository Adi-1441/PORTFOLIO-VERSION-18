// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN VISUALIZATION SETTINGS MODULE
// Configure live 3D WebGL background parameters, particle density, and quality tiers.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, Sliders } from 'lucide-react';
import { portfolioService } from '../../services/portfolio.service';
import { adminService } from '../../services/admin.service';
import { VisualizationSetting } from '../../types/database';

export const VisualizationSettings: React.FC = () => {
  const [settings, setSettings] = useState<VisualizationSetting | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await portfolioService.getVisualizationSettings();
      setSettings(data);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    const result = await adminService.updateVisualizationSettings(settings);
    if (result.success) {
      setSaveStatus('Visualization settings saved.');
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      alert(`Save error: ${result.error}`);
    }
  };

  if (!settings) return null;

  return (
    <div style={{ maxWidth: '680px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div className="hud-tag">WEBGL SCENE CALIBRATION</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
          3D Visualization Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Tune particle densities, flow velocity, and rendering quality presets.
        </p>
      </div>

      {saveStatus && (
        <div style={{
          background: 'rgba(52, 211, 153, 0.1)',
          border: '1px solid rgba(52, 211, 153, 0.4)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#34d399',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          marginBottom: '1.5rem',
        }}>
          <CheckCircle2 size={16} />
          <span>{saveStatus}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel" style={{ padding: '2.5rem' }}>
        <div className="form-group">
          <label className="form-label">DESKTOP PARTICLE DENSITY ({settings.particle_count})</label>
          <input
            type="range"
            min={100}
            max={800}
            step={25}
            value={settings.particle_count}
            onChange={(e) => setSettings({ ...settings, particle_count: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">MOBILE PARTICLE DENSITY ({settings.mobile_particle_count})</label>
          <input
            type="range"
            min={50}
            max={300}
            step={25}
            value={settings.mobile_particle_count}
            onChange={(e) => setSettings({ ...settings, mobile_particle_count: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">FLOW FIELD VELOCITY ({settings.particle_speed}x)</label>
          <input
            type="range"
            min={0.1}
            max={2.0}
            step={0.1}
            value={settings.particle_speed}
            onChange={(e) => setSettings({ ...settings, particle_speed: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">QUALITY PRESET</label>
            <select
              value={settings.quality}
              onChange={(e) => setSettings({ ...settings, quality: e.target.value as any })}
              className="form-select"
            >
              <option value="auto">Adaptive Auto (Recommended)</option>
              <option value="high">High Performance (Desktop)</option>
              <option value="medium">Balanced (Laptops)</option>
              <option value="low">Low Overhead (Energy Saver)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">COLOR PALETTE</label>
            <select
              value={settings.color_scheme}
              onChange={(e) => setSettings({ ...settings, color_scheme: e.target.value })}
              className="form-select"
            >
              <option value="cyan">Neon Cyan & Electric Blue (Standard)</option>
              <option value="violet">Deep Violet & Electric Magenta</option>
              <option value="steel">Monochrome Titanium & Steel</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button type="submit" className="btn-primary">
            <Save size={15} />
            <span>SAVE 3D CALIBRATION</span>
          </button>
        </div>
      </form>
    </div>
  );
};
