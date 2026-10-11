// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN ABOUT EDITOR MODULE
// Edit design philosophy, methodology, and engineering trajectory.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { portfolioService } from '../../services/portfolio.service';
import { adminService } from '../../services/admin.service';
import { About } from '../../types/database';

export const AboutEditor: React.FC = () => {
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [interestsText, setInterestsText] = useState('');

  useEffect(() => {
    async function load() {
      const data = await portfolioService.getAbout();
      setAbout(data);
      setInterestsText(data.engineering_interests?.join('\n') || '');
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!about) return;

    setSaveStatus('saving');
    setErrorMessage(null);

    const updatedInterests = interestsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload: Partial<About> = {
      ...about,
      engineering_interests: updatedInterests,
    };

    const result = await adminService.updateAbout(payload);

    if (result.success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
      setErrorMessage(result.error || 'Failed to update About section.');
    }
  };

  if (loading || !about) {
    return <div style={{ color: 'var(--text-secondary)' }}>LOADING ABOUT TELEMETRY...</div>;
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div className="hud-tag">PHILOSOPHY & METHODOLOGY</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
          About Section Editor
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Modify engineering philosophy, mathematical formulation approach, and active technical trajectory.
        </p>
      </div>

      {saveStatus === 'saved' && (
        <div style={{
          background: 'rgba(52, 211, 153, 0.1)',
          border: '1px solid rgba(52, 211, 153, 0.4)',
          padding: '1rem',
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
          <span>ABOUT TELEMETRY SAVED TO DATABASE.</span>
        </div>
      )}

      {saveStatus === 'error' && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#f87171',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          marginBottom: '1.5rem',
        }}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel" style={{ padding: '2.5rem' }}>
        <div className="form-group">
          <label className="form-label">MAIN INTRODUCTION NARRATIVE</label>
          <textarea
            rows={4}
            required
            value={about.content}
            onChange={(e) => setAbout({ ...about, content: e.target.value })}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label className="form-label">DESIGN PHILOSOPHY</label>
          <textarea
            rows={3}
            value={about.design_philosophy || ''}
            onChange={(e) => setAbout({ ...about, design_philosophy: e.target.value })}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label className="form-label">ENGINEERING APPROACH</label>
          <textarea
            rows={3}
            value={about.engineering_approach || ''}
            onChange={(e) => setAbout({ ...about, engineering_approach: e.target.value })}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label className="form-label">TECHNICAL DIRECTION</label>
          <textarea
            rows={2}
            value={about.technical_direction || ''}
            onChange={(e) => setAbout({ ...about, technical_direction: e.target.value })}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label className="form-label">LEARNING DIRECTION / TRAJECTORY</label>
          <textarea
            rows={2}
            value={about.learning_direction || ''}
            onChange={(e) => setAbout({ ...about, learning_direction: e.target.value })}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label className="form-label">ENGINEERING INTERESTS (ONE PER LINE)</label>
          <textarea
            rows={5}
            value={interestsText}
            onChange={(e) => setInterestsText(e.target.value)}
            className="form-textarea"
            placeholder="Finite Element Analysis (FEA)&#10;Computational Fluid Dynamics (CFD)"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            type="submit"
            disabled={saveStatus === 'saving'}
            className="btn-primary"
          >
            <Save size={16} />
            <span>{saveStatus === 'saving' ? 'PERSISTING CHANGES...' : 'SAVE ABOUT MODIFICATIONS'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
