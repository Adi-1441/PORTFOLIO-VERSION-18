// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN SECTION VISIBILITY MANAGER
// Instantly toggle live visibility of individual sections on public site.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, CheckCircle2, Save } from 'lucide-react';
import { portfolioService } from '../../services/portfolio.service';
import { adminService } from '../../services/admin.service';
import { SEED_VISIBILITY } from '../../services/seed-data';

interface SectionItem {
  key: string;
  label: string;
  visible: boolean;
}

export const VisibilityManager: React.FC = () => {
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const visMap = await portfolioService.getSectionVisibility();
      const list = SEED_VISIBILITY.map(v => ({
        key: v.section_key,
        label: v.label,
        visible: visMap[v.section_key] !== undefined ? visMap[v.section_key] : v.visible,
      }));
      setSections(list);
    }
    load();
  }, []);

  const handleToggle = async (key: string, currentVisible: boolean) => {
    const next = !currentVisible;
    setSections(prev => prev.map(s => s.key === key ? { ...s, visible: next } : s));

    const result = await adminService.updateVisibility(key, next);
    if (result.success) {
      setSaveStatus(`Updated visibility for ${key}`);
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div className="hud-tag">DISPLAY CLEARANCE</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
          Section Visibility Controls
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Toggle individual public portfolio sections on or off without deleting content.
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

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sections.map((section) => (
            <div
              key={section.key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-xs)',
                background: section.visible ? 'rgba(0, 229, 255, 0.04)' : 'rgba(148, 163, 184, 0.04)',
                border: `1px solid ${section.visible ? 'var(--border-cyan)' : 'var(--border-subtle)'}`,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.925rem' }}>
                  {section.label}
                </div>
                <div className="vernier-badge">SECTION KEY: #{section.key}</div>
              </div>

              <button
                onClick={() => handleToggle(section.key, section.visible)}
                className={section.visible ? 'btn-primary' : 'btn-secondary'}
                style={{ fontSize: '0.72rem', padding: '0.4rem 0.85rem' }}
              >
                {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                <span>{section.visible ? 'VISIBLE (ACTIVE)' : 'HIDDEN (MUTED)'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
