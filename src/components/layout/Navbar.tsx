// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — FULLY DYNAMIC RESPONSIVE NAVIGATION BAR
// Dynamically rendered from CMS published sections and custom navigation links.
// Responsive desktop matrix, compact "MORE" dropdown, and mobile telemetry drawer.
// ==============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Shield, Cpu, ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';
import { useCursor } from '../../context/CursorContext';
import { Link } from 'react-router-dom';
import { portfolioService } from '../../services/portfolio.service';
import { NavigationItem } from '../../types/database';

const DEFAULT_FALLBACK_NAV: NavigationItem[] = [
  { id: '1', label: 'HOME', href: '#hero', display_order: 0, enabled: true, created_at: '', updated_at: '' },
  { id: '2', label: 'ABOUT', href: '#about', display_order: 1, enabled: true, created_at: '', updated_at: '' },
  { id: '3', label: 'SKILLS', href: '#skills', display_order: 2, enabled: true, created_at: '', updated_at: '' },
  { id: '4', label: 'PROJECTS', href: '#projects', display_order: 3, enabled: true, created_at: '', updated_at: '' },
  { id: '5', label: 'RESEARCH', href: '#research', display_order: 4, enabled: true, created_at: '', updated_at: '' },
  { id: '6', label: 'CAD & CAE', href: '#cad-cae', display_order: 5, enabled: true, created_at: '', updated_at: '' },
  { id: '7', label: 'PLC & AUTOMATION', href: '#plc', display_order: 6, enabled: true, created_at: '', updated_at: '' },
  { id: '8', label: 'CERTIFICATIONS', href: '#certifications', display_order: 7, enabled: true, created_at: '', updated_at: '' },
  { id: '9', label: 'AI × ENGINEERING', href: '#ai-engineering', display_order: 8, enabled: true, created_at: '', updated_at: '' },
  { id: '10', label: 'ARTICLES', href: '#articles', display_order: 9, enabled: true, created_at: '', updated_at: '' },
  { id: '11', label: 'RESUME', href: '#resume', display_order: 10, enabled: true, created_at: '', updated_at: '' },
  { id: '12', label: 'CONNECTIONS', href: '#connections', display_order: 11, enabled: true, created_at: '', updated_at: '' },
  { id: '13', label: 'CONTACT', href: '#contact', display_order: 12, enabled: true, created_at: '', updated_at: '' },
];

