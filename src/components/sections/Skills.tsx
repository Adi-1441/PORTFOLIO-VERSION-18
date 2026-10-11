// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — SKILLS MATRIX SECTION
// Comprehensive mechanical, simulation, automation, and programming competencies.
// ==============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Box, Activity, Wind, Flame, Grid, Wrench, Compass, Sliders, Layers, Terminal, Brain, Microscope } from 'lucide-react';
import { Skill } from '../../types/database';

interface SkillsProps {
  skills: Skill[];
}

export const Skills: React.FC<SkillsProps> = ({ skills }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(skills.map(s => s.category)))];

  const filteredSkills = selectedCategory === 'ALL'
    ? skills
    : skills.filter(s => s.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CAD': return <Box size={18} />;
      case 'FEA': return <Activity size={18} />;
      case 'CFD': return <Wind size={18} />;
      case 'THERMAL': return <Flame size={18} />;
      case 'CAE': return <Grid size={18} />;
      case 'MANUFACTURING': return <Wrench size={18} />;
      case 'METROLOGY': return <Compass size={18} />;
      case 'PLC': return <Sliders size={18} />;
      case 'INDUSTRIAL AUTOMATION': return <Layers size={18} />;
      case 'ROBOTICS': return <Cpu size={18} />;
      case 'PROGRAMMING': return <Terminal size={18} />;
      case 'AI × ENGINEERING': return <Brain size={18} />;
      case 'RESEARCH': return <Microscope size={18} />;
      default: return <Cpu size={18} />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return '#00e5ff';
      case 'advanced': return '#3d7eff';
      case 'intermediate': return '#14b8a6';
      case 'beginner': return '#a855f7';
      default: return '#38bdf8';
    }
  };

  return (
    <section id="skills" className="section-padding" style={{ position: 'relative', zIndex: 10 }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ marginBottom: '3rem' }}>
          <div className="hud-tag">
            <Cpu size={14} />
            <span>TECHNICAL CAPABILITY MATRIX</span>
          </div>
          <h2 className="section-title">ENGINEERING COMPETENCIES</h2>
          <p className="section-subtitle">
            Multidisciplinary engineering toolsets spanning physical hardware, finite element mechanics,
            aerodynamics, programmable logic controllers, and computational intelligence.
          </p>
        </div>

        {/* Category Filters */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '2.5rem',
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}
              style={{
                fontSize: '0.72rem',
                padding: '0.45rem 0.95rem',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Skills Cards Grid */}
        <div className="grid-cards">
          {filteredSkills.map((skill, idx) => (
            <motion.div
              key={skill.id || idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: (idx % 6) * 0.05 }}
              className="glass-panel card-interactive"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Header: Category + Level Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--accent-cyan)',
                  }}>
                    {getCategoryIcon(skill.category)}
                    <span>{skill.category}</span>
                  </div>

                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-xs)',
                      color: getLevelColor(skill.level),
                      border: `1px solid ${getLevelColor(skill.level)}44`,
                      background: `${getLevelColor(skill.level)}11`,
                    }}
                  >
                    {skill.level}
                  </span>
                </div>

                {/* Skill Name */}
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  color: 'var(--text-primary)',
                }}>
                  {skill.name}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.55,
                  marginBottom: '1.25rem',
                }}>
                  {skill.description}
                </p>
              </div>

              {/* Tools Tags */}
              {skill.tools && skill.tools.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <div className="vernier-badge" style={{ marginBottom: '0.4rem' }}>SOFTWARE / STANDARDS:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {skill.tools.map((tool, tIdx) => (
                      <span key={tIdx} className="badge-tech badge-tech-blue" style={{ fontSize: '0.6875rem' }}>
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
