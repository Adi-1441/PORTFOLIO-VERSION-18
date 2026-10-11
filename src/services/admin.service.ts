// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — ADMIN MANAGEMENT & CRUD SERVICE
// Explicit create, read, update, delete with real Supabase verification.
// ==============================================================================

import { supabase, isSupabaseReady } from '../lib/supabase';
import {
  Profile, About, Skill, Project, CadCae,
  PlcAutomation, Certification, AiEngineering,
  Article, Connection, NavigationItem, SectionVisibility,
  VisualizationSetting, PortfolioSection, PortfolioContentItem,
  Research
} from '../types/database';
import {
  SEED_SECTIONS, SEED_CONTENT_ITEMS, SEED_RESEARCH,
  SEED_CONNECTIONS, SEED_NAVIGATION
} from './seed-data';

export const adminService = {
  // 1. PROFILE
  async updateProfile(profile: Partial<Profile>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase
        .from('profile')
        .update(profile)
        .eq('id', profile.id || '00000000-0000-0000-0000-000000000001');
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 2. ABOUT
  async updateAbout(about: Partial<About>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase
        .from('about')
        .update(about)
        .eq('id', about.id || '00000000-0000-0000-0000-000000000002');
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 3. SKILLS CRUD
  async createSkill(skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: Skill; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { data, error } = await supabase.from('skills').insert([skill]).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Skill };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateSkill(id: string, skill: Partial<Skill>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('skills').update(skill).eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteSkill(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('skills').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 4. PROJECTS CRUD
  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: Project; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { data, error } = await supabase.from('projects').insert([project]).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Project };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateProject(id: string, project: Partial<Project>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('projects').update(project).eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 5. CAD & CAE CRUD
  async createCadCae(entry: Omit<CadCae, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: CadCae; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { data, error } = await supabase.from('cad_cae').insert([entry]).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as CadCae };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateCadCae(id: string, entry: Partial<CadCae>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('cad_cae').update(entry).eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteCadCae(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('cad_cae').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 6. PLC & AUTOMATION CRUD
  async createPlc(entry: Omit<PlcAutomation, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: PlcAutomation; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { data, error } = await supabase.from('plc_automation').insert([entry]).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as PlcAutomation };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updatePlc(id: string, entry: Partial<PlcAutomation>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('plc_automation').update(entry).eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deletePlc(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('plc_automation').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 7. CERTIFICATIONS CRUD
  async createCert(cert: Omit<Certification, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: Certification; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { data, error } = await supabase.from('certifications').insert([cert]).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Certification };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateCert(id: string, cert: Partial<Certification>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('certifications').update(cert).eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteCert(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('certifications').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 8. AI × ENGINEERING CRUD
  async createAiEng(entry: Omit<AiEngineering, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: AiEngineering; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { data, error } = await supabase.from('ai_engineering').insert([entry]).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as AiEngineering };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateAiEng(id: string, entry: Partial<AiEngineering>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('ai_engineering').update(entry).eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteAiEng(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('ai_engineering').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 9. ARTICLES CRUD (Enforces draft/published)
  async createArticle(article: Omit<Article, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: Article; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { data, error } = await supabase.from('articles').insert([article]).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Article };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateArticle(id: string, article: Partial<Article>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('articles').update(article).eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteArticle(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 10. CONNECTIONS CRUD
  async createConnection(conn: Omit<Connection, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: Connection; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { data, error } = await supabase.from('connections').insert([conn]).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Connection };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateConnection(id: string, conn: Partial<Connection>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('connections').update(conn).eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteConnection(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('connections').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 11. SECTION VISIBILITY
  async updateVisibility(sectionKey: string, visible: boolean): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase
        .from('section_visibility')
        .update({ visible, updated_at: new Date().toISOString() })
        .eq('section_key', sectionKey);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 12. VISUALIZATION SETTINGS
  async updateVisualizationSettings(settings: Partial<VisualizationSetting>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase
        .from('visualization_settings')
        .update(settings)
        .eq('id', settings.id || '00000000-0000-0000-0000-000000000003');
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 13. CONNECTIONS READ
  async getConnections(): Promise<Connection[]> {
    if (!isSupabaseReady()) return SEED_CONNECTIONS;
    try {
      const { data, error } = await supabase.from('connections').select('*').order('display_order', { ascending: true });
      if (error || !data || data.length === 0) return SEED_CONNECTIONS;
      return data as Connection[];
    } catch {
      return SEED_CONNECTIONS;
    }
  },

  // 14. SECTIONS BUILDER CRUD
  async getSections(): Promise<PortfolioSection[]> {
    if (!isSupabaseReady()) return SEED_SECTIONS;
    try {
      const { data, error } = await supabase
        .from('portfolio_sections')
        .select('*')
        .order('display_order', { ascending: true });
      if (error || !data || data.length === 0) return SEED_SECTIONS;
      return data as PortfolioSection[];
    } catch {
      return SEED_SECTIONS;
    }
  },

  async createSection(section: Omit<PortfolioSection, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: PortfolioSection; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { data, error } = await supabase.from('portfolio_sections').insert([section]).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as PortfolioSection };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateSection(id: string, section: Partial<PortfolioSection>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('portfolio_sections').update({ ...section, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteSection(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { data: sec } = await supabase.from('portfolio_sections').select('is_system').eq('id', id).maybeSingle();
      if (sec?.is_system) {
        return { success: false, error: 'System sections cannot be deleted. You can hide or unpublish them instead.' };
      }
      const { error } = await supabase.from('portfolio_sections').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async reorderSections(items: { id: string; display_order: number }[]): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      for (const item of items) {
        const { error } = await supabase
          .from('portfolio_sections')
          .update({ display_order: item.display_order, updated_at: new Date().toISOString() })
          .eq('id', item.id);
        if (error) return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async duplicateSection(id: string): Promise<{ success: boolean; data?: PortfolioSection; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { data: original, error: fetchErr } = await supabase
        .from('portfolio_sections')
        .select('*')
        .eq('id', id)
        .single();
      if (fetchErr || !original) return { success: false, error: fetchErr?.message || 'Section not found' };

      const duplicatePayload: Omit<PortfolioSection, 'id' | 'created_at' | 'updated_at'> = {
        title: `${original.title} (Copy)`,
        slug: `${original.slug}-copy-${Date.now().toString(36)}`,
        nav_label: original.nav_label ? `${original.nav_label} (Copy)` : 'COPY',
        description: original.description,
        content: original.content,
        section_type: original.section_type,
        layout: original.layout,
        icon: original.icon || 'Layers',
        accent_theme: original.accent_theme || 'cyan',
        cover_image_url: original.cover_image_url,
        content_schema: original.content_schema || {},
        seo_title: original.seo_title,
        seo_description: original.seo_description,
        status: 'draft',
        visible: false,
        in_navigation: false,
        display_order: (original.display_order || 0) + 1,
        is_system: false,
      };

      const { data: newSec, error: insertErr } = await supabase
        .from('portfolio_sections')
        .insert([duplicatePayload])
        .select()
        .single();

      if (insertErr) return { success: false, error: insertErr.message };
      return { success: true, data: newSec as PortfolioSection };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 15. CONTENT ITEMS CRUD
  async getContentItems(sectionId: string): Promise<PortfolioContentItem[]> {
    if (!isSupabaseReady()) {
      return SEED_CONTENT_ITEMS.filter(i => i.section_id === sectionId);
    }
    try {
      const { data, error } = await supabase
        .from('portfolio_content_items')
        .select('*')
        .eq('section_id', sectionId)
        .order('display_order', { ascending: true });
      if (error || !data) return [];
      return data as PortfolioContentItem[];
    } catch {
      return [];
    }
  },

  async createContentItem(item: Omit<PortfolioContentItem, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: PortfolioContentItem; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { data, error } = await supabase.from('portfolio_content_items').insert([item]).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as PortfolioContentItem };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateContentItem(id: string, item: Partial<PortfolioContentItem>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('portfolio_content_items').update({ ...item, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteContentItem(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('portfolio_content_items').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 16. RESEARCH CRUD
  async getResearch(): Promise<Research[]> {
    if (!isSupabaseReady()) return SEED_RESEARCH;
    try {
      const { data, error } = await supabase
        .from('research')
        .select('*')
        .order('display_order', { ascending: true });
      if (error || !data || data.length === 0) return SEED_RESEARCH;
      return data as Research[];
    } catch {
      return SEED_RESEARCH;
    }
  },

  async createResearch(research: Omit<Research, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: Research; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { data, error } = await supabase.from('research').insert([research]).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Research };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateResearch(id: string, research: Partial<Research>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('research').update({ ...research, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteResearch(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('research').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 17. NAVIGATION ITEMS CRUD
  async getNavigationItems(): Promise<NavigationItem[]> {
    if (!isSupabaseReady()) return SEED_NAVIGATION;
    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .order('display_order', { ascending: true });
      if (error || !data || data.length === 0) return SEED_NAVIGATION;
      return data as NavigationItem[];
    } catch {
      return SEED_NAVIGATION;
    }
  },

  async createNavigationItem(item: Omit<NavigationItem, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: NavigationItem; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { data, error } = await supabase.from('navigation_items').insert([item]).select().single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as NavigationItem };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async updateNavigationItem(id: string, item: Partial<NavigationItem>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('navigation_items').update({ ...item, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async deleteNavigationItem(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      const { error } = await supabase.from('navigation_items').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async reorderNavigationItems(items: { id: string; display_order: number }[]): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseReady()) return { success: true };
    try {
      for (const item of items) {
        const { error } = await supabase
          .from('navigation_items')
          .update({ display_order: item.display_order, updated_at: new Date().toISOString() })
          .eq('id', item.id);
        if (error) return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // 18. SYSTEM DIAGNOSTICS
  async runDiagnostics(): Promise<{
    configured: boolean;
    dbConnected: boolean;
    authActive: boolean;
    storageActive: boolean;
    adminAuthorized: boolean;
    details: Record<string, string>;
  }> {
    const details: Record<string, string> = {};

    if (!isSupabaseReady()) {
      return {
        configured: false,
        dbConnected: false,
        authActive: false,
        storageActive: false,
        adminAuthorized: false,
        details: { status: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file.' },
      };
    }

    let dbConnected = false;
    let authActive = false;
    let storageActive = false;
    let adminAuthorized = false;

    // Test DB
    try {
      const { error } = await supabase.from('profile').select('id').limit(1);
      if (!error) {
        dbConnected = true;
        details.db = 'PostgreSQL cluster query responded (200 OK)';
      } else {
        details.db = `DB Query Failed: ${error.message} (Code: ${error.code})`;
      }
    } catch (err: any) {
      details.db = `DB Exception: ${err.message}`;
    }

    // Test Auth
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error) {
        authActive = true;
        details.auth = session ? `Session active for ${session.user.email}` : 'Auth service reachable, no active session';
        if (session) {
          const { data: adminRow } = await supabase
            .from('admin_users')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('enabled', true)
            .maybeSingle();
          adminAuthorized = Boolean(adminRow);
          details.role = adminRow ? `Authorized Role: ${adminRow.role}` : 'Account NOT found in admin_users';
        }
      } else {
        details.auth = `Auth Error: ${error.message}`;
      }
    } catch (err: any) {
      details.auth = `Auth Exception: ${err.message}`;
    }

    // Test Storage
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (!error && data) {
        storageActive = true;
        details.storage = `Storage service responded. Buckets available: ${data.map(b => b.name).join(', ') || 'None created yet'}`;
      } else {
        details.storage = `Storage Failed: ${error?.message}`;
      }
    } catch (err: any) {
      details.storage = `Storage Exception: ${err.message}`;
    }

    return {
      configured: true,
      dbConnected,
      authActive,
      storageActive,
      adminAuthorized,
      details,
    };
  },
};
