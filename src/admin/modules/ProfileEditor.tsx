// ==============================================================================
// ADITHYA MECHNEXUS V18.1 — ADMIN PROFILE EDITOR MODULE
// Edit identity, logo sanctuary asset, profile photo asset, resume dossier, and SEO.
// ==============================================================================

import React, { useEffect, useState, useRef } from 'react';
import { Save, CheckCircle2, AlertCircle, Upload, Trash2, RotateCcw, Image, FileText, User } from 'lucide-react';
import { portfolioService } from '../../services/portfolio.service';
import { adminService } from '../../services/admin.service';
import { mediaService } from '../../services/media.service';
import { Profile } from '../../types/database';

export const ProfileEditor: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const data = await portfolioService.getProfile();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaveStatus('saving');
    setErrorMessage(null);

    const result = await adminService.updateProfile(profile);

    if (result.success) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
      setErrorMessage(result.error || 'Failed to persist profile modifications.');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploadingLogo(true);
    setErrorMessage(null);

    const result = await mediaService.uploadAsset({
      file,
      bucket: 'profile',
      folder: 'branding',
    });

    if (result.success && result.publicUrl) {
      setProfile({ ...profile, logo_url: result.publicUrl });
    } else {
      setErrorMessage(result.error || 'Failed to upload logo asset.');
    }
    setUploadingLogo(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploadingAvatar(true);
    setErrorMessage(null);

    const result = await mediaService.uploadAsset({
      file,
      bucket: 'profile',
      folder: 'avatars',
    });

    if (result.success && result.publicUrl) {
      setProfile({ ...profile, avatar_url: result.publicUrl });
    } else {
      setErrorMessage(result.error || 'Failed to upload profile photograph.');
    }
    setUploadingAvatar(false);
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploadingResume(false);
    setErrorMessage(null);

    const result = await mediaService.uploadAsset({
      file,
      bucket: 'resume',
      folder: 'dossiers',
    });

    if (result.success && result.publicUrl) {
      setProfile({
        ...profile,
        resume_url: result.publicUrl,
        resume_updated_at: new Date().toISOString(),
      });
    } else {
      setErrorMessage(result.error || 'Failed to upload resume document.');
    }
    setUploadingResume(false);
  };

  if (loading || !profile) {
    return <div style={{ color: 'var(--text-secondary)' }}>LOADING PROFILE TELEMETRY...</div>;
  }

  return (
    <div style={{ maxWidth: '860px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div className="hud-tag">IDENTITY, BRANDING & MEDIA MANAGEMENT</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
          Profile & Portfolio Identity
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Configure primary personal branding, portfolio logo sanctuary asset, profile photo identity, and SEO metadata.
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
          <span>PROFILE TELEMETRY PERSISTED TO POSTGRESQL DATABASE SUCCESSFULLY.</span>
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

      {/* Hidden file inputs */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/svg+xml,image/png,image/webp,image/jpeg"
        onChange={handleLogoUpload}
        style={{ display: 'none' }}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleAvatarUpload}
        style={{ display: 'none' }}
      />
      <input
        ref={resumeInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleResumeUpload}
        style={{ display: 'none' }}
      />

      <form onSubmit={handleSave}>
        {/* =========================================================================
            SECTION 1: BRANDING & PROFILE PHOTO MEDIA SANCTUARY
        ========================================================================= */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div className="form-label" style={{ marginBottom: '1.5rem', color: 'var(--accent-cyan)' }}>
            MEDIA ASSETS // LOGO & PROFILE PHOTOGRAPH
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* PORTFOLIO LOGO MANAGEMENT */}
            <div style={{
              padding: '1.5rem',
              backgroundColor: 'rgba(6, 11, 20, 0.6)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Image size={16} color="var(--accent-cyan)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  PORTFOLIO LOGO (INTRO SANCTUARY)
                </span>
              </div>

              {/* Logo Preview */}
              <div style={{
                height: '110px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, rgba(0, 229, 255, 0.08) 0%, rgba(3, 7, 15, 0.9) 70%)',
                border: '1px dashed var(--border-cyan)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
                padding: '0.75rem',
              }}>
                <img
                  src={profile.logo_url || '/assets/branding/mechnexus-emblem.svg'}
                  alt="Portfolio Logo Preview"
                  style={{ maxHeight: '80px', maxWidth: '80%', objectFit: 'contain' }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/assets/branding/mechnexus-emblem.svg';
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">LOGO ASSET URL</label>
                <input
                  type="text"
                  value={profile.logo_url || ''}
                  onChange={(e) => setProfile({ ...profile, logo_url: e.target.value })}
                  placeholder="/assets/branding/mechnexus-emblem.svg"
                  className="form-input"
                  style={{ fontSize: '0.75rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
                >
                  <Upload size={14} />
                  <span>{uploadingLogo ? 'UPLOADING...' : 'UPLOAD NEW LOGO'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, logo_url: '/assets/branding/mechnexus-emblem.svg' })}
                  className="btn-secondary"
                  title="Reset to default brand emblem"
                  style={{ fontSize: '0.75rem', padding: '0.45rem 0.75rem' }}
                >
                  <RotateCcw size={14} />
                  <span>RESET DEFAULT</span>
                </button>
              </div>
            </div>

            {/* PROFILE PHOTOGRAPH MANAGEMENT */}
            <div style={{
              padding: '1.5rem',
              backgroundColor: 'rgba(6, 11, 20, 0.6)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <User size={16} color="var(--accent-cyan)" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  PROFILE PHOTO (HERO IDENTITY MODULE)
                </span>
              </div>

              {/* Avatar Preview */}
              <div style={{
                height: '110px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, rgba(61, 126, 255, 0.08) 0%, rgba(3, 7, 15, 0.9) 70%)',
                border: '1px dashed var(--border-blue)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
              }}>
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile Photo Preview"
                    style={{ maxHeight: '90px', maxWidth: '90px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'var(--accent-cyan)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <User size={24} color="var(--text-muted)" />
                    <span>[ PROFILE IMAGE PENDING ]</span>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">AVATAR ASSET URL</label>
                <input
                  type="text"
                  value={profile.avatar_url || ''}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  placeholder="https://... or /assets/profile/photo.jpg"
                  className="form-input"
                  style={{ fontSize: '0.75rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">AVATAR ACCESSIBILITY / SEO ALT TEXT</label>
                <input
                  type="text"
                  value={profile.avatar_alt_text || ''}
                  onChange={(e) => setProfile({ ...profile, avatar_alt_text: e.target.value })}
                  placeholder="e.g. Adithya G - Mechanical Engineer & CAE Simulation Specialist"
                  className="form-input"
                  style={{ fontSize: '0.75rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
                >
                  <Upload size={14} />
                  <span>{uploadingAvatar ? 'UPLOADING...' : 'UPLOAD PHOTO'}</span>
                </button>
                {profile.avatar_url && (
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, avatar_url: null })}
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.45rem 0.75rem', color: '#f87171' }}
                    title="Clear photo to show deliberate PENDING state"
                  >
                    <Trash2 size={14} />
                    <span>REMOVE</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: PRIMARY IDENTITY TELEMETRY
        ========================================================================= */}
        <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          <div className="form-label" style={{ marginBottom: '1.5rem', color: 'var(--accent-cyan)' }}>
            PRIMARY IDENTITY TELEMETRY
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">FULL NAME</label>
              <input
                type="text"
                required
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">PROFESSIONAL TITLE</label>
              <input
                type="text"
                required
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">TAGLINE / SUPPORTING IDENTITY</label>
            <input
              type="text"
              value={profile.tagline || ''}
              onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">PROFESSIONAL BIOGRAPHY / INTRO</label>
            <textarea
              rows={4}
              value={profile.bio || ''}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">CONTACT EMAIL</label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">LOCATION</label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="form-input"
              />
            </div>
          </div>

          {/* RESUME DOSSIER */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            backgroundColor: 'rgba(6, 11, 20, 0.6)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <FileText size={16} color="var(--accent-cyan)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                RESUME DOSSIER CONFIGURATION
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">RESUME DOSSIER VERSION</label>
                <input
                  type="text"
                  value={profile.resume_version || ''}
                  onChange={(e) => setProfile({ ...profile, resume_version: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">RESUME DOWNLOAD URL</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="https://... or /resume.pdf"
                    value={profile.resume_url || ''}
                    onChange={(e) => setProfile({ ...profile, resume_url: e.target.value })}
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => resumeInputRef.current?.click()}
                    disabled={uploadingResume}
                    className="btn-secondary"
                    style={{ padding: '0 0.85rem', flexShrink: 0 }}
                    title="Upload PDF"
                  >
                    <Upload size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ACADEMIC SPECIFICATION & CAREER TRAJECTORY */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            backgroundColor: 'rgba(6, 11, 20, 0.6)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <User size={16} color="var(--accent-cyan)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                ACADEMIC SPECIFICATION & CAREER TRAJECTORY
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">INSTITUTION / UNIVERSITY</label>
                <input
                  type="text"
                  placeholder="e.g. BMS Institute of Technology & Management"
                  value={profile.education_institution || ''}
                  onChange={(e) => setProfile({ ...profile, education_institution: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">DEPARTMENT / FACULTY</label>
                <input
                  type="text"
                  placeholder="e.g. Department of Mechanical Engineering"
                  value={profile.education_department || ''}
                  onChange={(e) => setProfile({ ...profile, education_department: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">DEGREE PROGRAM</label>
                <input
                  type="text"
                  placeholder="e.g. Bachelor of Engineering (B.E.)"
                  value={profile.education_degree || ''}
                  onChange={(e) => setProfile({ ...profile, education_degree: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">BATCH / GRADUATION YEAR</label>
                <input
                  type="text"
                  placeholder="e.g. 2022 – 2026"
                  value={profile.education_year || ''}
                  onChange={(e) => setProfile({ ...profile, education_year: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">CAREER OBJECTIVES & RESEARCH TRAJECTORY</label>
              <textarea
                rows={3}
                placeholder="Targeting mechanical design engineering, finite element analysis, or automated manufacturing systems..."
                value={profile.career_goals || ''}
                onChange={(e) => setProfile({ ...profile, career_goals: e.target.value })}
                className="form-textarea"
              />
            </div>
          </div>

          {/* HERO CALL-TO-ACTION (CTA) DIRECTIVES */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            backgroundColor: 'rgba(6, 11, 20, 0.6)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <User size={16} color="var(--accent-cyan)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                HERO CALL-TO-ACTION (CTA) BUTTONS
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">PRIMARY CTA LABEL</label>
                <input
                  type="text"
                  placeholder="e.g. INSPECT DOSSIER"
                  value={profile.hero_cta_primary_label || ''}
                  onChange={(e) => setProfile({ ...profile, hero_cta_primary_label: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">PRIMARY CTA TARGET URL / ANCHOR</label>
                <input
                  type="text"
                  placeholder="e.g. #projects"
                  value={profile.hero_cta_primary_url || ''}
                  onChange={(e) => setProfile({ ...profile, hero_cta_primary_url: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">SECONDARY CTA LABEL</label>
                <input
                  type="text"
                  placeholder="e.g. DIRECT DISPATCH"
                  value={profile.hero_cta_secondary_label || ''}
                  onChange={(e) => setProfile({ ...profile, hero_cta_secondary_label: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">SECONDARY CTA TARGET URL / ANCHOR</label>
                <input
                  type="text"
                  placeholder="e.g. #contact"
                  value={profile.hero_cta_secondary_url || ''}
                  onChange={(e) => setProfile({ ...profile, hero_cta_secondary_url: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* SEO CONFIG */}
          <div style={{ marginTop: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">SEO PAGE TITLE</label>
              <input
                type="text"
                value={profile.seo_title || ''}
                onChange={(e) => setProfile({ ...profile, seo_title: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">SEO META DESCRIPTION</label>
              <textarea
                rows={2}
                value={profile.seo_description || ''}
                onChange={(e) => setProfile({ ...profile, seo_description: e.target.value })}
                className="form-textarea"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className="btn-primary"
            >
              <Save size={16} />
              <span>{saveStatus === 'saving' ? 'PERSISTING CHANGES...' : 'SAVE PROFILE & MEDIA TELEMETRY'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
