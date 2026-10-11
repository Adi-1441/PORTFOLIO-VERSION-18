// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — DYNAMIC CUSTOM SECTION COMPONENT
// Renders custom CMS sections according to configured layout and accent theme.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronRight, X, Calendar, Tag, FileText } from 'lucide-react';
import { PortfolioSection, PortfolioContentItem, AccentThemeToken } from '../../types/database';
import { portfolioService } from '../../services/portfolio.service';
import { DynamicIcon } from '../common/DynamicIcon';
import { useCursor } from '../../context/CursorContext';
import { UniversalMediaGallery } from '../common/UniversalMediaGallery';

interface DynamicCustomSectionProps {
  section: PortfolioSection;
  items?: PortfolioContentItem[];
}

export const DynamicCustomSection: React.FC<DynamicCustomSectionProps> = ({
  section,
  items: initialItems,
}) => {
  const { setMode } = useCursor();
  const [items, setItems] = useState<PortfolioContentItem[]>(initialItems || []);
  const [loading, setLoading] = useState(!initialItems);
  const [selectedItem, setSelectedItem] = useState<PortfolioContentItem | null>(null);

  useEffect(() => {
    if (initialItems) {
      setItems(initialItems);
      return;
    }
    let isMounted = true;
    async function loadItems() {
      try {
        const data = await portfolioService.getContentItems(section.id);
        if (isMounted) setItems(data);
      } catch (err) {
        console.error(`Failed to load content items for section ${section.slug}:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadItems();
    return () => { isMounted = false; };
  }, [section.id, initialItems]);

  // Accent theme color map
  const themeColors: Record<AccentThemeToken, { accent: string; bg: string; border: string }> = {
    cyan: { accent: 'var(--accent-cyan)', bg: 'rgba(0, 229, 255, 0.08)', border: 'rgba(0, 229, 255, 0.25)' },
    blue: { accent: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.25)' },
    violet: { accent: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)', border: 'rgba(139, 92, 246, 0.25)' },
    emerald: { accent: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.25)' },
    amber: { accent: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.25)' },
    steel: { accent: '#94a3b8', bg: 'rgba(148, 163, 184, 0.08)', border: 'rgba(148, 163, 184, 0.25)' },
  };

  const currentTheme = themeColors[section.accent_theme] || themeColors.cyan;

  return (
    <section id={section.slug} className="section-padding" style={{ position: 'relative', zIndex: 10 }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div className="hud-tag" style={{ borderColor: currentTheme.border, color: currentTheme.accent }}>
            <DynamicIcon name={section.icon} size={14} color={currentTheme.accent} />
            <span>MODULE //{section.slug.toUpperCase()}</span>
          </div>
          <h2 className="section-title">{section.title}</h2>
          {section.description && (
            <p className="section-subtitle">{section.description}</p>
          )}
        </div>

        {/* Optional Section Editorial Content if provided */}
        {section.content && section.layout !== 'split_two_col' && (
          <div className="glass-panel" style={{
            padding: '2rem',
            marginBottom: '2.5rem',
            borderLeft: `3px solid ${currentTheme.accent}`,
            borderRadius: '8px',
          }}>
            <p style={{
              fontSize: '1rem',
              lineHeight: 1.8,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-line',
            }}>
              {section.content}
            </p>
          </div>
        )}

        {/* Layout Renderers */}
        {section.layout === 'split_two_col' ? (
          /* Split Two Column Layout */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start',
          }}>
            <div className="glass-panel" style={{
              padding: '2.5rem',
              borderRadius: '12px',
              borderLeft: `3px solid ${currentTheme.accent}`,
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '1rem',
              }}>
                TECHNICAL SPECIFICATION
              </h3>
              <p style={{
                fontSize: '0.95rem',
                lineHeight: 1.8,
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-line',
              }}>
                {section.content || section.description || 'Module initialized with parametric configuration.'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {items.map((item, idx) => (
                <ItemCard
                  key={item.id || idx}
                  item={item}
                  theme={currentTheme}
                  onSelect={() => setSelectedItem(item)}
                  setMode={setMode}
                />
              ))}
            </div>
          </div>
        ) : section.layout === 'timeline' ? (
          /* Timeline Layout */
          <div style={{
            position: 'relative',
            paddingLeft: '2rem',
            borderLeft: `2px solid ${currentTheme.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
          }}>
            {items.map((item, idx) => (
              <div key={item.id || idx} style={{ position: 'relative' }}>
                {/* Timeline node */}
                <div style={{
                  position: 'absolute',
                  left: '-2.45rem',
                  top: '0.5rem',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: currentTheme.accent,
                  border: '3px solid var(--bg-void)',
                  boxShadow: `0 0 10px ${currentTheme.accent}`,
                }} />

                <ItemCard
                  item={item}
                  theme={currentTheme}
                  onSelect={() => setSelectedItem(item)}
                  setMode={setMode}
                />
              </div>
            ))}
          </div>
        ) : section.layout === 'list' ? (
          /* Spec List Layout */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="glass-panel"
                onClick={() => setSelectedItem(item)}
                onMouseEnter={() => setMode('button')}
                onMouseLeave={() => setMode('default')}
                style={{
                  padding: '1.25rem 2rem',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  border: '1px solid var(--border-steel)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: currentTheme.accent, letterSpacing: '1px' }}>
                    SPEC //{String(idx + 1).padStart(2, '0')}
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {item.title}
                  </h4>
                  {item.subtitle && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.subtitle}</div>
                  )}
                </div>
                <ChevronRight size={18} color={currentTheme.accent} />
              </div>
            ))}
          </div>
        ) : (
          /* Default Grid Cards Layout */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem',
          }}>
            {items.map((item, idx) => (
              <ItemCard
                key={item.id || idx}
                item={item}
                theme={currentTheme}
                onSelect={() => setSelectedItem(item)}
                setMode={setMode}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && !section.content && (
          <div className="glass-panel" style={{
            padding: '3rem',
            textAlign: 'center',
            borderRadius: '12px',
          }}>
            <DynamicIcon name={section.icon} size={32} color={currentTheme.accent} style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Section Initialized</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Content items can be added directly via the Section Builder in the Admin portal.
            </p>
          </div>
        )}
      </div>

      {/* Item Inspection Modal */}
      <AnimatePresence>
        {selectedItem && (
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                width: '100%',
                maxWidth: '650px',
                maxHeight: '85vh',
                backgroundColor: 'var(--bg-steel)',
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '12px',
                padding: '2.5rem',
                overflowY: 'auto',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              }}
            >
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: 'var(--text-secondary)',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>

              <div className="hud-tag" style={{ borderColor: currentTheme.border, color: currentTheme.accent, marginBottom: '1rem' }}>
                <FileText size={14} />
                <span>ITEM TELEMETRY</span>
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {selectedItem.title}
              </h2>

              {selectedItem.subtitle && (
                <div style={{ fontSize: '0.95rem', color: currentTheme.accent, fontFamily: 'var(--font-mono)', marginBottom: '1.5rem' }}>
                  {selectedItem.subtitle}
                </div>
              )}

              {/* Universal Media Gallery Dossier */}
              <UniversalMediaGallery
                media={selectedItem.metadata?.gallery}
                entityType="section_item"
                entityId={selectedItem.id}
                title={selectedItem.title}
                maxPreviewCount={6}
              />

              {selectedItem.body && (
                <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-line', marginBottom: '1.5rem' }}>
                  {selectedItem.body}
                </p>
              )}

              {selectedItem.metadata && Object.keys(selectedItem.metadata).length > 0 && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                    METADATA ATTRIBUTES
                  </div>
                  {Object.entries(selectedItem.metadata).map(([key, val]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{key}:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{String(val)}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

// Reusable card for items
interface ItemCardProps {
  item: PortfolioContentItem;
  theme: { accent: string; bg: string; border: string };
  onSelect: () => void;
  setMode: (mode: any) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, theme, onSelect, setMode }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass-panel"
      style={{
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid var(--border-steel)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}
    >
      <div>
        {item.metadata?.gallery && item.metadata.gallery.length > 0 ? (
          <UniversalMediaGallery
            media={item.metadata.gallery}
            title={item.title}
          />
        ) : item.media_url ? (
          <div style={{
            height: '180px',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}>
            <img
              src={item.media_url}
              alt={item.title}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : null}

        {item.subtitle && (
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: theme.accent,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}>
            {item.subtitle}
          </div>
        )}

        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '0.75rem',
          lineHeight: 1.4,
        }}>
          {item.title}
        </h3>

        {item.body && (
          <p style={{
            fontSize: '0.9rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '1.25rem',
          }}>
            {item.body}
          </p>
        )}
      </div>

      <div style={{
        paddingTop: '1rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <button
          onClick={onSelect}
          onMouseEnter={() => setMode('crosshair')}
          onMouseLeave={() => setMode('default')}
          style={{
            background: 'transparent',
            border: 'none',
            color: theme.accent,
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '1px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <span>VIEW SPEC</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};
