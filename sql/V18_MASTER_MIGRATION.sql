-- ==============================================================================
-- ADITHYA MECHNEXUS V18.3 — COMPLETE ONE-CLICK MASTER MIGRATION SCRIPT
-- Pure PostgreSQL + Supabase. Idempotent, non-destructive, repeat-safe.
-- Run this in Supabase SQL Editor to set up or update the entire V18 system.
-- ==============================================================================

-- ==============================================================================
-- STEP 1: HELPER FUNCTIONS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.calculate_article_reading_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content IS NOT NULL THEN
    NEW.reading_time = GREATEST(1, array_length(
      regexp_split_to_array(NEW.content, '\s+'), 1
    ) / 180);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- STEP 2: SCHEMA (TABLES & AUTHORIZATION FUNCTIONS)
-- ==============================================================================

-- 1. ADMIN AUTHORIZATION TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  email text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. HARDENED ADMIN VERIFICATION FUNCTION (SECURITY DEFINER with safe search_path)
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id uuid)
RETURNS boolean AS $$
BEGIN
  IF check_user_id IS NULL THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = check_user_id
      AND enabled = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 3. PROFILE & IDENTITY
CREATE TABLE IF NOT EXISTS public.profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT 'Adithya G',
  title text NOT NULL DEFAULT 'Mechanical Engineering Student',
  tagline text DEFAULT 'Mechanical Design • CAD/CAE • FEA • CFD • Thermal • Robotics & PLC • AI × Engineering',
  bio text DEFAULT 'Dedicated Mechanical Engineering student with hands-on expertise in finite element analysis, computational fluid dynamics, parametric 3D CAD modeling, industrial automation logic, and machine intelligence integrations for engineering systems.',
  email text DEFAULT 'adithya@mechnexus.engineering',
  phone text,
  location text DEFAULT 'India',
  avatar_url text,
  logo_url text,
  resume_url text,
  resume_version text DEFAULT 'V18.0',
  resume_updated_at timestamptz DEFAULT now(),
  seo_title text DEFAULT 'ADITHYA MECHNEXUS | Mechanical Engineering Digital Laboratory',
  seo_description text DEFAULT 'Official mechanical engineering portfolio of Adithya G — CAD/CAE, FEA, CFD, PLC Industrial Automation, and AI × Engineering.',
  seo_keywords text[] DEFAULT ARRAY['Mechanical Engineering', 'CAD', 'CAE', 'FEA', 'CFD', 'Thermal Analysis', 'PLC Automation', 'Robotics', 'AI Engineering', 'Adithya G', 'MECHNEXUS'],
  og_image_url text,
  education_institution text DEFAULT 'BMS Institute of Technology & Management',
  education_department text DEFAULT 'Department of Mechanical Engineering',
  education_degree text DEFAULT 'Bachelor of Engineering (B.E.)',
  education_year text DEFAULT '2022 - 2026',
  career_goals text DEFAULT 'Pursuing advanced research and design roles in mechanical multi-physics simulation, closed-loop industrial automation, and AI-accelerated generative CAD.',
  avatar_alt_text text DEFAULT 'Adithya G - Mechanical Engineering Student',
  hero_cta_primary_label text DEFAULT 'EXPLORE RESEARCH',
  hero_cta_primary_url text DEFAULT '#projects',
  hero_cta_secondary_label text DEFAULT 'CONTACT LABORATORY',
  hero_cta_secondary_url text DEFAULT '#contact',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure extended profile columns exist if table was created in an earlier migration
ALTER TABLE public.profile
  ADD COLUMN IF NOT EXISTS education_institution text DEFAULT 'BMS Institute of Technology & Management',
  ADD COLUMN IF NOT EXISTS education_department text DEFAULT 'Department of Mechanical Engineering',
  ADD COLUMN IF NOT EXISTS education_degree text DEFAULT 'Bachelor of Engineering (B.E.)',
  ADD COLUMN IF NOT EXISTS education_year text DEFAULT '2022 - 2026',
  ADD COLUMN IF NOT EXISTS career_goals text DEFAULT 'Pursuing advanced research and design roles in mechanical multi-physics simulation, closed-loop industrial automation, and AI-accelerated generative CAD.',
  ADD COLUMN IF NOT EXISTS avatar_alt_text text DEFAULT 'Adithya G - Mechanical Engineering Student',
  ADD COLUMN IF NOT EXISTS hero_cta_primary_label text DEFAULT 'EXPLORE RESEARCH',
  ADD COLUMN IF NOT EXISTS hero_cta_primary_url text DEFAULT '#projects',
  ADD COLUMN IF NOT EXISTS hero_cta_secondary_label text DEFAULT 'CONTACT LABORATORY',
  ADD COLUMN IF NOT EXISTS hero_cta_secondary_url text DEFAULT '#contact';

-- 4. ABOUT SECTION
CREATE TABLE IF NOT EXISTS public.about (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  engineering_interests text[] DEFAULT ARRAY['Finite Element Analysis (FEA)', 'Computational Fluid Dynamics (CFD)', 'Heat Transfer & Thermal Design', 'Industrial Automation & PLC', 'Kinematics & Machine Dynamics', 'AI-Assisted Engineering Optimization'],
  technical_direction text DEFAULT 'Developing high-fidelity multi-physics simulation methodologies, closed-loop industrial automation sequences, and AI-accelerated parametric design pipelines.',
  design_philosophy text DEFAULT 'Form adheres strictly to thermodynamic, mechanical, and manufacturability constraints. Precision over decoration; verification over assumption.',
  engineering_approach text DEFAULT 'Rigorous mathematical formulation followed by high-density CAD modeling, mesh-independent FEA/CFD convergence, and physical experimental validation.',
  learning_direction text DEFAULT 'Advancing from classical solid mechanics toward multi-domain digital twins, surrogate AI simulation models, and real-time PLC telemetry integration.',
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. SKILLS MATRIX
CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  description text,
  level text DEFAULT 'advanced' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  tools text[] DEFAULT ARRAY[]::text[],
  icon text DEFAULT 'Cpu',
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text,
  full_description text,
  problem_statement text,
  objective text,
  methodology text,
  engineering_approach text,
  tools_software text[] DEFAULT ARRAY[]::text[],
  materials text[] DEFAULT ARRAY[]::text[],
  parameters jsonb DEFAULT '{}'::jsonb,
  results text,
  learning_outcome text,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('planned', 'in_progress', 'completed', 'published')),
  category text NOT NULL DEFAULT 'MECHANICAL DESIGN',
  tags text[] DEFAULT ARRAY[]::text[],
  thumbnail_url text,
  date date,
  external_links jsonb DEFAULT '[]'::jsonb,
  featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. PROJECT MEDIA
CREATE TABLE IF NOT EXISTS public.project_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('image', 'video', 'document')),
  url text NOT NULL,
  storage_path text,
  caption text,
  alt_text text,
  is_primary boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. RESEARCH & PUBLICATIONS
CREATE TABLE IF NOT EXISTS public.research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  abstract text,
  objective text,
  methodology text,
  materials text,
  experimental_setup text,
  results text,
  analysis text,
  conclusion text,
  status text NOT NULL DEFAULT 'ongoing' CHECK (status IN ('planned', 'ongoing', 'completed', 'published')),
  publication_info jsonb DEFAULT '{}'::jsonb,
  "references" text[] DEFAULT ARRAY[]::text[],
  tags text[] DEFAULT ARRAY[]::text[],
  thumbnail_url text,
  featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure "references" column exists if table was created in an earlier migration
ALTER TABLE public.research
  ADD COLUMN IF NOT EXISTS "references" text[] DEFAULT ARRAY[]::text[];


-- 9. RESEARCH MEDIA
CREATE TABLE IF NOT EXISTS public.research_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id uuid NOT NULL REFERENCES public.research(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('image', 'video', 'document')),
  url text NOT NULL,
  storage_path text,
  caption text,
  alt_text text,
  is_primary boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 10. CAD & CAE SIMULATIONS
