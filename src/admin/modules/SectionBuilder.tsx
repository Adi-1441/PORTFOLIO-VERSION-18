// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — DYNAMIC SECTION BUILDER CMS MODULE
// Visual drag-free reordering, layout selector, theme engine, and content item manager.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import {
  Layers, Plus, Edit3, Trash2, Copy, ArrowUp, ArrowDown, Eye, EyeOff,
  CheckCircle2, AlertCircle, Save, X, Navigation, Layout, Palette, FileText, Image as ImageIcon
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import {
  PortfolioSection, PortfolioContentItem, SectionType,
  SectionLayout, SectionStatus, AccentThemeToken
} from '../../types/database';
import { DynamicIcon, AVAILABLE_CMS_ICONS } from '../../components/common/DynamicIcon';
import { UniversalMediaManager } from '../components/UniversalMediaManager';

const SECTION_TYPES: { value: SectionType; label: string }[] = [
  { value: 'custom_cards', label: 'Custom Cards Grid' },
  { value: 'text', label: 'Editorial Markdown / Text' },
  { value: 'timeline', label: 'Chronological Timeline' },
  { value: 'gallery', label: 'Media Gallery' },
  { value: 'projects', label: 'Projects Matrix (System)' },
  { value: 'research', label: 'Scientific Research (System)' },
  { value: 'cad_cae', label: 'CAD & CAE Simulations (System)' },
  { value: 'plc', label: 'PLC & Automation (System)' },
  { value: 'certifications', label: 'Certifications (System)' },
  { value: 'ai_engineering', label: 'AI × Engineering (System)' },
  { value: 'articles', label: 'Articles & Dossiers (System)' },
  { value: 'skills', label: 'Skills Radar (System)' },
  { value: 'connections', label: 'Connections & Links (System)' },
  { value: 'contact', label: 'Contact Laboratory (System)' },
];

const LAYOUTS: { value: SectionLayout; label: string }[] = [
  { value: 'grid_cards', label: 'Responsive Grid Cards' },
  { value: 'split_two_col', label: 'Split Two-Column' },
  { value: 'timeline', label: 'Vertical Technical Timeline' },
  { value: 'list', label: 'Monospace Spec-Sheet List' },
  { value: 'carousel', label: 'Carousel Slider' },
  { value: 'masonry', label: 'Masonry Arrange' },
];

const THEMES: { value: AccentThemeToken; label: string; color: string }[] = [
  { value: 'cyan', label: 'Cyan (#00e5ff)', color: '#00e5ff' },
  { value: 'blue', label: 'Blue (#3b82f6)', color: '#3b82f6' },
  { value: 'violet', label: 'Violet (#8b5cf6)', color: '#8b5cf6' },
  { value: 'emerald', label: 'Emerald (#10b981)', color: '#10b981' },
  { value: 'amber', label: 'Amber (#f59e0b)', color: '#f59e0b' },
  { value: 'steel', label: 'Steel (#94a3b8)', color: '#94a3b8' },
];

