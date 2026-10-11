// ==============================================================================
// ADITHYA MECHNEXUS V18.0 — DATABASE TYPES (ZERO SCHEMA DRIFT)
// Matches PostgreSQL schema exactly.
// ==============================================================================

export type AdminRole = 'admin' | 'super_admin';

export interface AdminUser {
  id: string;
  user_id: string;
  role: AdminRole;
  email: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  title: string;
  tagline: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  logo_url: string | null;
  resume_url: string | null;
  resume_version: string | null;
  resume_updated_at: string | null;
  education_institution?: string | null;
  education_department?: string | null;
  education_degree?: string | null;
  education_year?: string | null;
  career_goals?: string | null;
  avatar_alt_text?: string | null;
  hero_cta_primary_label?: string | null;
  hero_cta_primary_url?: string | null;
  hero_cta_secondary_label?: string | null;
  hero_cta_secondary_url?: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  og_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface About {
  id: string;
  content: string;
  engineering_interests: string[];
  technical_direction: string | null;
  design_philosophy: string | null;
  engineering_approach: string | null;
  learning_direction: string | null;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string | null;
  level: SkillLevel;
  tools: string[];
  icon: string | null;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'planned' | 'in_progress' | 'completed' | 'published';

export interface ProjectExternalLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  problem_statement: string | null;
  objective: string | null;
  methodology: string | null;
  engineering_approach: string | null;
  tools_software: string[];
  materials: string[];
  parameters: Record<string, any>;
  results: string | null;
  learning_outcome: string | null;
  status: ProjectStatus;
  category: string;
  tags: string[];
  thumbnail_url: string | null;
  date: string | null;
  external_links: ProjectExternalLink[];
  featured: boolean;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type MediaType = 'image' | 'video' | 'document' | 'report';

export interface ProjectMedia {
  id: string;
  project_id: string;
  type: MediaType;
  url: string;
  storage_path: string | null;
  caption: string | null;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type ResearchStatus = 'planned' | 'ongoing' | 'completed' | 'published';

export interface Research {
  id: string;
  title: string;
  slug: string;
  abstract: string | null;
  objective: string | null;
  methodology: string | null;
  materials: string | null;
  experimental_setup: string | null;
  results: string | null;
  analysis: string | null;
  conclusion: string | null;
  status: ResearchStatus;
  publication_info: Record<string, any>;
  references: string[];
  tags: string[];
  thumbnail_url: string | null;
  featured: boolean;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResearchMedia {
  id: string;
  research_id: string;
  type: MediaType;
  url: string;
  storage_path: string | null;
  caption: string | null;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type CadCaeType = 'cad_modeling' | 'fea' | 'cfd' | 'thermal' | 'meshing' | 'other';

export interface CadCae {
  id: string;
  title: string;
  slug: string;
  type: CadCaeType;
  description: string | null;
  boundary_conditions: string | null;
  materials: string | null;
  solver: string | null;
  simulation_parameters: Record<string, any>;
  mesh_details: Record<string, any>;
  results: string | null;
  tools_software: string[];
  tags: string[];
  thumbnail_url: string | null;
  featured: boolean;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CadCaeMedia {
  id: string;
  cad_cae_id: string;
  type: MediaType;
  url: string;
  storage_path: string | null;
  caption: string | null;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type ProgrammingType = 'ladder_logic' | 'structured_text' | 'function_block' | 'sfc' | 'other';

export interface PlcAutomation {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  controller: string | null;
  programming_type: ProgrammingType;
  inputs: string[];
  outputs: string[];
  logic_description: string | null;
  sequence_description: string | null;
  hardware: string[];
  software: string[];
  simulation_details: string | null;
  results: string | null;
  tags: string[];
  thumbnail_url: string | null;
  featured: boolean;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlcMedia {
  id: string;
  plc_id: string;
  type: MediaType;
  url: string;
  storage_path: string | null;
  caption: string | null;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  credential_id: string | null;
  date: string | null;
  description: string | null;
  certificate_image_url: string | null;
  certificate_pdf_url: string | null;
  verification_url: string | null;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type AiApplicationType = 
  | 'surrogate_modeling' 
  | 'optimization' 
  | 'generative' 
  | 'automation' 
  | 'data_analysis' 
  | 'cad_automation' 
  | 'simulation_assistance' 
  | 'other';

export interface AiEngineering {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  application_type: AiApplicationType;
  methodology: string | null;
  tools_software: string[];
  results: string | null;
  tags: string[];
  thumbnail_url: string | null;
  featured: boolean;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface AiEngineeringMedia {
  id: string;
  ai_engineering_id: string;
  type: MediaType;
  url: string;
  storage_path: string | null;
  caption: string | null;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export type ArticleStatus = 'draft' | 'published';

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  tags: string[];
  cover_image_url: string | null;
  author: string;
  reading_time: number;
  status: ArticleStatus;
  published_at: string | null;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: string;
  name: string;
  url: string | null;
  description: string | null;
  icon: string | null;
  display_order: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  archived: boolean;
  created_at: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  display_order: number;
  enabled: boolean;
  section_id?: string | null;
  is_external?: boolean;
  open_in_new_tab?: boolean;
  created_at: string;
  updated_at: string;
}

export type SectionType =
  | 'text'
  | 'projects'
  | 'gallery'
  | 'cad_cae'
  | 'research'
  | 'certifications'
  | 'skills'
  | 'articles'
  | 'timeline'
  | 'media'
  | 'custom_cards'
  | 'contact'
  | 'plc'
  | 'ai_engineering'
  | 'connections';

export type SectionLayout =
  | 'grid_cards'
  | 'list'
  | 'split_two_col'
  | 'carousel'
  | 'masonry'
  | 'timeline';

export type SectionStatus = 'draft' | 'published' | 'archived';

export type AccentThemeToken = 'cyan' | 'blue' | 'violet' | 'emerald' | 'amber' | 'steel';

export interface PortfolioSection {
  id: string;
  slug: string;
  title: string;
  nav_label: string;
  description: string | null;
  content: string | null;
  section_type: SectionType;
  layout: SectionLayout;
  icon: string;
  accent_theme: AccentThemeToken;
  cover_image_url: string | null;
  content_schema: Record<string, any>;
  seo_title: string | null;
  seo_description: string | null;
  status: SectionStatus;
  visible: boolean;
  in_navigation: boolean;
  display_order: number;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortfolioContentItem {
  id: string;
  section_id: string;
  title: string;
  subtitle: string | null;
  slug: string | null;
  body: string | null;
  metadata: Record<string, any>;
  media_url: string | null;
  media_type: 'image' | 'video' | 'document' | 'audio' | 'embed';
  display_order: number;
  status: SectionStatus;
  enabled: boolean;
  visible?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SectionVisibility {
  id: string;
  section_key: string;
  label: string;
  visible: boolean;
  display_order: number;
  updated_at: string;
}

export interface PortfolioSetting {
  id: string;
  key: string;
  value: Record<string, any>;
  description: string | null;
  updated_at: string;
}

export interface VisualizationSetting {
  id: string;
  particle_count: number;
  particle_speed: number;
  geometry_count: number;
  color_scheme: string;
  interaction_intensity: number;
  quality: 'low' | 'medium' | 'high' | 'auto';
  mobile_particle_count: number;
  enabled: boolean;
  updated_at: string;
}
