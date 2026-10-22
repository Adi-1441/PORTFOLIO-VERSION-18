// ==============================================================================
// ADITHYA MECHNEXUS V18.3 — DYNAMIC SECTION DISPATCH RENDERER
// Routes portfolio sections by section_type / slug into dedicated or dynamic views.
// ==============================================================================

import React from 'react';
import {
  PortfolioSection, Profile, About as AboutType, Skill,
  Project, CadCae as CadCaeType, PlcAutomation as PlcType,
  Certification, AiEngineering as AiEngType, Article,
  Research as ResearchType, Connection
} from '../../types/database';
import { Hero } from './Hero';
import { About } from './About';
import { Skills } from './Skills';
import { Projects } from './Projects';
import { CadCae } from './CadCae';
import { PlcAutomation } from './PlcAutomation';
import { Certifications } from './Certifications';
import { AiEngineering } from './AiEngineering';
import { Articles } from './Articles';
import { Research } from './Research';
import { Resume } from './Resume';
import { Connections } from './Connections';
import { Contact } from './Contact';
import { QrCodeSection } from './QrCodeSection';
import { DynamicCustomSection } from './DynamicCustomSection';

export interface DynamicSectionRendererProps {
  section: PortfolioSection;
  profile: Profile | null;
  about: AboutType | null;
  skills: Skill[];
  projects: Project[];
  cadCae: CadCaeType[];
  plc: PlcType[];
  certs: Certification[];
  aiEng: AiEngType[];
  articles: Article[];
  research: ResearchType[];
  connections: Connection[];
}

export const DynamicSectionRenderer: React.FC<DynamicSectionRendererProps> = ({
  section,
  profile,
  about,
  skills,
  projects,
  cadCae,
  plc,
  certs,
  aiEng,
  articles,
  research,
  connections,
}) => {
  // If not visible or draft/archived, do not render publicly
  if (!section.visible || section.status !== 'published') {
    return null;
  }

  // Route by specific slug or section_type
  switch (section.slug) {
    case 'hero':
      return profile ? <Hero profile={profile} /> : null;

    case 'about':
      return about ? <About about={about} /> : null;

    case 'skills':
      return skills.length > 0 ? <Skills skills={skills} /> : null;

    case 'projects':
      return projects.length > 0 ? <Projects projects={projects} /> : null;

    case 'cad-cae':
      return cadCae.length > 0 ? <CadCae entries={cadCae} /> : null;

    case 'plc':
      return plc.length > 0 ? <PlcAutomation entries={plc} /> : null;

    case 'certifications':
      return certs.length > 0 ? <Certifications certifications={certs} /> : null;

    case 'ai-engineering':
      return aiEng.length > 0 ? <AiEngineering entries={aiEng} /> : null;

    case 'articles':
      return articles.length > 0 ? <Articles articles={articles} /> : null;

    case 'research':
      return research.length > 0 ? <Research entries={research} /> : null;

    case 'resume':
      return profile ? <Resume profile={profile} /> : null;

    case 'connections':
      return connections.length > 0 ? <Connections connections={connections} /> : null;

    case 'contact':
      return <Contact />;

    case 'qr-code':
    case 'qr':
      return <QrCodeSection />;

    default:
      // Handle custom section types or any admin-created sections
      switch (section.section_type) {
        case 'projects':
          return projects.length > 0 ? <Projects projects={projects} /> : null;
        case 'cad_cae':
          return cadCae.length > 0 ? <CadCae entries={cadCae} /> : null;
        case 'plc':
          return plc.length > 0 ? <PlcAutomation entries={plc} /> : null;
        case 'certifications':
          return certs.length > 0 ? <Certifications certifications={certs} /> : null;
        case 'ai_engineering':
          return aiEng.length > 0 ? <AiEngineering entries={aiEng} /> : null;
        case 'articles':
          return articles.length > 0 ? <Articles articles={articles} /> : null;
        case 'research':
          return research.length > 0 ? <Research entries={research} /> : null;
        case 'connections':
          return connections.length > 0 ? <Connections connections={connections} /> : null;
        case 'contact':
          return <Contact />;
        default:
          return <DynamicCustomSection section={section} />;
      }
  }
};