export const SectionBuilder: React.FC = () => {
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Section Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PortfolioSection | null>(null);

  // Content Items Sub-Modal State
  const [itemModalSection, setItemModalSection] = useState<PortfolioSection | null>(null);
  const [contentItems, setContentItems] = useState<PortfolioContentItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioContentItem | null>(null);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [mediaModalItem, setMediaModalItem] = useState<PortfolioContentItem | null>(null);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    setLoading(true);
    const data = await adminService.getSections();
    setSections(data);
    setLoading(false);
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleToggleVisible = async (sec: PortfolioSection) => {
    const updated = !sec.visible;
    const res = await adminService.updateSection(sec.id, { visible: updated });
    if (res.success) {
      setSections(sections.map(s => s.id === sec.id ? { ...s, visible: updated } : s));
      showFeedback('success', `Section "${sec.title}" visibility toggled.`);
    } else {
      showFeedback('error', res.error || 'Failed to update visibility.');
    }
  };

  const handleToggleNavigation = async (sec: PortfolioSection) => {
    const updated = !sec.in_navigation;
    const res = await adminService.updateSection(sec.id, { in_navigation: updated });
    if (res.success) {
      setSections(sections.map(s => s.id === sec.id ? { ...s, in_navigation: updated } : s));
      showFeedback('success', `Section "${sec.title}" navigation presence toggled.`);
    } else {
      showFeedback('error', res.error || 'Failed to update navigation.');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Update display_order values
    const payload = reordered.map((sec, idx) => ({ id: sec.id, display_order: idx }));
    setSections(reordered.map((sec, idx) => ({ ...sec, display_order: idx })));

    const res = await adminService.reorderSections(payload);
    if (res.success) {
      showFeedback('success', 'Section sequence persisted.');
    } else {
      showFeedback('error', res.error || 'Failed to update section order.');
      loadSections();
    }
  };

  const handleDuplicate = async (sec: PortfolioSection) => {
    const res = await adminService.duplicateSection(sec.id);
    if (res.success && res.data) {
      setSections([...sections, res.data]);
      showFeedback('success', `Created duplicate: "${res.data.title}".`);
    } else {
      showFeedback('error', res.error || 'Failed to duplicate section.');
    }
  };

  const handleDelete = async (sec: PortfolioSection) => {
    if (sec.is_system) {
      showFeedback('error', 'System sections cannot be deleted. You can hide or archive them instead.');
      return;
    }
    if (!window.confirm(`Delete section "${sec.title}" permanently?`)) return;

    const res = await adminService.deleteSection(sec.id);
    if (res.success) {
      setSections(sections.filter(s => s.id !== sec.id));
      showFeedback('success', `Section "${sec.title}" deleted.`);
    } else {
      showFeedback('error', res.error || 'Failed to delete section.');
    }
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    if (editingSection.id) {
      // Update
      const res = await adminService.updateSection(editingSection.id, editingSection);
      if (res.success) {
        setSections(sections.map(s => s.id === editingSection.id ? editingSection : s));
        setModalOpen(false);
        showFeedback('success', `Section "${editingSection.title}" updated.`);
      } else {
        showFeedback('error', res.error || 'Failed to update section.');
      }
    } else {
      // Create new
      const payload: Omit<PortfolioSection, 'id' | 'created_at' | 'updated_at'> = {
        title: editingSection.title,
        slug: editingSection.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        nav_label: editingSection.nav_label || editingSection.title.toUpperCase(),
        description: editingSection.description || null,
        content: editingSection.content || null,
        section_type: editingSection.section_type || 'custom_cards',
        layout: editingSection.layout || 'grid_cards',
        icon: editingSection.icon || 'Layers',
        accent_theme: editingSection.accent_theme || 'cyan',
        cover_image_url: editingSection.cover_image_url || null,
        content_schema: {},
        seo_title: editingSection.seo_title || null,
        seo_description: editingSection.seo_description || null,
        status: editingSection.status || 'published',
        visible: editingSection.visible ?? true,
        in_navigation: editingSection.in_navigation ?? true,
        display_order: sections.length,
        is_system: false,
      };

      const res = await adminService.createSection(payload);
      if (res.success && res.data) {
        setSections([...sections, res.data]);
        setModalOpen(false);
        showFeedback('success', `Section "${res.data.title}" deployed successfully.`);
      } else {
        showFeedback('error', res.error || 'Failed to create section.');
      }
    }
  };

  // Open Items Manager Submodal
  const handleOpenItemsManager = async (sec: PortfolioSection) => {
    setItemModalSection(sec);
    setItemsLoading(true);
    const items = await adminService.getContentItems(sec.id);
    setContentItems(items);
    setItemsLoading(false);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !itemModalSection) return;

    if (editingItem.id) {
      const res = await adminService.updateContentItem(editingItem.id, editingItem);
      if (res.success) {
        setContentItems(contentItems.map(i => i.id === editingItem.id ? editingItem : i));
        setItemFormOpen(false);
        showFeedback('success', 'Content item saved.');
      } else {
        showFeedback('error', res.error || 'Failed to save item.');
      }
    } else {
      const payload = {
        ...editingItem,
        section_id: itemModalSection.id,
        display_order: contentItems.length,
      };
      const res = await adminService.createContentItem(payload);
      if (res.success && res.data) {
        setContentItems([...contentItems, res.data]);
        setEditingItem(res.data);
        showFeedback('success', 'Content item deployed! You can now attach photos and videos to its media gallery below.');
      } else {
        showFeedback('error', res.error || 'Failed to create item.');
      }
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm('Delete this item?')) return;
    const res = await adminService.deleteContentItem(itemId);
    if (res.success) {
      setContentItems(contentItems.filter(i => i.id !== itemId));
      showFeedback('success', 'Item deleted.');
    } else {
      showFeedback('error', res.error || 'Failed to delete item.');
    }
  };

  return (
    <div>
      {/* Header */}
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
            DYNAMIC SECTION BUILDER
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
            CONTROL AND COMPOSE PORTFOLIO DISCIPLINES WITHOUT EDITING REACT CODE
          </p>
        </div>

        <button
          onClick={() => {
            setEditingSection({
              id: '',
              title: '',
              slug: '',
              nav_label: '',
              description: '',
              content: '',
              section_type: 'custom_cards',
              layout: 'grid_cards',
              icon: 'Layers',
              accent_theme: 'cyan',
              cover_image_url: null,
              content_schema: {},
              seo_title: null,
              seo_description: null,
              status: 'published',
              visible: true,
              in_navigation: true,
              display_order: sections.length,
              is_system: false,
              created_at: '',
              updated_at: '',
            });
            setModalOpen(true);
          }}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} />
          <span>CREATE NEW SECTION</span>
        </button>
      </div>

      {/* Feedback banner */}
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

      {/* Section List Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '1px' }}>
              <th style={{ padding: '0.75rem 0.5rem', width: '50px' }}>ORD</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>ICON & TITLE</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>NAV LABEL</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>TYPE / LAYOUT</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>THEME</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>STATUS</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>NAV</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>VISIBLE</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((sec, idx) => (
              <tr
                key={sec.id}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
                }}
              >
                {/* Order & Reorder arrows */}
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
                      disabled={idx === sections.length - 1}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: idx === sections.length - 1 ? 'rgba(255, 255, 255, 0.1)' : 'var(--text-muted)',
                        cursor: idx === sections.length - 1 ? 'default' : 'pointer',
                        padding: 0,
                      }}
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>
                </td>

                {/* Icon & Title */}
                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <DynamicIcon name={sec.icon} size={16} color="var(--accent-cyan)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {sec.title}
                      </div>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        #{sec.slug} {sec.is_system && <span style={{ color: 'var(--accent-cyan)' }}>[SYSTEM]</span>}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Nav Label */}
                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {sec.nav_label || '—'}
                </td>

                {/* Type & Layout */}
                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{sec.section_type}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{sec.layout}</div>
                </td>

                {/* Theme */}
                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: sec.accent_theme === 'cyan' ? '#00e5ff' : sec.accent_theme === 'blue' ? '#3b82f6' : sec.accent_theme === 'emerald' ? '#10b981' : '#e2e8f0',
                  }}>
                    {sec.accent_theme}
                  </span>
                </td>

                {/* Status */}
                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: sec.status === 'published' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: sec.status === 'published' ? '#10b981' : '#f59e0b',
                    border: `1px solid ${sec.status === 'published' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  }}>
                    {sec.status}
                  </span>
                </td>

                {/* In Navigation */}
                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle' }}>
                  <button
                    onClick={() => handleToggleNavigation(sec)}
                    style={{
                      background: sec.in_navigation ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${sec.in_navigation ? 'var(--border-cyan)' : 'rgba(255, 255, 255, 0.1)'}`,
                      color: sec.in_navigation ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                    }}
                  >
                    {sec.in_navigation ? 'IN NAV' : 'OFF'}
                  </button>
                </td>

                {/* Visibility */}
                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle' }}>
                  <button
                    onClick={() => handleToggleVisible(sec)}
                    style={{
                      background: sec.visible ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      border: `1px solid ${sec.visible ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      color: sec.visible ? '#10b981' : '#ef4444',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {sec.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{sec.visible ? 'VISIBLE' : 'HIDDEN'}</span>
                  </button>
                </td>

                {/* Actions */}
                <td style={{ padding: '0.75rem 0.5rem', verticalAlign: 'middle', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    {/* Item manager button for non-text/custom sections */}
                    {!sec.is_system && (
                      <button
                        onClick={() => handleOpenItemsManager(sec)}
                        title="Manage Content Items"
                        style={{
                          background: 'rgba(0, 229, 255, 0.08)',
                          border: '1px solid rgba(0, 229, 255, 0.25)',
                          color: 'var(--accent-cyan)',
                          borderRadius: '4px',
                          padding: '5px 8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        <FileText size={13} />
                        <span>ITEMS</span>
                      </button>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setEditingSection(sec);
                        setModalOpen(true);
                      }}
                      title="Edit Section Metadata"
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

                    {/* Duplicate */}
                    <button
                      onClick={() => handleDuplicate(sec)}
                      title="Duplicate Section"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-secondary)',
                        borderRadius: '4px',
                        padding: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <Copy size={14} />
                    </button>

                    {/* Delete */}
                    {!sec.is_system && (
                      <button
                        onClick={() => handleDelete(sec)}
                        title="Delete Section"
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
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit / Create Section Modal */}
      {modalOpen && editingSection && (
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
            maxWidth: '700px',
            maxHeight: '90vh',
            backgroundColor: 'var(--bg-steel)',
            border: '1px solid var(--border-cyan)',
            borderRadius: '12px',
            padding: '2rem',
            overflowY: 'auto',
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

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              {editingSection.id ? `EDIT SECTION: ${editingSection.title}` : 'CREATE NEW PORTFOLIO SECTION'}
            </h2>

            <form onSubmit={handleSaveSection} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">SECTION TITLE</label>
                  <input
                    type="text"
                    required
                    value={editingSection.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      // Auto slug if new section
                      const slug = !editingSection.id
                        ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                        : editingSection.slug;
                      setEditingSection({ ...editingSection, title, slug });
                    }}
                    placeholder="e.g. Additive Manufacturing Laboratory"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SLUG (ANCHOR #ID)</label>
                  <input
                    type="text"
                    required
                    disabled={editingSection.is_system}
                    value={editingSection.slug}
                    onChange={(e) => setEditingSection({
                      ...editingSection,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                    })}
                    placeholder="e.g. additive-manufacturing"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">NAVIGATION LABEL (HEADER / DRAWER)</label>
                  <input
                    type="text"
                    required
                    value={editingSection.nav_label || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, nav_label: e.target.value })}
                    placeholder="e.g. ADDITIVE LAB"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SECTION ICON (LUCIDE)</label>
                  <select
                    value={editingSection.icon || 'Layers'}
                    onChange={(e) => setEditingSection({ ...editingSection, icon: e.target.value })}
                    className="form-input"
                  >
                    {AVAILABLE_CMS_ICONS.map((iconName) => (
                      <option key={iconName} value={iconName}>{iconName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">SECTION TYPE</label>
                  <select
                    disabled={editingSection.is_system}
                    value={editingSection.section_type}
                    onChange={(e) => setEditingSection({ ...editingSection, section_type: e.target.value as SectionType })}
                    className="form-input"
                  >
                    {SECTION_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">LAYOUT TEMPLATE</label>
                  <select
                    value={editingSection.layout}
                    onChange={(e) => setEditingSection({ ...editingSection, layout: e.target.value as SectionLayout })}
                    className="form-input"
                  >
                    {LAYOUTS.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">ACCENT THEME</label>
                  <select
                    value={editingSection.accent_theme}
                    onChange={(e) => setEditingSection({ ...editingSection, accent_theme: e.target.value as AccentThemeToken })}
                    className="form-input"
                  >
                    {THEMES.map(th => (
                      <option key={th.value} value={th.value}>{th.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">TECHNICAL SUBTITLE / SUMMARY</label>
                <textarea
                  rows={2}
                  value={editingSection.description || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
                  placeholder="Parametric testing, boundary layer evaluation, and precision tooling..."
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">SECTION EDITORIAL CONTENT (MARKDOWN / TEXT)</label>
                <textarea
                  rows={4}
                  value={editingSection.content || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })}
                  placeholder="Enter detailed laboratory description, technical standards, or overview..."
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">PUBLICATION STATUS</label>
                  <select
                    value={editingSection.status}
                    onChange={(e) => setEditingSection({ ...editingSection, status: e.target.value as SectionStatus })}
                    className="form-input"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft (Hidden from public)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">INCLUDE IN NAVIGATION?</label>
                  <select
                    value={editingSection.in_navigation ? 'yes' : 'no'}
                    onChange={(e) => setEditingSection({ ...editingSection, in_navigation: e.target.value === 'yes' })}
                    className="form-input"
                  >
                    <option value="yes">Yes (Visible in Navbar)</option>
                    <option value="no">No (Direct anchor only)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">SECTION VISIBLE?</label>
                  <select
                    value={editingSection.visible ? 'yes' : 'no'}
                    onChange={(e) => setEditingSection({ ...editingSection, visible: e.target.value === 'yes' })}
                    className="form-input"
                  >
                    <option value="yes">Yes (Render on Page)</option>
                    <option value="no">No (Suppressed)</option>
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
                  <span>PERSIST SECTION CONFIGURATION</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Items Sub-Modal */}
      {itemModalSection && (
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
            maxWidth: '800px',
            maxHeight: '90vh',
            backgroundColor: 'var(--bg-steel)',
            border: '1px solid var(--border-cyan)',
            borderRadius: '12px',
            padding: '2rem',
            overflowY: 'auto',
            position: 'relative',
          }}>
            <button
              onClick={() => setItemModalSection(null)}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ITEMS: {itemModalSection.title.toUpperCase()}
                </h2>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                  SECTION ID: {itemModalSection.id}
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingItem({
                    id: '',
                    section_id: itemModalSection.id,
                    title: '',
                    subtitle: '',
                    slug: '',
                    body: '',
                    metadata: {},
                    media_url: '',
                    media_type: 'image',
                    display_order: contentItems.length,
                    status: 'published',
                    enabled: true,
                    created_at: '',
                    updated_at: '',
                  });
                  setItemFormOpen(true);
                }}
                className="btn-primary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                <Plus size={14} />
                <span>ADD ITEM</span>
              </button>
            </div>

            {/* Item List */}
            {itemsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                LOADING CONTENT ITEMS...
              </div>
            ) : contentItems.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No items created in this section yet. Click "+ ADD ITEM" above.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {contentItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</div>
                      {item.subtitle && <div style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>{item.subtitle}</div>}
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setMediaModalItem(item)}
                        title="Manage Photos & Videos"
                        style={{
                          background: 'rgba(0, 229, 255, 0.08)',
                          border: '1px solid rgba(0, 229, 255, 0.25)',
                          color: 'var(--accent-cyan)',
                          borderRadius: '4px',
                          padding: '5px 8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        <ImageIcon size={13} />
                        <span>MEDIA</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setItemFormOpen(true);
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
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          borderRadius: '4px',
                          padding: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Nested Item Editor */}
            {itemFormOpen && editingItem && (
              <form onSubmit={handleSaveItem} style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '8px', border: '1px solid var(--border-cyan)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                  {editingItem.id ? 'EDIT CONTENT ITEM' : 'ADD CONTENT ITEM'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">ITEM TITLE</label>
                    <input
                      type="text"
                      required
                      value={editingItem.title}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">SUBTITLE / METRIC</label>
                    <input
                      type="text"
                      value={editingItem.subtitle || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, subtitle: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">DESCRIPTION / BODY</label>
                    <textarea
                      rows={3}
                      value={editingItem.body || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, body: e.target.value })}
                      className="form-textarea"
                    />
                  </div>

                  {/* Universal Media Gallery Manager */}
                  {editingItem.id ? (
                    <UniversalMediaManager
                      entityType="section_item"
                      entityId={editingItem.id}
                      onMediaChanged={(items) => {
                        const primary = items.find(i => i.is_primary) || items[0];
                        if (primary) {
                          setEditingItem({
                            ...editingItem,
                            media_url: primary.url,
                            media_type: primary.type as any,
                          });
                        }
                      }}
                    />
                  ) : (
                    <div style={{
                      padding: '1rem',
                      marginTop: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'rgba(6, 11, 20, 0.5)',
                      border: '1px dashed var(--border-subtle)',
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'center',
                    }}>
                      [TIP] Save this item first to upload photos and videos to its media gallery.
                    </div>
                  )}

                  <div className="form-group" style={{ marginTop: '0.75rem' }}>
                    <label className="form-label">EXTERNAL / FALLBACK MEDIA URL (OPTIONAL)</label>
                    <input
                      type="text"
                      placeholder="https://... (auto-filled on media upload or manual external URL)"
                      value={editingItem.media_url || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, media_url: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => setItemFormOpen(false)}
                      className="btn-secondary"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      SAVE ITEM
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Quick Media Upload Modal for Content Item */}
      {mediaModalItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '1.5rem',
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            border: '1px solid var(--border-cyan)',
            boxShadow: '0 0 40px rgba(0, 229, 255, 0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-medium)', paddingBottom: '1rem' }}>
              <div>
                <div className="hud-tag" style={{ color: 'var(--accent-cyan)' }}>ITEM MEDIA DOSSIER</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, margin: '4px 0 0' }}>
                  {mediaModalItem.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMediaModalItem(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <UniversalMediaManager
              entityType="section_item"
              entityId={mediaModalItem.id}
              onMediaChanged={(items) => {
                const primary = items.find(i => i.is_primary) || items[0];
                if (primary) {
                  setContentItems(prev => prev.map(i => i.id === mediaModalItem.id ? { ...i, media_url: primary.url, media_type: primary.type as any } : i));
                }
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setMediaModalItem(null)}
                className="btn-primary"
                style={{ fontSize: '0.8rem' }}
              >
                DONE / CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
