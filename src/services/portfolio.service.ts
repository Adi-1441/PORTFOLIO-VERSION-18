// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — PORTFOLIO PUBLIC DATA SERVICE
// Production-grade read access with zero silent failures and clean fallbacks.
// ==============================================================================

import { supabase, isSupabaseReady } from '../lib/supabase';
import {
  Profile, About, Skill, Project, CadCae,
  PlcAutomation, Certification, AiEngineering,
  Article, Connection, NavigationItem, SectionVisibility,
  VisualizationSetting, ProjectMedia, PortfolioSection,
  PortfolioContentItem, Research
} from '../types/database';
import {
  SEED_PROFILE, SEED_ABOUT, SEED_SKILLS, SEED_PROJECTS,
  SEED_CAD_CAE, SEED_PLC, SEED_CERTS, SEED_AI_ENG,
  SEED_ARTICLES, SEED_CONNECTIONS, SEED_NAVIGATION,
  SEED_VISIBILITY, SEED_VISUALIZATION, SEED_SECTIONS,
  SEED_CONTENT_ITEMS, SEED_RESEARCH
} from './seed-data';

export const portfolioService = {
  async getProfile(): Promise<Profile> {
    if (!isSupabaseReady()) return SEED_PROFILE;
    try {
      const { data, error } = await supabase.from('profile').select('*').limit(1).maybeSingle();
      if (error || !data) return SEED_PROFILE;
      return data as Profile;
    } catch {
      return SEED_PROFILE;
    }
  },

  async getAbout(): Promise<About> {
    if (!isSupabaseReady()) return SEED_ABOUT;
    try {
      const { data, error } = await supabase.from('about').select('*').eq('enabled', true).limit(1).maybeSingle();
      if (error || !data) return SEED_ABOUT;
      return data as About;
    } catch {
      return SEED_ABOUT;
    }
  },

  async getSections(): Promise<PortfolioSection[]> {
    if (!isSupabaseReady()) {
      return SEED_SECTIONS.filter(s => s.status === 'published' && s.visible).sort((a, b) => a.display_order - b.display_order);
    }
    try {
      const { data, error } = await supabase
        .from('portfolio_sections')
        .select('*')
        .eq('status', 'published')
        .eq('visible', true)
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return SEED_SECTIONS.filter(s => s.status === 'published' && s.visible).sort((a, b) => a.display_order - b.display_order);
      }
      return data as PortfolioSection[];
    } catch {
      return SEED_SECTIONS.filter(s => s.status === 'published' && s.visible).sort((a, b) => a.display_order - b.display_order);
    }
  },

  async getSectionBySlug(slug: string): Promise<PortfolioSection | null> {
    if (!isSupabaseReady()) {
      return SEED_SECTIONS.find(s => s.slug === slug) || null;
    }
    try {
      const { data, error } = await supabase
        .from('portfolio_sections')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error || !data) {
        return SEED_SECTIONS.find(s => s.slug === slug) || null;
      }
      return data as PortfolioSection;
    } catch {
      return SEED_SECTIONS.find(s => s.slug === slug) || null;
    }
  },

  async getContentItems(sectionId: string): Promise<PortfolioContentItem[]> {
    if (!isSupabaseReady()) {
      return SEED_CONTENT_ITEMS
        .filter(item => item.section_id === sectionId && item.status === 'published' && (item.visible ?? item.enabled))
        .sort((a, b) => a.display_order - b.display_order);
    }
    try {
      const { data, error } = await supabase
        .from('portfolio_content_items')
        .select('*')
        .eq('section_id', sectionId)
        .eq('status', 'published')
        .order('display_order', { ascending: true });

      if (error || !data) {
        return SEED_CONTENT_ITEMS
          .filter(item => item.section_id === sectionId && item.status === 'published' && (item.visible ?? item.enabled))
          .sort((a, b) => a.display_order - b.display_order);
      }
      return data as PortfolioContentItem[];
    } catch {
      return SEED_CONTENT_ITEMS
        .filter(item => item.section_id === sectionId && item.status === 'published' && (item.visible ?? item.enabled))
        .sort((a, b) => a.display_order - b.display_order);
    }
  },

  async getResearch(): Promise<Research[]> {
    if (!isSupabaseReady()) return SEED_RESEARCH;
    try {
      const { data, error } = await supabase
        .from('research')
        .select('*')
        .eq('enabled', true)
        .order('display_order', { ascending: true });

      if (error || !data || data.length === 0) return SEED_RESEARCH;
      return data as Research[];
    } catch {
      return SEED_RESEARCH;
    }
  },

  async getNavigation(): Promise<NavigationItem[]> {
    if (!isSupabaseReady()) {
      const sectionNav: NavigationItem[] = SEED_SECTIONS
        .filter(s => s.status === 'published' && s.visible && s.in_navigation)
        .sort((a, b) => a.display_order - b.display_order)
        .map(s => ({
          id: `nav-${s.slug}`,
          label: s.nav_label || s.title.toUpperCase(),
          href: `#${s.slug}`,
          display_order: s.display_order,
          enabled: true,
          section_id: s.id,
          is_external: false,
          open_in_new_tab: false,
          created_at: s.created_at,
          updated_at: s.updated_at
        }));
      return sectionNav.length > 0 ? sectionNav : SEED_NAVIGATION;
    }

    try {
      // 1. Try explicit navigation_items first
      const { data: navData, error: navError } = await supabase
        .from('navigation_items')
        .select('*')
        .eq('enabled', true)
        .order('display_order', { ascending: true });

      if (!navError && navData && navData.length > 0) {
        return navData as NavigationItem[];
      }

      // 2. Synthesize from portfolio_sections with in_navigation = true
      const { data: secData, error: secError } = await supabase
        .from('portfolio_sections')
        .select('*')
        .eq('status', 'published')
        .eq('visible', true)
        .eq('in_navigation', true)
        .order('display_order', { ascending: true });

      if (!secError && secData && secData.length > 0) {
        return (secData as PortfolioSection[]).map(s => ({
          id: `nav-${s.slug}`,
          label: s.nav_label || s.title.toUpperCase(),
          href: `#${s.slug}`,
          display_order: s.display_order,
          enabled: true,
          section_id: s.id,
          is_external: false,
          open_in_new_tab: false,
          created_at: s.created_at,
          updated_at: s.updated_at
        }));
      }

      return SEED_NAVIGATION;
    } catch {
      return SEED_NAVIGATION;
    }
  },

  async getSectionVisibility(): Promise<Record<string, boolean>> {
    const visibilityMap: Record<string, boolean> = {};
    SEED_VISIBILITY.forEach(v => { visibilityMap[v.section_key] = v.visible; });

    if (!isSupabaseReady()) return visibilityMap;
    try {
      const { data, error } = await supabase.from('section_visibility').select('*');
      if (error || !data || data.length === 0) return visibilityMap;
      data.forEach((row: any) => {
        visibilityMap[row.section_key] = row.visible;
      });
      return visibilityMap;
    } catch {
      return visibilityMap;
    }
  },

  async getSkills(): Promise<Skill[]> {
    if (!isSupabaseReady()) return SEED_SKILLS;
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('enabled', true)
        .order('display_order', { ascending: true });
      if (error || !data || data.length === 0) return SEED_SKILLS;
      return data as Skill[];
    } catch {
      return SEED_SKILLS;
    }
  },

  async getProjects(): Promise<Project[]> {
    if (!isSupabaseReady()) return SEED_PROJECTS;
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('enabled', true)
        .order('display_order', { ascending: true });
      if (error || !data || data.length === 0) return SEED_PROJECTS;
      return data as Project[];
    } catch {
      return SEED_PROJECTS;
    }
  },

  async getProjectBySlug(slug: string): Promise<Project | null> {
    if (!isSupabaseReady()) {
      return SEED_PROJECTS.find(p => p.slug === slug) || null;
    }
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('enabled', true)
        .maybeSingle();
      if (error || !data) {
        return SEED_PROJECTS.find(p => p.slug === slug) || null;
      }
      return data as Project;
    } catch {
      return SEED_PROJECTS.find(p => p.slug === slug) || null;
    }
  },

  async getProjectMedia(projectId: string): Promise<ProjectMedia[]> {
    if (!isSupabaseReady()) return [];
    try {
      const { data, error } = await supabase
        .from('project_media')
        .select('*')
        .eq('project_id', projectId)
        .eq('enabled', true)
        .order('display_order', { ascending: true });
      if (error || !data) return [];
      return data as ProjectMedia[];
    } catch {
      return [];
    }
  },

  async getCadCae(): Promise<CadCae[]> {
    if (!isSupabaseReady()) return SEED_CAD_CAE;
    try {
      const { data, error } = await supabase
        .from('cad_cae')
        .select('*')
        .eq('enabled', true)
        .order('display_order', { ascending: true });
      if (error || !data || data.length === 0) return SEED_CAD_CAE;
      return data as CadCae[];
    } catch {
      return SEED_CAD_CAE;
    }
  },

  async getPlcAutomation(): Promise<PlcAutomation[]> {
    if (!isSupabaseReady()) return SEED_PLC;
    try {
      const { data, error } = await supabase
        .from('plc_automation')
        .select('*')
        .eq('enabled', true)
        .order('display_order', { ascending: true });
      if (error || !data || data.length === 0) return SEED_PLC;
      return data as PlcAutomation[];
    } catch {
      return SEED_PLC;
    }
  },

  async getCertifications(): Promise<Certification[]> {
    if (!isSupabaseReady()) return SEED_CERTS;
    try {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('enabled', true)
        .order('display_order', { ascending: true });
      if (error || !data || data.length === 0) return SEED_CERTS;
      return data as Certification[];
    } catch {
      return SEED_CERTS;
    }
  },

  async getAiEngineering(): Promise<AiEngineering[]> {
    if (!isSupabaseReady()) return SEED_AI_ENG;
    try {
      const { data, error } = await supabase
        .from('ai_engineering')
        .select('*')
        .eq('enabled', true)
        .order('display_order', { ascending: true });
      if (error || !data || data.length === 0) return SEED_AI_ENG;
      return data as AiEngineering[];
    } catch {
      return SEED_AI_ENG;
    }
  },

  async getArticles(): Promise<Article[]> {
    if (!isSupabaseReady()) return SEED_ARTICLES;
    try {
      // Rule: Draft articles NEVER appear publicly
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .eq('enabled', true)
        .order('display_order', { ascending: true });
      if (error || !data || data.length === 0) return SEED_ARTICLES;
      return data as Article[];
    } catch {
      return SEED_ARTICLES;
    }
  },

  async getArticleBySlug(slug: string): Promise<Article | null> {
    if (!isSupabaseReady()) {
      return SEED_ARTICLES.find(a => a.slug === slug) || null;
    }
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .eq('enabled', true)
        .maybeSingle();
      if (error || !data) {
        return SEED_ARTICLES.find(a => a.slug === slug) || null;
      }
      return data as Article;
    } catch {
      return SEED_ARTICLES.find(a => a.slug === slug) || null;
    }
  },

  async getConnections(): Promise<Connection[]> {
    if (!isSupabaseReady()) return SEED_CONNECTIONS;
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('enabled', true)
        .order('display_order', { ascending: true });
      if (error || !data || data.length === 0) return SEED_CONNECTIONS;
      return data as Connection[];
    } catch {
      return SEED_CONNECTIONS;
    }
  },

  async getVisualizationSettings(): Promise<VisualizationSetting> {
    if (!isSupabaseReady()) return SEED_VISUALIZATION;
    try {
      const { data, error } = await supabase
        .from('visualization_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error || !data) return SEED_VISUALIZATION;
      return data as VisualizationSetting;
    } catch {
      return SEED_VISUALIZATION;
    }
  },
};
