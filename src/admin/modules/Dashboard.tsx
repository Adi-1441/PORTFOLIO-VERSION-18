// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN DASHBOARD MODULE
// Telemetry counters, quick actions, and database connectivity overview.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderGit2, Cpu, Boxes, Sliders, Award,
  BookOpen, Mail, ShieldCheck, ArrowRight, Activity
} from 'lucide-react';
import { portfolioService } from '../../services/portfolio.service';
import { contactService } from '../../services/contact.service';
import { isSupabaseReady } from '../../lib/supabase';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    cadCae: 0,
    plc: 0,
    certs: 0,
    articles: 0,
    unreadMessages: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [projects, skills, cad, plc, certs, articles, messagesRes] = await Promise.all([
          portfolioService.getProjects(),
          portfolioService.getSkills(),
          portfolioService.getCadCae(),
          portfolioService.getPlcAutomation(),
          portfolioService.getCertifications(),
          portfolioService.getArticles(),
          contactService.getMessages(),
        ]);

        setStats({
          projects: projects.length,
          skills: skills.length,
          cadCae: cad.length,
          plc: plc.length,
          certs: certs.length,
          articles: articles.length,
          unreadMessages: messagesRes.data.filter(m => !m.read).length,
        });
      } catch (err) {
        console.error('[DASHBOARD STATS ERROR]', err);
      }
    }

    loadStats();
  }, []);

  const cards = [
    { label: 'Engineering Projects', count: stats.projects, path: '/admin/projects', icon: FolderGit2, color: 'var(--accent-cyan)' },
    { label: 'Skills in Matrix', count: stats.skills, path: '/admin/skills', icon: Cpu, color: '#38bdf8' },
    { label: 'CAD & CAE Simulations', count: stats.cadCae, path: '/admin/cad-cae', icon: Boxes, color: '#60a5fa' },
    { label: 'PLC Automation Cells', count: stats.plc, path: '/admin/plc', icon: Sliders, color: '#34d399' },
    { label: 'Accredited Credentials', count: stats.certs, path: '/admin/certifications', icon: Award, color: '#fbbf24' },
    { label: 'Published Articles', count: stats.articles, path: '/admin/articles', icon: BookOpen, color: '#c084fc' },
  ];

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="hud-tag">CMS TELEMETRY DASHBOARD</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800 }}>
          System Overview & Content Management
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Real-time record counts across active Supabase database tables.
        </p>
      </div>

      {/* Connectivity Banner */}
      <div style={{
        background: isSupabaseReady() ? 'rgba(52, 211, 153, 0.08)' : 'rgba(245, 158, 11, 0.08)',
        border: `1px solid ${isSupabaseReady() ? 'rgba(52, 211, 153, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
        padding: '1rem 1.5rem',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={20} color={isSupabaseReady() ? '#34d399' : '#fbbf24'} />
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600, color: isSupabaseReady() ? '#34d399' : '#fbbf24' }}>
              {isSupabaseReady() ? 'SUPABASE CLOUD CLUSTER CONNECTED' : 'LOCAL CACHE / STANDALONE PREVIEW MODE'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {isSupabaseReady()
                ? 'All modifications persist directly to remote PostgreSQL schema with RLS enforcement.'
                : 'Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in root .env for production database sync.'}
            </div>
          </div>
        </div>

        <Link to="/admin/diagnostics" className="btn-secondary" style={{ fontSize: '0.72rem', padding: '0.4rem 0.8rem' }}>
          <Activity size={13} />
          <span>RUN DIAGNOSTICS</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem',
      }}>
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.path}
              className="glass-panel card-interactive"
              style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="vernier-badge" style={{ color: card.color }}>{card.label}</span>
                  <Icon size={18} color={card.color} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {card.count}
                </div>
              </div>

              <div style={{
                marginTop: '1.5rem',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
              }}>
                <span>MANAGE RECORDS</span>
                <ArrowRight size={13} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Unread Messages Callout */}
      {stats.unreadMessages > 0 && (
        <div style={{
          background: 'rgba(0, 229, 255, 0.08)',
          border: '1px solid var(--border-cyan)',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={20} color="var(--accent-cyan)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                You have {stats.unreadMessages} unread engineering inquiry message(s).
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Received through public laboratory contact comms portal.
              </div>
            </div>
          </div>
          <Link to="/admin/messages" className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>
            VIEW MESSAGES
          </Link>
        </div>
      )}
    </div>
  );
};