CREATE TABLE IF NOT EXISTS public.cad_cae (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'fea' CHECK (type IN ('cad_modeling', 'fea', 'cfd', 'thermal', 'meshing', 'other')),
  description text,
  boundary_conditions text,
  materials text,
  solver text,
  simulation_parameters jsonb DEFAULT '{}'::jsonb,
  mesh_details jsonb DEFAULT '{}'::jsonb,
  results text,
  tools_software text[] DEFAULT ARRAY[]::text[],
  tags text[] DEFAULT ARRAY[]::text[],
  thumbnail_url text,
  featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 11. CAD & CAE MEDIA
CREATE TABLE IF NOT EXISTS public.cad_cae_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cad_cae_id uuid NOT NULL REFERENCES public.cad_cae(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('image', 'video', 'document', 'report')),
  url text NOT NULL,
  storage_path text,
  caption text,
  alt_text text,
  is_primary boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 12. PLC & INDUSTRIAL AUTOMATION
CREATE TABLE IF NOT EXISTS public.plc_automation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  controller text,
  programming_type text NOT NULL DEFAULT 'ladder_logic' CHECK (programming_type IN ('ladder_logic', 'structured_text', 'function_block', 'sfc', 'other')),
  inputs text[] DEFAULT ARRAY[]::text[],
  outputs text[] DEFAULT ARRAY[]::text[],
  logic_description text,
  sequence_description text,
  hardware text[] DEFAULT ARRAY[]::text[],
  software text[] DEFAULT ARRAY[]::text[],
  simulation_details text,
  results text,
  tags text[] DEFAULT ARRAY[]::text[],
  thumbnail_url text,
  featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 13. PLC MEDIA
CREATE TABLE IF NOT EXISTS public.plc_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plc_id uuid NOT NULL REFERENCES public.plc_automation(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('image', 'video', 'document')),
  url text NOT NULL,
  storage_path text,
  caption text,
  alt_text text,
  is_primary boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 14. CERTIFICATIONS
CREATE TABLE IF NOT EXISTS public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issuer text NOT NULL,
  credential_id text,
  date date,
  description text,
  certificate_image_url text,
  certificate_pdf_url text,
  verification_url text,
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 15. AI × ENGINEERING
CREATE TABLE IF NOT EXISTS public.ai_engineering (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  application_type text NOT NULL DEFAULT 'surrogate_modeling' CHECK (application_type IN (
    'surrogate_modeling', 'optimization', 'generative',
    'automation', 'data_analysis', 'cad_automation',
    'simulation_assistance', 'other'
  )),
  methodology text,
  tools_software text[] DEFAULT ARRAY[]::text[],
  results text,
  tags text[] DEFAULT ARRAY[]::text[],
  thumbnail_url text,
  featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 16. AI × ENGINEERING MEDIA
CREATE TABLE IF NOT EXISTS public.ai_engineering_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_engineering_id uuid NOT NULL REFERENCES public.ai_engineering(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('image', 'video', 'document')),
  url text NOT NULL,
  storage_path text,
  caption text,
  alt_text text,
  is_primary boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 17. ARTICLES & TECHNICAL DOSSIERS
CREATE TABLE IF NOT EXISTS public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'ENGINEERING ANALYSIS',
  tags text[] DEFAULT ARRAY[]::text[],
  cover_image_url text,
  author text NOT NULL DEFAULT 'Adithya G',
  reading_time integer DEFAULT 3,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 18. PROFESSIONAL CONNECTIONS
CREATE TABLE IF NOT EXISTS public.connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text,
  description text,
  icon text DEFAULT 'Link2',
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 19. CONTACT MESSAGES (Public dispatch telemetry)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 20. DYNAMIC PORTFOLIO SECTIONS (V18.3 Dynamic Section Builder)
CREATE TABLE IF NOT EXISTS public.portfolio_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  nav_label text NOT NULL,
  description text,
  content text,
  section_type text NOT NULL,
  layout text NOT NULL DEFAULT 'grid_cards',
  icon text NOT NULL DEFAULT 'Cpu',
  accent_theme text NOT NULL DEFAULT 'cyan' CHECK (accent_theme IN ('cyan', 'blue', 'violet', 'emerald', 'amber', 'steel')),
  cover_image_url text,
  content_schema jsonb DEFAULT '{}'::jsonb,
  seo_title text,
  seo_description text,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  visible boolean NOT NULL DEFAULT true,
  in_navigation boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 21. SECTION CONTENT ITEMS
CREATE TABLE IF NOT EXISTS public.portfolio_content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES public.portfolio_sections(id) ON DELETE CASCADE,
  title text NOT NULL,
  subtitle text,
  slug text,
  body text,
  metadata jsonb DEFAULT '{}'::jsonb,
  media_url text,
  media_type text DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'document', 'audio', 'embed')),
  display_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 22. NAVIGATION ITEMS
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  section_id uuid REFERENCES public.portfolio_sections(id) ON DELETE SET NULL,
  is_external boolean NOT NULL DEFAULT false,
  open_in_new_tab boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure extended navigation columns exist if table was created in an earlier migration
ALTER TABLE public.navigation_items
  ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES public.portfolio_sections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_external boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS open_in_new_tab boolean NOT NULL DEFAULT false;

-- 23. SECTION VISIBILITY SETTINGS
CREATE TABLE IF NOT EXISTS public.section_visibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  label text NOT NULL,
  visible boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 24. PORTFOLIO SETTINGS
CREATE TABLE IF NOT EXISTS public.portfolio_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 25. VISUALIZATION SETTINGS (3D Multi-physics Background)
CREATE TABLE IF NOT EXISTS public.visualization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  particle_count integer NOT NULL DEFAULT 500,
  particle_speed float NOT NULL DEFAULT 0.5,
  geometry_count integer NOT NULL DEFAULT 8,
  color_scheme text NOT NULL DEFAULT 'cyan',
  interaction_intensity float NOT NULL DEFAULT 0.5,
  quality text NOT NULL DEFAULT 'auto' CHECK (quality IN ('low', 'medium', 'high', 'auto')),
  mobile_particle_count integer NOT NULL DEFAULT 150,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================================================================
-- STEP 3: PERFORMANCE INDEXES (All 29 Core & Dynamic CMS Indexes)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_enabled ON public.admin_users(enabled);

CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_enabled ON public.skills(enabled);
CREATE INDEX IF NOT EXISTS idx_skills_order ON public.skills(display_order);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_enabled ON public.projects(enabled);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(featured);
CREATE INDEX IF NOT EXISTS idx_projects_order ON public.projects(display_order);

CREATE INDEX IF NOT EXISTS idx_project_media_project_id ON public.project_media(project_id);
CREATE INDEX IF NOT EXISTS idx_project_media_enabled ON public.project_media(enabled);
CREATE INDEX IF NOT EXISTS idx_project_media_primary ON public.project_media(is_primary);

CREATE INDEX IF NOT EXISTS idx_research_slug ON public.research(slug);
CREATE INDEX IF NOT EXISTS idx_research_enabled ON public.research(enabled);
CREATE INDEX IF NOT EXISTS idx_research_media_research_id ON public.research_media(research_id);

CREATE INDEX IF NOT EXISTS idx_cad_cae_slug ON public.cad_cae(slug);
CREATE INDEX IF NOT EXISTS idx_cad_cae_type ON public.cad_cae(type);
CREATE INDEX IF NOT EXISTS idx_cad_cae_enabled ON public.cad_cae(enabled);
CREATE INDEX IF NOT EXISTS idx_cad_cae_media_cad_id ON public.cad_cae_media(cad_cae_id);

CREATE INDEX IF NOT EXISTS idx_plc_automation_slug ON public.plc_automation(slug);
CREATE INDEX IF NOT EXISTS idx_plc_automation_enabled ON public.plc_automation(enabled);
CREATE INDEX IF NOT EXISTS idx_plc_media_plc_id ON public.plc_media(plc_id);

CREATE INDEX IF NOT EXISTS idx_certifications_enabled ON public.certifications(enabled);
CREATE INDEX IF NOT EXISTS idx_certifications_order ON public.certifications(display_order);

CREATE INDEX IF NOT EXISTS idx_ai_engineering_slug ON public.ai_engineering(slug);
CREATE INDEX IF NOT EXISTS idx_ai_engineering_enabled ON public.ai_engineering(enabled);
CREATE INDEX IF NOT EXISTS idx_ai_engineering_media_id ON public.ai_engineering_media(ai_engineering_id);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_enabled ON public.articles(enabled);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at);

