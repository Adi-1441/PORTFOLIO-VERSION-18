// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN CONTACT MESSAGES MODULE
// Review, manage, mark read, and archive incoming engineering inquiries.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Mail, Trash2, CheckCircle2, RefreshCw, Clock } from 'lucide-react';
import { contactService } from '../../services/contact.service';
import { ContactMessage } from '../../types/database';
import { EmptyState } from '../../components/common/EmptyState';

export const ContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    setLoading(true);
    const res = await contactService.getMessages();
    setMessages(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleToggleRead = async (msg: ContactMessage) => {
    const nextRead = !msg.read;
    const res = await contactService.markAsRead(msg.id, nextRead);
    if (res.success) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: nextRead } : m));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Permanently purge this contact message?')) return;
    const res = await contactService.deleteMessage(id);
    if (res.success) {
      setMessages(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <div className="hud-tag">LABORATORY COMMS QUEUE</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
            Contact & Inquiries
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Inquiries received from the public portfolio contact dispatch portal.
          </p>
        </div>

        <button onClick={loadMessages} className="btn-secondary" style={{ fontSize: '0.75rem' }}>
          <RefreshCw size={14} />
          <span>REFRESH QUEUE</span>
        </button>
      </div>

      {messages.length === 0 ? (
        <EmptyState
          title="No Contact Messages In Queue"
          message="No incoming inquiries have been logged yet through the public contact form."
          icon={<Mail size={24} />}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="glass-panel"
              style={{
                padding: '1.75rem',
                borderLeft: `4px solid ${msg.read ? 'var(--border-subtle)' : 'var(--accent-cyan)'}`,
                background: msg.read ? 'rgba(8, 15, 27, 0.6)' : 'rgba(14, 25, 45, 0.85)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {msg.name}
                    </h3>
                    {!msg.read && (
                      <span className="badge-tech badge-tech-cyan" style={{ fontSize: '0.625rem' }}>
                        NEW UNREAD
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                    EMAIL: <a href={`mailto:${msg.email}`} style={{ textDecoration: 'underline' }}>{msg.email}</a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleToggleRead(msg)}
                    className="btn-secondary"
                    style={{ fontSize: '0.7rem', padding: '0.35rem 0.75rem' }}
                  >
                    <CheckCircle2 size={13} color={msg.read ? 'var(--text-muted)' : '#34d399'} />
                    <span>{msg.read ? 'MARK UNREAD' : 'MARK READ'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(msg.id)}
                    style={{
                      color: '#f87171',
                      padding: '0.4rem',
                      borderRadius: 'var(--radius-xs)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                    title="Delete message"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {msg.subject && (
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.75rem',
                }}>
                  SUBJECT: {msg.subject}
                </div>
              )}

              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
                background: 'rgba(4, 8, 16, 0.5)',
                padding: '1rem',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '0.75rem',
              }}>
                {msg.message}
              </p>

              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}>
                <Clock size={12} />
                <span>RECEIVED: {new Date(msg.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
