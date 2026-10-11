// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — CONTACT SECTION
// Public submission only. Strict RLS enforcement. Zero public read/update/delete.
// ==============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCursor } from '../../context/CursorContext';
import { contactService } from '../../services/contact.service';

export const Contact: React.FC = () => {
  const { setMode } = useCursor();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage('Please populate all required telemetry fields.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage(null);

    const result = await contactService.submitMessage(formData);

    if (result.success) {
      setStatus('success');
      setEmailSent(result.emailSent ?? false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Transmission failed. Please attempt again.');
    }
  };

  return (
    <section id="contact" className="section-padding" style={{ position: 'relative', zIndex: 10 }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div className="hud-tag">
            <Mail size={14} />
            <span>DIRECT COMMS // INQUIRIES & COLLABORATION</span>
          </div>
          <h2 className="section-title">CONTACT LABORATORY</h2>
          <p className="section-subtitle">
            Initiate direct technical inquiries regarding multi-physics simulation consulting,
            CAD drafting, or academic research collaboration.
          </p>
        </div>

        {/* Form Container */}
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-panel-elevated"
            style={{ padding: '2.5rem' }}
          >
            {/* Status Feedback Banners */}
            {status === 'success' && (
              <div style={{
                background: emailSent ? 'rgba(52, 211, 153, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                border: `1px solid ${emailSent ? 'rgba(52, 211, 153, 0.4)' : 'rgba(56, 189, 248, 0.4)'}`,
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: emailSent ? '#34d399' : '#38bdf8',
                marginBottom: '1.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
              }}>
                <CheckCircle2 size={18} />
                <span>
                  {emailSent
                    ? 'TRANSMISSION CONFIRMED. MESSAGE LOGGED & EMAIL NOTIFICATION DISPATCHED.'
                    : 'TRANSMISSION SAVED. MESSAGE LOGGED TO DATABASE (EMAIL NOTIFICATION OFFLINE).'}
                </span>
              </div>
            )}

            {status === 'error' && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#f87171',
                marginBottom: '1.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
              }}>
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {/* Name */}
              <div className="form-group">
                <label className="form-label">FULL NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">EMAIL ADDRESS *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. j.doe@institution.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="form-group">
              <label className="form-label">INQUIRY SUBJECT</label>
              <input
                type="text"
                placeholder="e.g. FEA Heat Exchanger Simulation Consultation"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="form-input"
              />
            </div>

            {/* Message */}
            <div className="form-group">
              <label className="form-label">TELEMETRY MESSAGE / TECHNICAL SCOPE *</label>
              <textarea
                required
                rows={5}
                placeholder="Detail technical requirements, boundary conditions, timeline, or consultation scope..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="form-textarea"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === 'submitting'}
              onMouseEnter={() => setMode('button')}
              onMouseLeave={() => setMode('default')}
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <Send size={16} />
              <span>{status === 'submitting' ? 'TRANSMITTING TELEMETRY...' : 'DISPATCH MESSAGE'}</span>
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};
