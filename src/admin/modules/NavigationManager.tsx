// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — NAVIGATION MATRIX CMS MODULE
// Configure top navigation hierarchy, custom external links, and ordering.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import {
  Navigation, Plus, Edit3, Trash2, ArrowUp, ArrowDown, ExternalLink,
  CheckCircle2, AlertCircle, Save, X, Eye, EyeOff
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { NavigationItem } from '../../types/database';

export const NavigationManager: React.FC = () => {
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const data = await adminService.getNavigationItems();
    setNavItems(data);
    setLoading(false);
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleToggleEnabled = async (item: NavigationItem) => {
    const updated = !item.enabled;
    const res = await adminService.updateNavigationItem(item.id, { enabled: updated });
    if (res.success) {
      setNavItems(navItems.map(i => i.id === item.id ? { ...i, enabled: updated } : i));
      showFeedback('success', `Navigation item "${item.label}" state toggled.`);
    } else {
      showFeedback('error', res.error || 'Failed to update item state.');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === navItems.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...navItems];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const payload = reordered.map((item, idx) => ({ id: item.id, display_order: idx }));
    setNavItems(reordered.map((item, idx) => ({ ...item, display_order: idx })));

    const res = await adminService.reorderNavigationItems(payload);
    if (res.success) {
      showFeedback('success', 'Navigation order persisted.');
    } else {
      showFeedback('error', res.error || 'Failed to reorder navigation.');
      loadItems();
    }
  };

  const handleDelete = async (item: NavigationItem) => {
    if (!window.confirm(`Delete navigation link "${item.label}"?`)) return;
    const res = await adminService.deleteNavigationItem(item.id);
    if (res.success) {
      setNavItems(navItems.filter(i => i.id !== item.id));
      showFeedback('success', `Navigation item "${item.label}" removed.`);
    } else {
      showFeedback('error', res.error || 'Failed to delete item.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (editingItem.id) {
      const res = await adminService.updateNavigationItem(editingItem.id, editingItem);
      if (res.success) {
        setNavItems(navItems.map(i => i.id === editingItem.id ? editingItem : i));
        setModalOpen(false);
        showFeedback('success', `Navigation item "${editingItem.label}" updated.`);
      } else {
        showFeedback('error', res.error || 'Failed to update item.');
      }
    } else {
      const payload: Omit<NavigationItem, 'id' | 'created_at' | 'updated_at'> = {
        label: editingItem.label.toUpperCase(),
        href: editingItem.href,
        display_order: navItems.length,
        enabled: editingItem.enabled ?? true,
        is_external: editingItem.is_external ?? (!editingItem.href.startsWith('#')),
        open_in_new_tab: editingItem.open_in_new_tab ?? true,
      };

      const res = await adminService.createNavigationItem(payload);
      if (res.success && res.data) {
        setNavItems([...navItems, res.data]);
        setModalOpen(false);
        showFeedback('success', `Navigation item "${res.data.label}" deployed.`);
      } else {
        showFeedback('error', res.error || 'Failed to create navigation item.');
      }
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            NAVIGATION MATRIX
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
            CONTROL TOP NAVBAR LABELS, ANCHOR DESTINATIONS, AND EXTERNAL DIRECTIVES
          </p>
        </div>

        <button
          onClick={() => {
            setEditingItem({
              id: '',
              label: '',
              href: '',
              display_order: navItems.length,
              enabled: true,
              is_external: false,
              open_in_new_tab: false,
              created_at: '',
              updated_at: '',
            });
            setModalOpen(true);
          }}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          <span>ADD NAVIGATION LINK</span>
        </button>
      </div>

      {feedback && (
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: feedback.type === 'success' ? '#10b981' : '#ef4444',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '1px' }}>
              <th style={{ padding: '0.75rem 0.5rem', width: '50px' }}>ORD</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>LABEL</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>DESTINATION (HREF)</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>TYPE</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>STATUS</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {navItems.map((item, idx) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                }}
              >
                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                    <button
                      onClick={() => handleMoveOrder(idx, 'up')}
                      disabled={idx === 0}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: idx === 0 ? 'rgba(255, 255, 255, 0.1)' : 'var(--text-muted)',
                        cursor: idx === 0 ? 'default' : 'pointer',
                        padding: 0,
                      }}
                    >
                      <ArrowUp size={12} />
                    </button>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {idx}
                    </span>
                    <button
                      onClick={() => handleMoveOrder(idx, 'down')}
                      disabled={idx === navItems.length - 1}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: idx === navItems.length - 1 ? 'rgba(255, 255, 255, 0.1)' : 'var(--text-muted)',
                        cursor: idx === navItems.length - 1 ? 'default' : 'pointer',
                        padding: 0,
                      }}
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                </td>

                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {item.label}
                </td>

                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  {item.href}
                </td>

                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: item.href.startsWith('#') ? 'rgba(0, 229, 255, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                    color: item.href.startsWith('#') ? 'var(--accent-cyan)' : '#8b5cf6',
                    border: `1px solid ${item.href.startsWith('#') ? 'rgba(0, 229, 255, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                  }}>
                    {item.href.startsWith('#') ? 'IN-PAGE ANCHOR' : 'EXTERNAL LINK'}
                  </span>
                </td>

                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle' }}>
                  <button
                    onClick={() => handleToggleEnabled(item)}
                    style={{
                      background: item.enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${item.enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      color: item.enabled ? '#10b981' : '#ef4444',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                    }}
                  >
                    {item.enabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </td>

                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setModalOpen(true);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-secondary)',
                        borderRadius: '4px',
                        padding: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        borderRadius: '4px',
                        padding: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && editingItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          backgroundColor: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '550px',
            backgroundColor: 'var(--bg-steel)',
            border: '1px solid var(--border-cyan)',
            borderRadius: '12px',
            padding: '2rem',
            position: 'relative',
          }}>
            <button
              onClick={() => setModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              {editingItem.id ? `EDIT LINK: ${editingItem.label}` : 'CREATE NAVIGATION LINK'}
            </h2>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">NAVIGATION LABEL</label>
                <input
                  type="text"
                  required
                  value={editingItem.label}
                  onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value.toUpperCase() })}
                  placeholder="e.g. RESEARCH, GITHUB, CAD"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">DESTINATION TARGET (HREF)</label>
                <input
                  type="text"
                  required
                  value={editingItem.href}
                  onChange={(e) => {
                    const href = e.target.value;
                    const isExternal = !href.startsWith('#');
                    setEditingItem({
                      ...editingItem,
                      href,
                      is_external: isExternal,
                      open_in_new_tab: isExternal,
                    });
                  }}
                  placeholder="e.g. #cad-cae or https://github.com/..."
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">OPEN IN NEW TAB?</label>
                  <select
                    value={editingItem.open_in_new_tab ? 'yes' : 'no'}
                    onChange={(e) => setEditingItem({ ...editingItem, open_in_new_tab: e.target.value === 'yes' })}
                    className="form-input"
                  >
                    <option value="yes">Yes (_blank)</option>
                    <option value="no">No (Same tab)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">STATUS</label>
                  <select
                    value={editingItem.enabled ? 'enabled' : 'disabled'}
                    onChange={(e) => setEditingItem({ ...editingItem, enabled: e.target.value === 'enabled' })}
                    className="form-input"
                  >
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <Save size={16} />
                  <span>PERSIST LINK</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