export const Navbar: React.FC = () => {
  const [navItems, setNavItems] = useState<NavigationItem[]>(DEFAULT_FALLBACK_NAV);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const { setMode } = useCursor();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic navigation items
  useEffect(() => {
    let isMounted = true;
    async function loadNavigation() {
      try {
        const items = await portfolioService.getNavigation();
        if (isMounted && items && items.length > 0) {
          setNavItems(items);
        }
      } catch (err) {
        console.error('Failed to load navigation items:', err);
      }
    }
    loadNavigation();
    return () => { isMounted = false; };
  }, []);

  // Scrollspy observer for active section
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const inPageItems = navItems.filter(item => item.href.startsWith('#'));
      const sectionElements = inPageItems.map(item => document.querySelector(item.href));
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el && (el as HTMLElement).offsetTop <= scrollPosition) {
          setActiveSection(inPageItems[i].href.substring(1));
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems]);

  // Close "MORE" dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isExternal?: boolean) => {
    if (isExternal || !href.startsWith('#')) {
      return; // Regular external navigation
    }
    e.preventDefault();
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Divide into Primary and Secondary for compact desktop displays
  const primaryNavItems = navItems.length > 7 ? navItems.slice(0, 6) : navItems;
  const secondaryNavItems = navItems.length > 7 ? navItems.slice(6) : [];

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxWidth: '100vw',
        height: 'var(--header-height)',
        zIndex: 900,
        backgroundColor: isScrolled ? 'rgba(4, 9, 18, 0.94)' : 'rgba(6, 11, 20, 0.70)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${isScrolled ? 'var(--border-medium)' : 'var(--border-subtle)'}`,
        transition: 'all var(--transition-medium)',
        boxSizing: 'border-box',
      }}>
        <div
          className="container"
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Brand Logo Link */}
          <Link
            to="/"
            onMouseEnter={() => setMode('button')}
            onMouseLeave={() => setMode('default')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2) 0%, rgba(61, 126, 255, 0.2) 100%)',
              border: '1px solid var(--border-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)',
            }}>
              <Cpu size={19} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '0.95rem',
                letterSpacing: '0.12em',
                color: 'var(--text-primary)',
                lineHeight: 1.1,
              }}>
                MECHNEXUS
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                color: 'var(--accent-cyan)',
                letterSpacing: '0.14em',
              }}>
                ADITHYA G // V18.3
              </div>
            </div>
          </Link>

          {/* =========================================================================
              VARIANT A: WIDE DESKTOP NAVIGATION (>= 1320px) — FULL CMS LIST
          ========================================================================= */}
          <nav
            className="desktop-only nav-desktop-wide"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              flexWrap: 'nowrap',
            }}
          >
            {navItems.map((item) => {
              const isAnchor = item.href.startsWith('#');
              const isActive = isAnchor && activeSection === item.href.substring(1);
              return (
                <a
                  key={item.id || item.label}
                  href={item.href}
                  target={!isAnchor || item.is_external ? '_blank' : undefined}
                  rel={!isAnchor || item.is_external ? 'noopener noreferrer' : undefined}
                  onClick={(e) => handleNavClick(e, item.href, item.is_external || !isAnchor)}
                  onMouseEnter={() => setMode('button')}
                  onMouseLeave={() => setMode('default')}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.06em',
                    padding: '0.35rem 0.5rem',
                    borderRadius: 'var(--radius-xs)',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--border-cyan)' : 'transparent'}`,
                    transition: 'all var(--transition-fast)',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{item.label}</span>
                  {(!isAnchor || item.is_external) && <ExternalLink size={10} />}
                </a>
              );
            })}

            {/* Admin Direct Access */}
            <Link
              to="/admin/login"
              onMouseEnter={() => setMode('button')}
              onMouseLeave={() => setMode('default')}
              title="Admin Portal Access"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(0, 229, 255, 0.08)',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                color: 'var(--accent-cyan)',
                marginLeft: '0.35rem',
                flexShrink: 0,
                transition: 'all var(--transition-fast)',
              }}
            >
              <Shield size={14} />
            </Link>
          </nav>

          {/* =========================================================================
              VARIANT B: COMPACT DESKTOP NAVIGATION (1025px - 1319px) — WITH "MORE" MENU
          ========================================================================= */}
          <nav
            className="desktop-only nav-desktop-compact"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              flexWrap: 'nowrap',
            }}
          >
            {primaryNavItems.map((item) => {
              const isAnchor = item.href.startsWith('#');
              const isActive = isAnchor && activeSection === item.href.substring(1);
              return (
                <a
                  key={item.id || item.label}
                  href={item.href}
                  target={!isAnchor || item.is_external ? '_blank' : undefined}
                  rel={!isAnchor || item.is_external ? 'noopener noreferrer' : undefined}
                  onClick={(e) => handleNavClick(e, item.href, item.is_external || !isAnchor)}
                  onMouseEnter={() => setMode('button')}
                  onMouseLeave={() => setMode('default')}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.07em',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--radius-xs)',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                    border: `1px solid ${isActive ? 'var(--border-cyan)' : 'transparent'}`,
                    transition: 'all var(--transition-fast)',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{item.label}</span>
                  {(!isAnchor || item.is_external) && <ExternalLink size={11} />}
                </a>
              );
            })}

            {/* "MORE" Compact Dropdown for overflow items */}
            {secondaryNavItems.length > 0 && (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  onMouseEnter={() => setMode('button')}
                  onMouseLeave={() => setMode('default')}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.07em',
                    padding: '0.4rem 0.65rem',
                    borderRadius: 'var(--radius-xs)',
                    color: moreDropdownOpen ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    backgroundColor: moreDropdownOpen ? 'rgba(0, 229, 255, 0.1)' : 'rgba(148, 163, 184, 0.06)',
                    border: `1px solid ${moreDropdownOpen ? 'var(--border-cyan)' : 'var(--border-subtle)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>MORE</span>
                  <ChevronDown size={13} style={{ transform: moreDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                </button>

                {/* Dropdown Menu Overlay */}
                {moreDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    backgroundColor: 'rgba(4, 9, 18, 0.96)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid var(--border-cyan)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.8), 0 0 15px rgba(0, 229, 255, 0.2)',
                    padding: '0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    zIndex: 999,
                  }}>
                    {secondaryNavItems.map((item) => {
                      const isAnchor = item.href.startsWith('#');
                      const isActive = isAnchor && activeSection === item.href.substring(1);
                      return (
                        <a
                          key={item.id || item.label}
                          href={item.href}
                          target={!isAnchor || item.is_external ? '_blank' : undefined}
                          rel={!isAnchor || item.is_external ? 'noopener noreferrer' : undefined}
                          onClick={(e) => handleNavClick(e, item.href, item.is_external || !isAnchor)}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            letterSpacing: '0.08em',
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-xs)',
                            color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                            backgroundColor: isActive ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            textDecoration: 'none',
                          }}
                        >
                          <span>{item.label}</span>
                          {(!isAnchor || item.is_external) ? (
                            <ExternalLink size={12} color="var(--accent-cyan)" />
                          ) : (
                            isActive && <span style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'var(--accent-cyan)' }} />
                          )}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Admin Direct Access */}
            <Link
              to="/admin/login"
              onMouseEnter={() => setMode('button')}
              onMouseLeave={() => setMode('default')}
              title="Admin Portal Access"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '30px',
                height: '30px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'rgba(0, 229, 255, 0.08)',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                color: 'var(--accent-cyan)',
                marginLeft: '0.25rem',
                flexShrink: 0,
              }}
            >
              <Shield size={14} />
            </Link>
          </nav>

          {/* =========================================================================
              MOBILE / TABLET HAMBURGER BUTTON (<= 1024px)
          ========================================================================= */}
          <button
            className="mobile-only"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Drawer"
            style={{
              padding: '0.5rem',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 229, 255, 0.08)',
              border: '1px solid var(--border-cyan)',
              borderRadius: 'var(--radius-xs)',
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* =========================================================================
          MOBILE / TABLET FULL SLIDE-OUT DRAWER MENU (<= 1024px)
      ========================================================================= */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          top: 'var(--header-height)',
          backgroundColor: 'rgba(3, 7, 15, 0.98)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          zIndex: 899,
          padding: '1.25rem 1.5rem 3rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
          borderTop: '1px solid var(--border-medium)',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.18em',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
          }}>
            LABORATORY SECTIONS [ {navItems.length} MODULES ]
          </div>

          {navItems.map((item, idx) => {
            const isAnchor = item.href.startsWith('#');
            const isActive = isAnchor && activeSection === item.href.substring(1);
            return (
              <a
                key={item.id || item.label}
                href={item.href}
                target={!isAnchor || item.is_external ? '_blank' : undefined}
                rel={!isAnchor || item.is_external ? 'noopener noreferrer' : undefined}
                onClick={(e) => handleNavClick(e, item.href, item.is_external || !isAnchor)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  letterSpacing: '0.1em',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-primary)',
                  backgroundColor: isActive ? 'rgba(0, 229, 255, 0.12)' : 'rgba(11, 19, 34, 0.75)',
                  border: `1px solid ${isActive ? 'var(--border-cyan)' : 'var(--border-subtle)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <span>{item.label}</span>
                </div>
                {(!isAnchor || item.is_external) ? (
                  <ExternalLink size={15} color="var(--accent-cyan)" />
                ) : (
                  <ChevronRight size={15} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                )}
              </a>
            );
          })}

          {/* Prominent Admin Access in Mobile Drawer */}
          <Link
            to="/admin/login"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              marginTop: '1.25rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              letterSpacing: '0.12em',
              padding: '0.9rem 1rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--accent-cyan)',
              backgroundColor: 'rgba(0, 229, 255, 0.1)',
              border: '1px solid rgba(0, 229, 255, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              textDecoration: 'none',
              boxShadow: '0 0 15px rgba(0, 229, 255, 0.15)',
            }}
          >
            <Shield size={16} />
            <span>ADMIN PORTAL ACCESS</span>
          </Link>
        </div>
      )}
    </>
  );
};