CREATE INDEX IF NOT EXISTS idx_connections_enabled ON public.connections(enabled);
CREATE INDEX IF NOT EXISTS idx_connections_order ON public.connections(display_order);

CREATE INDEX IF NOT EXISTS idx_contact_messages_read ON public.contact_messages(read);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON public.contact_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_navigation_items_enabled ON public.navigation_items(enabled);
CREATE INDEX IF NOT EXISTS idx_navigation_items_order ON public.navigation_items(display_order);

CREATE INDEX IF NOT EXISTS idx_portfolio_sections_slug ON public.portfolio_sections(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_sections_order ON public.portfolio_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_sections_status ON public.portfolio_sections(status, visible);
CREATE INDEX IF NOT EXISTS idx_portfolio_content_items_section ON public.portfolio_content_items(section_id, display_order);

-- ==============================================================================
-- STEP 4: DATABASE TRIGGERS (Idempotent: DROP TRIGGER IF EXISTS before CREATE)
-- ==============================================================================

DROP TRIGGER IF EXISTS trg_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER trg_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_profile_updated_at ON public.profile;
CREATE TRIGGER trg_profile_updated_at BEFORE UPDATE ON public.profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_about_updated_at ON public.about;
CREATE TRIGGER trg_about_updated_at BEFORE UPDATE ON public.about FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_skills_updated_at ON public.skills;
CREATE TRIGGER trg_skills_updated_at BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_project_media_updated_at ON public.project_media;
CREATE TRIGGER trg_project_media_updated_at BEFORE UPDATE ON public.project_media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_research_updated_at ON public.research;
CREATE TRIGGER trg_research_updated_at BEFORE UPDATE ON public.research FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_research_media_updated_at ON public.research_media;
CREATE TRIGGER trg_research_media_updated_at BEFORE UPDATE ON public.research_media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_cad_cae_updated_at ON public.cad_cae;
CREATE TRIGGER trg_cad_cae_updated_at BEFORE UPDATE ON public.cad_cae FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_cad_cae_media_updated_at ON public.cad_cae_media;
CREATE TRIGGER trg_cad_cae_media_updated_at BEFORE UPDATE ON public.cad_cae_media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_plc_automation_updated_at ON public.plc_automation;
CREATE TRIGGER trg_plc_automation_updated_at BEFORE UPDATE ON public.plc_automation FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_plc_media_updated_at ON public.plc_media;
CREATE TRIGGER trg_plc_media_updated_at BEFORE UPDATE ON public.plc_media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_certifications_updated_at ON public.certifications;
CREATE TRIGGER trg_certifications_updated_at BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_ai_engineering_updated_at ON public.ai_engineering;
CREATE TRIGGER trg_ai_engineering_updated_at BEFORE UPDATE ON public.ai_engineering FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_ai_engineering_media_updated_at ON public.ai_engineering_media;
CREATE TRIGGER trg_ai_engineering_media_updated_at BEFORE UPDATE ON public.ai_engineering_media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_articles_updated_at ON public.articles;
CREATE TRIGGER trg_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_articles_reading_time ON public.articles;
CREATE TRIGGER trg_articles_reading_time BEFORE INSERT OR UPDATE OF content ON public.articles FOR EACH ROW EXECUTE FUNCTION public.calculate_article_reading_time();

DROP TRIGGER IF EXISTS trg_connections_updated_at ON public.connections;
CREATE TRIGGER trg_connections_updated_at BEFORE UPDATE ON public.connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_navigation_items_updated_at ON public.navigation_items;
CREATE TRIGGER trg_navigation_items_updated_at BEFORE UPDATE ON public.navigation_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_section_visibility_updated_at ON public.section_visibility;
CREATE TRIGGER trg_section_visibility_updated_at BEFORE UPDATE ON public.section_visibility FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_portfolio_settings_updated_at ON public.portfolio_settings;
CREATE TRIGGER trg_portfolio_settings_updated_at BEFORE UPDATE ON public.portfolio_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_visualization_settings_updated_at ON public.visualization_settings;
CREATE TRIGGER trg_visualization_settings_updated_at BEFORE UPDATE ON public.visualization_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_portfolio_sections_updated_at ON public.portfolio_sections;
DROP TRIGGER IF EXISTS trg_portfolio_sections_updated_at ON public.portfolio_sections;
CREATE TRIGGER trg_portfolio_sections_updated_at BEFORE UPDATE ON public.portfolio_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_portfolio_content_items_updated_at ON public.portfolio_content_items;
DROP TRIGGER IF EXISTS trg_portfolio_content_items_updated_at ON public.portfolio_content_items;
CREATE TRIGGER trg_portfolio_content_items_updated_at BEFORE UPDATE ON public.portfolio_content_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================================================
-- STEP 5: ROW LEVEL SECURITY POLICIES (Idempotent: DROP POLICY IF EXISTS before CREATE)
-- ==============================================================================

-- Enable RLS on all 24 public tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cad_cae ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cad_cae_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plc_automation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plc_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_engineering ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_engineering_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visualization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_content_items ENABLE ROW LEVEL SECURITY;

-- 1. admin_users
DROP POLICY IF EXISTS "admin_users_self_or_admin" ON public.admin_users;
CREATE POLICY "admin_users_self_or_admin" ON public.admin_users
  FOR ALL
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 2. profile
DROP POLICY IF EXISTS "profile_public_select" ON public.profile;
CREATE POLICY "profile_public_select" ON public.profile
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "profile_admin_all" ON public.profile;
CREATE POLICY "profile_admin_all" ON public.profile
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3. about
DROP POLICY IF EXISTS "about_public_select" ON public.about;
CREATE POLICY "about_public_select" ON public.about
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "about_admin_all" ON public.about;
CREATE POLICY "about_admin_all" ON public.about
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 4. skills
DROP POLICY IF EXISTS "skills_public_select" ON public.skills;
CREATE POLICY "skills_public_select" ON public.skills
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "skills_admin_all" ON public.skills;
CREATE POLICY "skills_admin_all" ON public.skills
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 5. projects
DROP POLICY IF EXISTS "projects_public_select" ON public.projects;
CREATE POLICY "projects_public_select" ON public.projects
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "projects_admin_all" ON public.projects;
CREATE POLICY "projects_admin_all" ON public.projects
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 6. project_media
DROP POLICY IF EXISTS "project_media_public_select" ON public.project_media;
CREATE POLICY "project_media_public_select" ON public.project_media
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "project_media_admin_all" ON public.project_media;
CREATE POLICY "project_media_admin_all" ON public.project_media
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 7. research
DROP POLICY IF EXISTS "research_public_select" ON public.research;
CREATE POLICY "research_public_select" ON public.research
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "research_admin_all" ON public.research;
CREATE POLICY "research_admin_all" ON public.research
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 8. research_media
DROP POLICY IF EXISTS "research_media_public_select" ON public.research_media;
CREATE POLICY "research_media_public_select" ON public.research_media
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "research_media_admin_all" ON public.research_media;
CREATE POLICY "research_media_admin_all" ON public.research_media
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 9. cad_cae
DROP POLICY IF EXISTS "cad_cae_public_select" ON public.cad_cae;
CREATE POLICY "cad_cae_public_select" ON public.cad_cae
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "cad_cae_admin_all" ON public.cad_cae;
CREATE POLICY "cad_cae_admin_all" ON public.cad_cae
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 10. cad_cae_media
DROP POLICY IF EXISTS "cad_cae_media_public_select" ON public.cad_cae_media;
CREATE POLICY "cad_cae_media_public_select" ON public.cad_cae_media
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "cad_cae_media_admin_all" ON public.cad_cae_media;
CREATE POLICY "cad_cae_media_admin_all" ON public.cad_cae_media
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 11. plc_automation
DROP POLICY IF EXISTS "plc_public_select" ON public.plc_automation;
CREATE POLICY "plc_public_select" ON public.plc_automation
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "plc_admin_all" ON public.plc_automation;
CREATE POLICY "plc_admin_all" ON public.plc_automation
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 12. plc_media
DROP POLICY IF EXISTS "plc_media_public_select" ON public.plc_media;
CREATE POLICY "plc_media_public_select" ON public.plc_media
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "plc_media_admin_all" ON public.plc_media;
CREATE POLICY "plc_media_admin_all" ON public.plc_media
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 13. certifications
DROP POLICY IF EXISTS "certifications_public_select" ON public.certifications;
CREATE POLICY "certifications_public_select" ON public.certifications
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "certifications_admin_all" ON public.certifications;
CREATE POLICY "certifications_admin_all" ON public.certifications
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 14. ai_engineering
DROP POLICY IF EXISTS "ai_eng_public_select" ON public.ai_engineering;
CREATE POLICY "ai_eng_public_select" ON public.ai_engineering
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "ai_eng_admin_all" ON public.ai_engineering;
CREATE POLICY "ai_eng_admin_all" ON public.ai_engineering
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 15. ai_engineering_media
DROP POLICY IF EXISTS "ai_eng_media_public_select" ON public.ai_engineering_media;
CREATE POLICY "ai_eng_media_public_select" ON public.ai_engineering_media
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "ai_eng_media_admin_all" ON public.ai_engineering_media;
CREATE POLICY "ai_eng_media_admin_all" ON public.ai_engineering_media
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 16. articles
DROP POLICY IF EXISTS "articles_public_select_published" ON public.articles;
CREATE POLICY "articles_public_select_published" ON public.articles
  FOR SELECT USING (status = 'published' AND enabled = true);

DROP POLICY IF EXISTS "articles_admin_all" ON public.articles;
CREATE POLICY "articles_admin_all" ON public.articles
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 17. connections
DROP POLICY IF EXISTS "connections_public_select" ON public.connections;
CREATE POLICY "connections_public_select" ON public.connections
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "connections_admin_all" ON public.connections;
CREATE POLICY "connections_admin_all" ON public.connections
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 18. contact_messages
DROP POLICY IF EXISTS "contact_messages_public_insert" ON public.contact_messages;
CREATE POLICY "contact_messages_public_insert" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "contact_messages_admin_all" ON public.contact_messages;
CREATE POLICY "contact_messages_admin_all" ON public.contact_messages
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 19. navigation_items
DROP POLICY IF EXISTS "navigation_public_select" ON public.navigation_items;
CREATE POLICY "navigation_public_select" ON public.navigation_items
  FOR SELECT USING (enabled = true);

DROP POLICY IF EXISTS "navigation_admin_all" ON public.navigation_items;
CREATE POLICY "navigation_admin_all" ON public.navigation_items
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 20. section_visibility
DROP POLICY IF EXISTS "section_visibility_public_select" ON public.section_visibility;
CREATE POLICY "section_visibility_public_select" ON public.section_visibility
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "section_visibility_admin_all" ON public.section_visibility;
CREATE POLICY "section_visibility_admin_all" ON public.section_visibility
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 21. portfolio_settings
DROP POLICY IF EXISTS "portfolio_settings_public_select" ON public.portfolio_settings;
CREATE POLICY "portfolio_settings_public_select" ON public.portfolio_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "portfolio_settings_admin_all" ON public.portfolio_settings;
CREATE POLICY "portfolio_settings_admin_all" ON public.portfolio_settings
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 22. visualization_settings
DROP POLICY IF EXISTS "visualization_settings_public_select" ON public.visualization_settings;
CREATE POLICY "visualization_settings_public_select" ON public.visualization_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "visualization_settings_admin_all" ON public.visualization_settings;
CREATE POLICY "visualization_settings_admin_all" ON public.visualization_settings
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 23. portfolio_sections
DROP POLICY IF EXISTS "portfolio_sections_public_select" ON public.portfolio_sections;
CREATE POLICY "portfolio_sections_public_select" ON public.portfolio_sections
  FOR SELECT USING (status = 'published' AND visible = true);

DROP POLICY IF EXISTS "portfolio_sections_admin_all" ON public.portfolio_sections;
CREATE POLICY "portfolio_sections_admin_all" ON public.portfolio_sections
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 24. portfolio_content_items
DROP POLICY IF EXISTS "portfolio_content_items_public_select" ON public.portfolio_content_items;
CREATE POLICY "portfolio_content_items_public_select" ON public.portfolio_content_items
  FOR SELECT USING (
    status = 'published' AND enabled = true
    AND EXISTS (
      SELECT 1 FROM public.portfolio_sections s
      WHERE s.id = portfolio_content_items.section_id
        AND s.status = 'published'
        AND s.visible = true
    )
  );

DROP POLICY IF EXISTS "portfolio_content_items_admin_all" ON public.portfolio_content_items;
CREATE POLICY "portfolio_content_items_admin_all" ON public.portfolio_content_items
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- ==============================================================================
-- STEP 6: STORAGE BUCKETS & POLICIES (Least-Privilege & Idempotent)
-- ==============================================================================

-- 1. Create or ensure all 10 core & CMS storage buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('project-media', 'project-media', true),
  ('research-media', 'research-media', true),
  ('cad-cae-media', 'cad-cae-media', true),
  ('plc-media', 'plc-media', true),
  ('ai-eng-media', 'ai-eng-media', true),
  ('certificates', 'certificates', true),
  ('articles', 'articles', true),
  ('profile', 'profile', true),
  ('resume', 'resume', true),
  ('section-media', 'section-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to prevent duplicate-object errors
DROP POLICY IF EXISTS "Public Read Access on All Buckets" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Section Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Section Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Section Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Media" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Section Media" ON storage.objects;

-- 3. Public Read: Restricted strictly to the 10 authorized portfolio buckets
CREATE POLICY "Public Read Access on All Buckets"
ON storage.objects FOR SELECT
USING (bucket_id IN (
  'project-media', 'research-media', 'cad-cae-media', 'plc-media',
  'ai-eng-media', 'certificates', 'articles', 'profile', 'resume', 'section-media'
));

-- 4. Admin Mutations: Restricted strictly to verified admins AND portfolio buckets
CREATE POLICY "Admin Insert Media"
ON storage.objects FOR INSERT
WITH CHECK (
  public.is_admin(auth.uid())
  AND bucket_id IN (
    'project-media', 'research-media', 'cad-cae-media', 'plc-media',
    'ai-eng-media', 'certificates', 'articles', 'profile', 'resume', 'section-media'
  )
);

CREATE POLICY "Admin Update Media"
ON storage.objects FOR UPDATE
USING (
  public.is_admin(auth.uid())
  AND bucket_id IN (
    'project-media', 'research-media', 'cad-cae-media', 'plc-media',
    'ai-eng-media', 'certificates', 'articles', 'profile', 'resume', 'section-media'
  )
)
WITH CHECK (
  public.is_admin(auth.uid())
  AND bucket_id IN (
    'project-media', 'research-media', 'cad-cae-media', 'plc-media',
    'ai-eng-media', 'certificates', 'articles', 'profile', 'resume', 'section-media'
  )
);

CREATE POLICY "Admin Delete Media"
ON storage.objects FOR DELETE
USING (
  public.is_admin(auth.uid())
  AND bucket_id IN (
    'project-media', 'research-media', 'cad-cae-media', 'plc-media',
    'ai-eng-media', 'certificates', 'articles', 'profile', 'resume', 'section-media'
  )
);

-- ==============================================================================
-- STEP 7: BASELINE SEED DATA (Non-Destructive: ON CONFLICT DO NOTHING)
-- Preserves existing administrator records and customized content when rerun.
-- ==============================================================================

-- 1. PROFILE
INSERT INTO public.profile (
  id, full_name, title, tagline, bio, email, location, resume_version,
  seo_title, seo_description
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Adithya G',
  'Mechanical Engineering Student',
  'Mechanical Design • CAD/CAE • FEA • CFD • Thermal • Industrial Automation • AI × Engineering',
  'Dedicated Mechanical Engineering student with hands-on expertise in finite element analysis, computational fluid dynamics, parametric 3D CAD modeling, industrial automation logic, and machine intelligence integrations for engineering systems.',
  'adithya@mechnexus.engineering',
  'India',
  'V18.0',
  'ADITHYA MECHNEXUS | Mechanical Engineering Digital Laboratory',
  'Official mechanical engineering portfolio of Adithya G — CAD/CAE, FEA, CFD, PLC Industrial Automation, and AI × Engineering.'
) ON CONFLICT (id) DO NOTHING;

-- 2. ABOUT
INSERT INTO public.about (
  id, content, engineering_interests, technical_direction, design_philosophy, engineering_approach, learning_direction, enabled
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'I am a passionate Mechanical Engineering student pursuing deep practical mastery across the physical and digital boundaries of modern engineering. My work focuses on rigorous multi-physics simulations, parametric CAD design, industrial automation sequences, and the integration of machine learning algorithms to optimize mechanical performance and manufacturing throughput.',
  ARRAY['Finite Element Analysis (FEA)', 'Computational Fluid Dynamics (CFD)', 'Heat Transfer & Thermal Design', 'Industrial Automation & PLC', 'Kinematics & Machine Dynamics', 'AI-Assisted Engineering Optimization'],
  'Developing high-fidelity multi-physics simulation methodologies, closed-loop industrial automation sequences, and AI-accelerated parametric design pipelines.',
  'Form adheres strictly to thermodynamic, mechanical, and manufacturability constraints. Precision over decoration; numerical verification over intuition.',
  'Rigorous mathematical formulation followed by high-density CAD modeling, mesh-independent FEA/CFD convergence, and physical experimental validation.',
  'Advancing from classical solid mechanics toward multi-domain digital twins, surrogate AI simulation models, and real-time PLC telemetry integration.',
  true
) ON CONFLICT (id) DO NOTHING;

-- 3. NAVIGATION ITEMS
INSERT INTO public.navigation_items (id, label, href, display_order, enabled) VALUES
  ('00000000-0000-0000-0000-000000000010', 'HOME', '#hero', 0, true),
  ('00000000-0000-0000-0000-000000000011', 'ABOUT', '#about', 1, true),
  ('00000000-0000-0000-0000-000000000012', 'SKILLS', '#skills', 2, true),
  ('00000000-0000-0000-0000-000000000013', 'PROJECTS', '#projects', 3, true),
  ('00000000-0000-0000-0000-000000000014', 'RESEARCH', '#research', 4, true),
  ('00000000-0000-0000-0000-000000000015', 'CAD & CAE', '#cad-cae', 5, true),
  ('00000000-0000-0000-0000-000000000016', 'PLC & AUTOMATION', '#plc', 6, true),
  ('00000000-0000-0000-0000-000000000017', 'CERTIFICATIONS', '#certifications', 7, true),
  ('00000000-0000-0000-0000-000000000018', 'AI × ENGINEERING', '#ai-engineering', 8, true),
  ('00000000-0000-0000-0000-000000000019', 'ARTICLES', '#articles', 9, true),
  ('00000000-0000-0000-0000-000000000020', 'RESUME', '#resume', 10, true),
  ('00000000-0000-0000-0000-000000000021', 'CONNECTIONS', '#connections', 11, true),
  ('00000000-0000-0000-0000-000000000022', 'CONTACT', '#contact', 12, true)
ON CONFLICT (id) DO NOTHING;

-- 4. SECTION VISIBILITY
INSERT INTO public.section_visibility (section_key, label, visible, display_order) VALUES
  ('hero', 'Hero & Digital Laboratory', true, 0),
  ('about', 'Engineering Profile & Philosophy', true, 1),
  ('skills', 'Capability Matrix', true, 2),
  ('projects', 'Engineering Projects', true, 3),
  ('research', 'Scientific Research', true, 4),
  ('cad-cae', 'CAD & CAE Simulations', true, 5),
  ('plc', 'PLC & Industrial Automation', true, 6),
  ('certifications', 'Credentials & Certifications', true, 7),
  ('ai-engineering', 'AI × Engineering', true, 8),
  ('articles', 'Technical Dossiers & Notes', true, 9),
  ('resume', 'Engineering Resume Dossier', true, 10),
  ('connections', 'Professional Connections', true, 11),
  ('contact', 'Laboratory Comms & Contact', true, 12)
ON CONFLICT (section_key) DO NOTHING;

-- 5. SKILLS MATRIX
INSERT INTO public.skills (id, name, category, description, level, tools, icon, display_order) VALUES
  ('00000000-0000-0000-0000-000000000101', 'Parametric Solid Modeling', 'CAD', 'Parametric part and assembly modeling, GD&T, top-down assembly architecture, and manufacturing drafting.', 'expert', ARRAY['SolidWorks', 'CATIA V5', 'Autodesk Inventor'], 'Box', 0),
  ('00000000-0000-0000-0000-000000000102', 'Structural & Stress FEA', 'FEA', 'Static structural, modal frequency analysis, nonlinear contact mechanics, and factor-of-safety evaluation.', 'advanced', ARRAY['ANSYS Mechanical', 'SolidWorks Simulation'], 'Activity', 1),
  ('00000000-0000-0000-0000-000000000103', 'Computational Fluid Dynamics', 'CFD', 'Navier-Stokes discretization, internal pipe flow, turbulence modeling (k-epsilon, SST k-omega), and boundary layer separation.', 'advanced', ARRAY['ANSYS Fluent', 'CFD-Post'], 'Wind', 2),
  ('00000000-0000-0000-0000-000000000104', 'Conjugate Heat Transfer', 'THERMAL', 'Conduction, forced convection heat sinks, shell-and-tube exchangers, and thermal gradient optimization.', 'advanced', ARRAY['ANSYS Fluent', 'Thermal Analysis Solvers'], 'Flame', 3),
  ('00000000-0000-0000-0000-000000000105', 'Mesh Generation & Independence', 'CAE', 'Structured boundary layer inflation, tetrahedral/hexahedral meshing, skewness and orthogonal quality validation.', 'expert', ARRAY['ANSYS Meshing', 'ICEM CFD'], 'Grid', 4),
  ('00000000-0000-0000-0000-000000000106', 'Design for Manufacturing (DFM/DFA)', 'MANUFACTURING', 'Tolerancing, machining allowances, injection molding draft angles, sheet metal unfolding, and assembly ergonomics.', 'advanced', ARRAY['GD&T ASME Y14.5', 'SolidWorks CAM'], 'Tool', 5),
  ('00000000-0000-0000-0000-000000000107', 'Dimensional Metrology & Inspection', 'METROLOGY', 'Coordinate measuring principles, optical comparator tolerance verification, and precision vernier/micrometer calipers.', 'intermediate', ARRAY['Vernier Calipers', 'CMM Inspection Basics', 'Dial Indicators'], 'Compass', 6),
  ('00000000-0000-0000-0000-000000000108', 'Ladder Logic & PLC Programming', 'PLC', 'Deterministic ladder diagram (LD) sequences, timers, counters, interlocks, and state-machine architecture.', 'advanced', ARRAY['Rockwell Connected Components Workbench', 'Siemens TIA Portal Basics'], 'Sliders', 7),
  ('00000000-0000-0000-0000-000000000109', 'Industrial Automation & Mechatronics', 'INDUSTRIAL AUTOMATION', 'Pneumatic actuators, solenoid valves, inductive proximity sensors, and closed-loop relay control.', 'advanced', ARRAY['Pneumatic Circuit Simulators', 'Relay Logic'], 'Layers', 8),
  ('00000000-0000-0000-0000-000000000110', 'Industrial Robotics & Kinematics', 'ROBOTICS', 'Forward and inverse kinematics for 6-DOF industrial manipulators, pick-and-place trajectories, and end-effector design.', 'intermediate', ARRAY['RoboDK', 'MATLAB Kinematics'], 'Cpu', 9),
  ('00000000-0000-0000-0000-000000000111', 'Engineering Programming & Computation', 'PROGRAMMING', 'Numerical algorithms, matrix decomposition, ODE solvers, and automated CAD parameter scripting.', 'advanced', ARRAY['Python', 'NumPy', 'SciPy', 'MATLAB'], 'Terminal', 10),
  ('00000000-0000-0000-0000-000000000112', 'Physics-Informed ML & Surrogates', 'AI × ENGINEERING', 'Training neural surrogate models on FEA/CFD output data to achieve real-time parametric design optimization.', 'advanced', ARRAY['PyTorch', 'Scikit-Learn', 'Pandas'], 'Brain', 11),
  ('00000000-0000-0000-0000-000000000113', 'Experimental Methodology', 'RESEARCH', 'Standardized specimen tensile testing (ASTM D638/D3039), composite laminate fabrication, and SEM fractography.', 'advanced', ARRAY['Universal Testing Machine (UTM)', 'Optical Microscopy'], 'Microscope', 12)
ON CONFLICT (id) DO NOTHING;

-- 6. PROJECTS
INSERT INTO public.projects (
  title, slug, short_description, full_description, problem_statement, objective,
  methodology, engineering_approach, tools_software, materials, results, learning_outcome,
  status, category, tags, featured, display_order
) VALUES
  (
    'Shell and Tube Heat Exchanger Parametric CAD & Assembly',
    'shell-and-tube-heat-exchanger-cad',
    'Parametric 3D design and mechanical assembly of an industrial BEM-type shell and tube heat exchanger compliant with TEMA standards.',
    'A comprehensive mechanical engineering project involving the full geometric specification, tube-sheet layout optimization, baffle spacing design, and parametric assembly of an industrial-grade shell and tube heat exchanger. Modeled under strict adherence to TEMA (Tubular Exchanger Manufacturers Association) Class C guidelines.',
    'Process fluid cooling in chemical processing requires high thermal throughput while maintaining structural integrity against hydraulic pressure loads and thermal expansion stresses.',
    'Design an optimized 1-shell, 2-tube pass heat exchanger with parametric controllability over tube pitch ratio, baffle cut percentage, and shell diameter.',
    'Formulated thermodynamic heat duty calculations followed by mechanical design of pressure retaining components. Implemented parametric geometric relations in SolidWorks for automatic scaling based on thermal capacity requirements.',
    'Conducted structural thickness validation for shell and dished heads according to ASME Section VIII Division 1 guidelines.',
    ARRAY['SolidWorks', 'AutoCAD', 'ASME Section VIII Div 1', 'TEMA Guidelines'],
    ARRAY['Carbon Steel SA-516 Gr 70', 'Copper-Nickel Alloy Tubes', 'EPDM Gaskets'],
    'Successfully produced fully constrained 3D assembly comprising 140 tubes, 8 segmental baffles (25% cut), floating head cover, and complete Bill of Materials (BOM) with GD&T drawings.',
    'Gained deep proficiency in TEMA standards, tube bundle vibration considerations, gasket seating stress calculations, and mechanical manufacturing tolerances.',
    'completed',
    'MECHANICAL DESIGN',
    ARRAY['Heat Exchanger', 'SolidWorks', 'TEMA', 'Thermal Design', 'CAD Modeling'],
    true,
    0
  ),
  (
    'Steady-State Thermal & Structural FEA of Microchannel Heat Sink',
    'microchannel-heat-sink-fea',
    'Coupled thermal and structural FEA of high-heat-flux copper microchannel heat sinks subjected to semiconductor power dissipation.',
    'Numerical finite element study assessing the junction temperature, thermal gradient distribution, and resulting thermal expansion stresses within high-density copper microchannel heat sinks operating under 150 W/cm² heat flux.',
    'Modern power electronics and high-performance computing chipsets generate localized heat fluxes exceeding 100 W/cm², causing thermal hotspots, solder joint fatigue, and device failure.',
    'Determine the optimal fin thickness-to-pitch aspect ratio that minimizes thermal resistance while keeping thermal stresses well below copper yield strength.',
    'Constructed 3D representative volume element (RVE) with symmetry boundary conditions. Performed mesh independence study with five grid densities up to 850,000 quadratic tetrahedral elements. Applied conjugate convective boundary conditions from fluid flow correlations.',
    'Sequential thermo-mechanical coupling: thermal temperature field imported as nodal body load for the subsequent elastic stress solution.',
    ARRAY['ANSYS Mechanical', 'ANSYS Workbench', 'SolidWorks', 'MATLAB'],
    ARRAY['Oxygen-Free High Conductivity Copper (C10100)', 'TIM2 Thermal Interface'],
    'Max junction temperature reduced from 84.2°C to 63.8°C with optimized 200 µm fin channels. Maximum Von Mises thermal stress reached 68.4 MPa, comfortably below the 140 MPa yield limit.',
    'Mastered mesh convergence verification metrics (Grid Convergence Index - GCI), multi-field sequential loading, and thermo-elastic stress mitigation strategies.',
    'completed',
    'CAE / FEA',
    ARRAY['FEA', 'Thermal Analysis', 'ANSYS Mechanical', 'Heat Sink', 'Stress Analysis'],
    true,
    1
  ),
  (
    'Experimental Characterization of Jute/Epoxy Biodegradable Composites',
    'jute-epoxy-biodegradable-composites',
    'Fabrication, tensile testing, and fracture analysis of eco-friendly woven jute fiber reinforced epoxy polymer laminates.',
    'Investigating the mechanical viability of natural bio-composite materials as sustainable alternatives to glass-fiber reinforced plastics (GFRP) in secondary structural and automotive interior applications.',
    'Synthetic composite materials like carbon and glass fibers entail high embodied energy and pose substantial end-of-life environmental hazards.',
    'Synthesize vacuum-assisted resin infusion jute/epoxy laminates and quantify tensile modulus, ultimate tensile strength, and flexural stiffness as a function of fiber weight fraction.',
    'Alkali chemical surface treatment (5 wt% NaOH) of raw woven jute fibers to remove hemicellulose and lignin, followed by hand lay-up with compression molding. Prepared ASTM D638 standard specimens and tested on a 50 kN Universal Testing Machine (UTM).',
    'Combined experimental stress-strain data acquisition with optical microscopy to inspect fiber pull-out, matrix cracking, and interfacial adhesion quality.',
    ARRAY['Universal Testing Machine (UTM)', 'Extensometer', 'Optical Microscope', 'OriginLab'],
    ARRAY['Bidirectional Woven Jute Fabric', 'Epoxy Resin LY556', 'Hardener HY951'],
    'Alkali-treated specimens demonstrated a 28.6% increase in tensile strength (reaching 48.2 MPa) and a 34% increase in elastic modulus over untreated composites due to enhanced fiber-matrix mechanical interlocking.',
    'Developed comprehensive understanding of composite laminate theory, ASTM mechanical testing protocols, statistical error propagation, and fractography.',
    'in_progress',
    'RESEARCH & MATERIALS',
    ARRAY['Bio-composites', 'Jute Fiber', 'Tensile Testing', 'Materials Science', 'ASTM'],
    true,
    2
  ),
  (
    'CFD Aerodynamic & Flow Separation Study of Venturi Restriction',
    'venturi-flow-separation-cfd',
    'Compressible and incompressible CFD investigation of pressure drop, boundary layer behavior, and discharge coefficient in Venturi nozzles.',
    'Computational fluid dynamics simulation evaluating wall shear stress distributions, vena contracta phenomena, and recovery cone flow separation angles across diverse Reynolds numbers (10,000 to 500,000).',
    'Differential pressure flow meters suffer from unrecoverable head loss if divergent diffuser angles trigger adverse pressure gradients and severe boundary layer detachment.',
    'Characterize optimal diffuser cone angles (5° to 15°) to maximize kinetic-to-pressure energy conversion efficiency and determine precise discharge coefficient (Cd).',
    'Axisymmetric 2D domain solved using the ANSYS Fluent steady pressure-based coupled solver with SST k-omega turbulence formulation. Inflation layers resolved down to y+ < 1 at the throat wall.',
    'Validated simulation mass flow predictions against analytical Bernoulli and ISO 5167 Venturi discharge formulations.',
    ARRAY['ANSYS Fluent', 'CFD-Post', 'ANSYS Meshing', 'Python'],
    ARRAY['Air (Ideal Gas)', 'Water Liquid (Incompressible)'],
    'Identified 7.5° divergent cone angle as optimal balance, recovering 88.4% of inlet pressure while maintaining attached flow throughout the diffuser. Computed discharge coefficient Cd = 0.982 closely matching standard empirical tables.',
    'Gained deep technical command over near-wall turbulence modeling (y+ criteria), pressure-velocity coupling schemes, and CFD discretization error analysis.',
    'completed',
    'CFD / FLUIDS',
    ARRAY['CFD', 'ANSYS Fluent', 'Fluid Mechanics', 'Turbulence', 'Aerodynamics'],
    true,
    3
  ),
  (
    'AI-Driven CNC Milling Tool Wear & Remaining Useful Life Estimation',
    'ai-cnc-tool-wear-estimation',
    'Machine learning regression and classification pipeline predicting flank wear and remaining useful life (RUL) from spindle vibration telemetry.',
    'Integration of artificial intelligence with subtractive manufacturing: real-time processing of high-frequency accelerometer and acoustic emission sensor signals during end-milling operations to forecast cutting tool flank wear (VB).',
    'Catastrophic cutting tool failure in unattended CNC operations causes workpiece scrapping, spindle bearing damage, and costly production downtime.',
    'Develop a predictive machine learning model capable of estimating tool wear within ±15 µm accuracy before reaching the critical wear criterion (VB = 0.3 mm).',
    'Performed time-domain and frequency-domain (FFT) feature extraction on NASA milling dataset vibration signals. Trained Random Forest and Gradient Boosted Decision Tree models with hyperparameter tuning via cross-validation.',
    'Built automated Python feature-engineering pipeline converting raw multi-channel telemetry into statistical moments (kurtosis, skewness, RMS, crest factor) mapped to physical wear progression.',
    ARRAY['Python', 'Scikit-Learn', 'SciPy Signal', 'Pandas', 'Matplotlib'],
    ARRAY['Carbide End Mills', 'Cast Iron Workpiece Data', 'Tri-axial Accelerometers'],
    'Achieved Mean Absolute Error (MAE) of 11.8 µm on unseen milling cycles and 96.4% classification accuracy in distinguishing sharp, healthy, and worn tool stages.',
    'Solidified the convergence between physical manufacturing dynamics, sensor telemetry processing, and applied machine learning algorithms.',
    'completed',
    'AI × ENGINEERING',
    ARRAY['Machine Learning', 'Predictive Maintenance', 'CNC Machining', 'Signal Processing', 'Python'],
    true,
    4
  )
ON CONFLICT (slug) DO NOTHING;

-- 7. CAD & CAE SIMULATION SHOWCASES
INSERT INTO public.cad_cae (
  title, slug, type, description, boundary_conditions, materials, solver,
  simulation_parameters, mesh_details, results, tools_software, tags, featured, display_order
) VALUES
  (
    'High-Pressure Hydraulic Manifold Block Structural FEA',
    'hydraulic-manifold-fea',
    'fea',
    'High-pressure structural stress and deformation analysis of a multi-port hydraulic valve manifold operating at 350 bar rated pressure.',
    'Fixed support at four mounting bolt locations; internal fluid cavity walls subjected to 35.0 MPa hydrostatic design pressure; 1.5x proof pressure applied to test ports.',
    'Ductile Iron EN-GJS-400-15 (Tensile Yield Strength: 250 MPa, Poisson Ratio: 0.28, Elastic Modulus: 169 GPa)',
    'ANSYS Mechanical APDL / Static Structural Solver',
    '{"solver_type": "Direct Sparse", "large_deflection": false, "load_steps": 1, "proof_pressure_bar": 525}'::jsonb,
    '{"element_type": "SOLID187 (10-Node Quadratic Tetrahedral)", "node_count": 420850, "element_count": 284120, "average_skewness": 0.21, "min_orthogonal_quality": 0.74}'::jsonb,
    'Maximum Von Mises stress concentrated at intersecting internal channel galleries measured 182.4 MPa, yielding a minimum Safety Factor of 1.37 under full 350 bar operating conditions.',
    ARRAY['ANSYS Mechanical', 'SolidWorks CAD'],
    ARRAY['FEA', 'Hydraulics', 'Pressure Vessel', 'Stress Analysis'],
    true,
    0
  ),
  (
    'Centrifugal Pump Impeller Cavitation & Flow CFD',
    'pump-impeller-cavitation-cfd',
    'cfd',
    'Multi-phase cavitation and hydrodynamic flow analysis inside a 5-blade backward-curved centrifugal pump impeller operating at 2900 RPM.',
    'Total pressure inlet at suction flange (101.3 kPa); mass flow outlet boundary condition; Multiple Reference Frame (MRF) rotating domain at 2900 RPM; no-slip roughness walls.',
    'Water Liquid with Schnerr-Sauer Cavitation Model and Water Vapor Phase',
    'ANSYS Fluent Coupled Pressure-Based Solver',
    '{"rpm": 2900, "inlet_pressure_kpa": 101.3, "mass_flow_rate_kg_s": 12.5, "turbulence_model": "SST k-omega"}'::jsonb,
    '{"polyhedral_cells": 1150000, "boundary_layers": 8, "growth_rate": 1.2, "wall_y_plus": "< 1.5"}'::jsonb,
    'Identified blade leading-edge suction peak triggering vapor volume fraction of 0.42 at reduced NPSH conditions. Developed modified blade wrap angle to suppress cavitation inception.',
    ARRAY['ANSYS Fluent', 'CFD-Post', 'CATIA V5'],
    ARRAY['CFD', 'Turbomachinery', 'Cavitation', 'Centrifugal Pump'],
    true,
    1
  )
ON CONFLICT (slug) DO NOTHING;

-- 8. PLC & INDUSTRIAL AUTOMATION SHOWCASE
INSERT INTO public.plc_automation (
  title, slug, description, controller, programming_type,
  inputs, outputs, logic_description, sequence_description,
  hardware, software, simulation_details, results, tags, featured, display_order
) VALUES
  (
    'Four-Station Automated Assembly & Pneumatic Inspection Cell',
    'four-station-assembly-plc',
    'Deterministic PLC control system for an automated index table executing component feeding, pneumatic press insertion, dimensional laser gauging, and pneumatic sortation.',
    'Rockwell Automation Micro820 / Allen-Bradley EtherNet/IP Controller',
    'ladder_logic',
    ARRAY['DI_00: Cycle Start Pushbutton (NO)', 'DI_01: Cycle Stop / E-Stop (NC)', 'DI_02: Table Index Position Prox', 'DI_03: Part Present Optical Sensor', 'DI_04: Press Extend Limit Reed Sw', 'DI_05: Press Retract Limit Reed Sw', 'AI_00: Laser Displacement Sensor (4-20mA)'],
    ARRAY['DO_00: Index Table Motor Contactor', 'DO_01: Feed Hopper Solenoid Valve', 'DO_02: Press Extend Solenoid Valve', 'DO_03: Part Accept Diverter Pneumatic', 'DO_04: Part Reject Bin Air Blast', 'DO_05: System Running Tower Green', 'DO_06: Fault Alarm Red Strobe'],
    'State-machine sequence architecture with step counters (N7:0). Integrated software interlocks preventing table rotation unless press cylinder is fully retracted. High-speed analog threshold comparison for dimensional tolerance (+/- 0.05 mm).',
    '1. Feed Station: Part dispensed onto fixture. 2. Index to Press: Cylinder extends with timed dwell (0.8s) for bushing press fit. 3. Index to Inspection: Laser measurement sampled and compared against lower/upper bounds. 4. Sortation Station: Pneumatic reject gate or accept chute activated. 5. Table index to origin.',
    ARRAY['Micro820 PLC (2080-LC20-20QBB)', 'SMC Pneumatic Double-Acting Cylinders', 'Keyence IL-Series Laser Sensor', '24V DC Power Supply', 'Safety Relay Banner SC26'],
    ARRAY['Rockwell Connected Components Workbench (CCW)', 'FactoryTalk View ME (HMI)'],
    'Simulated full 100-cycle continuous automation sequence in CCW emulator with simulated sensor failure and E-stop latching.',
    'Cycle time optimized to 4.2 seconds per finished assembly with zero state lockups and 100% deterministic fault trapping.',
    ARRAY['PLC', 'Ladder Logic', 'Pneumatics', 'Industrial Automation', 'Rockwell', 'Micro820'],
    true,
    0
  )
ON CONFLICT (slug) DO NOTHING;

-- 9. CERTIFICATIONS
INSERT INTO public.certifications (
  id, title, issuer, credential_id, date, description, verification_url, display_order
) VALUES
  (
    '00000000-0000-0000-0000-000000000201',
    'Finite Element Analysis Convergence and Mesh Independence',
    'Coursera / Engineering Simulation',
    'FEA-MESH-7721',
    '2025-11-14',
    'Comprehensive mastery of finite element formulation, shape functions, element quality metrics (aspect ratio, skewness, Jacobian), and Richardson extrapolation for mesh independence verification.',
    'https://coursera.org',
    0
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    'Applied Machine Learning & Python for Engineers',
    'Coursera / Engineering Data Institute',
    'ML-ENG-PY-9921',
    '2023-11-20',
    'Practical implementation of statistical learning, supervised regression, vibration classification, and signal feature extraction for physical engineering and sensor telemetry datasets.',
    'https://coursera.org',
    1
  ),
  (
    '00000000-0000-0000-0000-000000000203',
    'Mechanical CAD & Parametric Assembly Certification',
    'Mechanical Design Academy',
    'CAD-MECH-4482',
    '2024-05-18',
    'Advanced top-down parametric part and assembly modeling, geometric dimensioning and tolerancing (GD&T) to ASME Y14.5, and production drafting standards.',
    'https://coursera.org',
    2
  )
ON CONFLICT (id) DO NOTHING;

-- 10. AI × ENGINEERING SHOWCASE
INSERT INTO public.ai_engineering (
  title, slug, description, application_type, methodology,
  tools_software, results, tags, featured, display_order
) VALUES
  (
    'Deep Surrogate Modeling for Instantaneous Heat Exchanger Thermal Maps',
    'surrogate-thermal-ai',
    'Physics-informed deep neural network acting as a surrogate solver to predict 3D thermal temperature distributions in seconds rather than hours of CFD computation.',
    'surrogate_modeling',
    'Trained a multi-layer perceptron (MLP) on 600 parameterized CFD simulation runs with varying Reynolds numbers, fin counts, and inlet temperatures. Incorporated boundary condition loss penalty terms to enforce thermodynamic energy balance.',
    ARRAY['Python', 'PyTorch', 'ANSYS Fluent', 'NumPy', 'Scikit-Learn'],
    'Reduced thermal evaluation latency from 45 minutes of Navier-Stokes convergence to 12 milliseconds of neural forward inference with an overall RMSE < 2.1°C across the design space.',
    ARRAY['Surrogate Modeling', 'AI Engineering', 'Neural Networks', 'Thermal Analysis', 'CFD Acceleration'],
    true,
    0
  )
ON CONFLICT (slug) DO NOTHING;

-- 11. ARTICLES / TECHNICAL DOSSIERS
INSERT INTO public.articles (
  title, slug, excerpt, content, category, tags, author, reading_time, status, published_at, display_order
) VALUES
  (
    'Grid Convergence Index (GCI): Eliminating Discretization Error in FEA and CFD',
    'grid-convergence-index-engineering',
    'A mathematically rigorous guide to verifying mesh independence using Roache''s Grid Convergence Index and Richardson Extrapolation.',
    'In engineering computational mechanics, claiming simulation accuracy without proving spatial convergence is invalid. The Grid Convergence Index (GCI), developed by P.J. Roache and adopted by ASME and AIAA standards, provides an objective, quantified method to report numerical uncertainty. This dossier demonstrates how to calculate apparent order of convergence p, fractional error, and the 95% confidence band using three consecutively refined mesh resolutions.',
    'COMPUTATIONAL MECHANICS',
    ARRAY['FEA', 'CFD', 'Mesh Independence', 'GCI', 'Numerical Methods'],
    'Adithya G',
    5,
    'published',
    now(),
    0
  ),
  (
    'Design of Deterministic Safety Interlocks in Industrial Ladder Logic',
    'deterministic-safety-interlocks-plc',
    'Architecture and hardware principles for fail-safe pneumatic and electric actuator sequencing in automated manufacturing cells.',
    'Safety in industrial automation cannot rely solely on software timers or software-only checks. This article examines the dual-channel electrical safety architecture, positive-guided safety relays, and fail-safe pneumatic dump valves required to achieve ISO 13849-1 Performance Level d/e compliance in PLC-driven machine designs.',
    'INDUSTRIAL AUTOMATION',
    ARRAY['PLC', 'Safety Systems', 'Ladder Logic', 'Pneumatics', 'ISO 13849'],
    'Adithya G',
    4,
    'published',
    now(),
    1
  )
ON CONFLICT (slug) DO NOTHING;

-- 12. CONNECTIONS
INSERT INTO public.connections (id, name, url, description, icon, display_order, enabled) VALUES
  ('00000000-0000-0000-0000-000000000301', 'LinkedIn Profile', 'https://www.linkedin.com/in/adithya-g-mechanical', 'Professional engineering experience, research updates, and verified network.', 'Linkedin', 0, true),
  ('00000000-0000-0000-0000-000000000302', 'GitHub Engineering Repositories', 'https://github.com/adithya-mechnexus', 'CAD automation scripts, FEA/CFD post-processing Python pipelines, and PLC code.', 'Github', 1, true),
  ('00000000-0000-0000-0000-000000000303', 'ResearchGate Dossier', 'https://www.researchgate.net', 'Pre-prints, composite material test reports, and computational engineering datasets.', 'BookOpen', 2, true)
ON CONFLICT (id) DO NOTHING;

-- 13. VISUALIZATION SETTINGS
INSERT INTO public.visualization_settings (
  id, particle_count, particle_speed, geometry_count, color_scheme,
  interaction_intensity, quality, mobile_particle_count, enabled
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  450,
  0.5,
  8,
  'cyan',
  0.6,
  'auto',
  120,
  true
) ON CONFLICT (id) DO NOTHING;

-- 14. DYNAMIC SYSTEM SECTIONS (Preserving existing portfolio layout & ordering)
INSERT INTO public.portfolio_sections (slug, title, nav_label, description, section_type, layout, icon, accent_theme, display_order, is_system, status, visible, in_navigation)
VALUES
  ('hero', 'Hero Identity & CTAs', 'HOME', 'Futuristic mechanical engineering laboratory identity', 'text', 'split_two_col', 'Compass', 'cyan', 0, true, 'published', true, true),
  ('about', 'Engineering Philosophy & Profile', 'ABOUT', 'Core mechanical engineering background, design philosophy, and technical direction', 'text', 'split_two_col', 'User', 'cyan', 1, true, 'published', true, true),
  ('skills', 'Engineering Skills Matrix', 'SKILLS', 'Thermodynamics, FEA/CFD, mechanical CAD, and automation proficiencies', 'skills', 'grid_cards', 'Cpu', 'cyan', 2, true, 'published', true, true),
  ('projects', 'Engineering Projects', 'PROJECTS', 'Multi-physics validated mechanical designs, simulations, and algorithms', 'projects', 'grid_cards', 'FolderGit2', 'blue', 3, true, 'published', true, true),
  ('research', 'Research & Publications', 'RESEARCH', 'Peer-reviewed studies, thermal experiments, and scientific methodologies', 'research', 'grid_cards', 'BookOpen', 'violet', 4, true, 'published', true, true),
  ('cad-cae', 'CAD & CAE Simulations', 'CAD & CAE', 'High-density meshes, boundary conditions, and FEA/CFD solver results', 'cad_cae', 'grid_cards', 'Boxes', 'cyan', 5, true, 'published', true, true),
  ('plc', 'PLC & Industrial Automation', 'PLC & AUTOMATION', 'Programmable logic controller architectures, I/O maps, and ladder logic sequences', 'plc', 'grid_cards', 'Sliders', 'emerald', 6, true, 'published', true, true),
  ('certifications', 'Engineering Credentials', 'CERTIFICATIONS', 'Industry-verified certifications and computational licenses', 'certifications', 'grid_cards', 'Award', 'amber', 7, true, 'published', true, true),
  ('ai-engineering', 'AI × Engineering Lab', 'AI × ENGINEERING', 'Surrogate AI models, physics-informed neural networks, and generative CAD', 'ai_engineering', 'grid_cards', 'Brain', 'violet', 8, true, 'published', true, true),
  ('articles', 'Engineering Articles & Dossiers', 'ARTICLES', 'Deep-dive technical monographs and engineering simulation analysis', 'articles', 'grid_cards', 'BookOpen', 'blue', 9, true, 'published', true, true),
  ('resume', 'Engineering Dossier & Credentials', 'RESUME', 'Verified curriculum vitae and technical competencies record', 'text', 'split_two_col', 'FileText', 'steel', 10, true, 'published', true, true),
  ('connections', 'Professional Directives', 'CONNECTIONS', 'Verified technical networks, research profiles, and professional links', 'connections', 'grid_cards', 'Link2', 'cyan', 11, true, 'published', true, true),
  ('contact', 'Contact Laboratory', 'CONTACT', 'Direct telemetry inquiry and consultation dispatch', 'contact', 'split_two_col', 'Mail', 'cyan', 12, true, 'published', true, true)
ON CONFLICT (slug) DO NOTHING;
