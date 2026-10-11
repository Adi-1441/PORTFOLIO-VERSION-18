// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN PORTAL SHELL & SIDEBAR
// High-efficiency, zero heavy 3D overhead, fast and reliable administrative CMS.
// ==============================================================================

import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, User, Info, Cpu, FolderGit2, Boxes,
  Sliders, Award, Brain, BookOpen, Eye, Settings,
  Mail, Activity, LogOut, ExternalLink, Menu, X, ShieldCheck,
  Layers, Navigation, FlaskConical, Link2
} from 'lucide-react';
import { useCursor } from '../context/CursorContext';

const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Section Builder', path: '/admin/sections', icon: Layers },
  { label: 'Navigation Matrix', path: '/admin/navigation', icon: Navigation },
  { label: 'Profile & Identity', path: '/admin/profile', icon: User },
  { label: 'Scientific Research', path: '/admin/research', icon: FlaskConical },
  { label: 'Projects', path: '/admin/projects', icon: FolderGit2 },
  { label: 'CAD & CAE', path: '/admin/cad-cae', icon: Boxes },
  { label: 'PLC & Automation', path: '/admin/plc', icon: Sliders },
  { label: 'Certifications', path: '/admin/certifications', icon: Award },
  { label: 'AI × Engineering', path: '/admin/ai-engineering', icon: Brain },
  { label: 'Articles & Dossiers', path: '/admin/articles', icon: BookOpen },
  { label: 'Connections & Links', path: '/admin/connections', icon: Link2 },
  { label: 'Skills Matrix', path: '/admin/skills', icon: Cpu },
  { label: 'About Section', path: '/admin/about', icon: Info },
  { label: 'Section Visibility', path: '/admin/visibility', icon: Eye },
  { label: '3D Background Settings', path: '/admin/visualization', icon: Settings },
  { label: 'Contact Messages', path: '/admin/messages', icon: Mail },
  { label: 'System Diagnostics', path: '/admin/diagnostics', icon: Activity },
];

export const AdminLayout: React.FC = () => {
  const { user, signOut, adminRecord } = useAuth();
  const { setMode } = useCursor();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: 'rgba(5, 10, 20, 0.88)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)',
      position: 'relative',
      zIndex: 1,
    }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: '260px',
        backgroundColor: 'rgba(8, 16, 30, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border-medium)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 50,
        transition: 'transform var(--transition-medium)',
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'rgba(0, 229, 255, 0.15)',
            border: '1px solid var(--border-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-cyan)',
          }}>
            <Cpu size={18} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.08em' }}>
              MECHNEXUS
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--accent-cyan)' }}>
              ADMIN CMS // V18.3
            </div>
          </div>
        </div>

        {/* Navigation Items List */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2rem',
        }}>
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                onClick={() => setSidebarOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-xs)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  letterSpacing: '0.04em',
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--border-cyan)' : 'transparent'}`,
                  transition: 'all var(--transition-fast)',
                })}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(4, 8, 16, 0.6)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '0.75rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: '#34d399',
          }}>
            <ShieldCheck size={14} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email || 'Admin'}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            onMouseEnter={() => setMode('button')}
            onMouseLeave={() => setMode('default')}
            className="btn-secondary"
            style={{ width: '100%', fontSize: '0.72rem', padding: '0.45rem' }}
          >
            <LogOut size={13} />
            <span>DISCONNECT SESSION</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{
        marginLeft: '260px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
        {/* Top Operational Bar */}
        <header style={{
          height: '60px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: '#070e1c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}>
          <div className="vernier-badge" style={{ color: 'var(--accent-cyan)' }}>
            CONTROL PLANE // PRODUCTION INSTANCE
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link
              to="/portfolio"
              target="_blank"
              onMouseEnter={() => setMode('button')}
              onMouseLeave={() => setMode('default')}
              className="btn-secondary"
              style={{ fontSize: '0.72rem', padding: '0.4rem 0.85rem' }}
            >
              <span>VIEW PUBLIC SITE</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ padding: '2.5rem', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
