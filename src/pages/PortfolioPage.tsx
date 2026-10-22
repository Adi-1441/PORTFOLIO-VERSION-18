// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — MAIN PORTFOLIO PAGE
// Dynamic multi-section rendering pipeline with Three.js live background.
// ==============================================================================

import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/sections/Hero';
import { About } from '../components/sections/About';
import { Skills } from '../components/sections/Skills';
import { Projects } from '../components/sections/Projects';
import { CadCae } from '../components/sections/CadCae';
import { PlcAutomation } from '../components/sections/PlcAutomation';
import { Certifications } from '../components/sections/Certifications';
import { AiEngineering } from '../components/sections/AiEngineering';
import { Articles } from '../components/sections/Articles';
import { Research } from '../components/sections/Research';
import { Resume } from '../components/sections/Resume';
import { Connections } from '../components/sections/Connections';
import { Contact } from '../components/sections/Contact';
import { QrCodeSection } from '../components/sections/QrCodeSection';
import { DynamicSectionRenderer } from '../components/sections/DynamicSectionRenderer';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SEOHead } from '../components/common/SEOHead';
import { portfolioService } from '../services/portfolio.service';
import {
  Profile, About as AboutType, Skill, Project, CadCae as CadCaeType,
  PlcAutomation as PlcType, Certification, AiEngineering as AiEngType,
  Article, Connection, Research as ResearchType, PortfolioSection
} from '../types/database';

export const PortfolioPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [about, setAbout] = useState<AboutType | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [cadCae, setCadCae] = useState<CadCaeType[]>([]);
  const [plc, setPlc] = useState<PlcType[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [aiEng, setAiEng] = useState<AiEngType[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [research, setResearch] = useState<ResearchType[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadPortfolioData() {
      try {
        const [
          profData, aboutData, skillsData, projData,
          cadData, plcData, certData, aiData,
          artData, resData, connData, secData, visData
        ] = await Promise.all([
          portfolioService.getProfile(),
          portfolioService.getAbout(),
          portfolioService.getSkills(),
          portfolioService.getProjects(),
          portfolioService.getCadCae(),
          portfolioService.getPlcAutomation(),
          portfolioService.getCertifications(),
          portfolioService.getAiEngineering(),
          portfolioService.getArticles(),
          portfolioService.getResearch(),
          portfolioService.getConnections(),
          portfolioService.getSections(),
          portfolioService.getSectionVisibility(),
        ]);

        setProfile(profData);
        setAbout(aboutData);
        setSkills(skillsData);
        setProjects(projData);
        setCadCae(cadData);
        setPlc(plcData);
        setCerts(certData);
        setAiEng(aiData);
        setArticles(artData);
        setResearch(resData);
        setConnections(connData);
        setSections(secData);
        setVisibility(visData);
      } catch (err) {
        console.error('[PORTFOLIO LOAD ERROR]', err);
      } finally {
        setLoading(false);
      }
    }

    loadPortfolioData();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      }}>
        <LoadingSpinner label="CALIBRATING MULTI-PHYSICS WORKSPACE..." size="lg" />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: 'transparent' }}>
      <SEOHead
        title={profile?.seo_title || 'ADITHYA MECHNEXUS | Mechanical Engineering Digital Laboratory'}
        description={profile?.seo_description || 'Mechanical engineering student portfolio of Adithya G.'}
        keywords={profile?.seo_keywords || undefined}
      />

      {/* Fixed Navigation Bar */}
      <Navbar />

      {/* Main Content Sections */}
      <main style={{ position: 'relative', zIndex: 10 }}>
        {sections.length > 0 ? (
          <>
            {sections.map((sec) => (
              <DynamicSectionRenderer
                key={sec.id}
                section={sec}
                profile={profile}
                about={about}
                skills={skills}
                projects={projects}
                cadCae={cadCae}
                plc={plc}
                certs={certs}
                aiEng={aiEng}
                articles={articles}
                research={research}
                connections={connections}
              />
            ))}
            {!sections.some((s) => s.slug === 'qr-code' || s.slug === 'qr') && <QrCodeSection />}
          </>
        ) : (
          /* Safe Fallback */
          <>
            {visibility.hero !== false && profile && <Hero profile={profile} />}
            {visibility.about !== false && about && <About about={about} />}
            {visibility.skills !== false && skills.length > 0 && <Skills skills={skills} />}
            {visibility.projects !== false && projects.length > 0 && <Projects projects={projects} />}
            {visibility['cad-cae'] !== false && cadCae.length > 0 && <CadCae entries={cadCae} />}
            {visibility.plc !== false && plc.length > 0 && <PlcAutomation entries={plc} />}
            {visibility.certifications !== false && certs.length > 0 && <Certifications certifications={certs} />}
            {visibility['ai-engineering'] !== false && aiEng.length > 0 && <AiEngineering entries={aiEng} />}
            {visibility.articles !== false && articles.length > 0 && <Articles articles={articles} />}
            {research.length > 0 && <Research entries={research} />}
            {visibility.resume !== false && profile && <Resume profile={profile} />}
            {visibility.connections !== false && connections.length > 0 && <Connections connections={connections} />}
            {visibility.contact !== false && <Contact />}
            <QrCodeSection />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
