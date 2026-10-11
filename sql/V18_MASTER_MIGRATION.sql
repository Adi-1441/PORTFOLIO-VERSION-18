-- ==============================================================================
-- ADITHYA MECHNEXUS V18.0 — COMPLETE ONE-CLICK MASTER MIGRATION SCRIPT
-- Run this in Supabase SQL Editor to set up the entire V18 system.
-- ==============================================================================

-- STEP 1: FUNCTIONS
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

-- STEP 2: SCHEMA (TABLES)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  email text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Admin verification function (depends on admin_users table)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

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
  references text[] DEFAULT ARRAY[]::text[],
  tags text[] DEFAULT ARRAY[]::text[],
  thumbnail_url text,
  featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.section_visibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  label text NOT NULL,
  visible boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.portfolio_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

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

-- STEP 3: TRIGGERS
CREATE TRIGGER trg_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_profile_updated_at BEFORE UPDATE ON public.profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_about_updated_at BEFORE UPDATE ON public.about FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_skills_updated_at BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_project_media_updated_at BEFORE UPDATE ON public.project_media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_research_updated_at BEFORE UPDATE ON public.research FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_research_media_updated_at BEFORE UPDATE ON public.research_media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cad_cae_updated_at BEFORE UPDATE ON public.cad_cae FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cad_cae_media_updated_at BEFORE UPDATE ON public.cad_cae_media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_plc_automation_updated_at BEFORE UPDATE ON public.plc_automation FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_plc_media_updated_at BEFORE UPDATE ON public.plc_media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_certifications_updated_at BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ai_engineering_updated_at BEFORE UPDATE ON public.ai_engineering FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ai_engineering_media_updated_at BEFORE UPDATE ON public.ai_engineering_media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_articles_reading_time BEFORE INSERT OR UPDATE OF content ON public.articles FOR EACH ROW EXECUTE FUNCTION public.calculate_article_reading_time();
CREATE TRIGGER trg_connections_updated_at BEFORE UPDATE ON public.connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_navigation_items_updated_at BEFORE UPDATE ON public.navigation_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_section_visibility_updated_at BEFORE UPDATE ON public.section_visibility FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portfolio_settings_updated_at BEFORE UPDATE ON public.portfolio_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_visualization_settings_updated_at BEFORE UPDATE ON public.visualization_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- STEP 4: RLS POLICIES
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

CREATE POLICY "admin_users_self_or_admin" ON public.admin_users FOR ALL USING (auth.uid() = user_id OR public.is_admin(auth.uid())) WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "profile_public_select" ON public.profile FOR SELECT USING (true);
CREATE POLICY "profile_admin_all" ON public.profile FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "about_public_select" ON public.about FOR SELECT USING (enabled = true);
CREATE POLICY "about_admin_all" ON public.about FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "skills_public_select" ON public.skills FOR SELECT USING (enabled = true);
CREATE POLICY "skills_admin_all" ON public.skills FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "projects_public_select" ON public.projects FOR SELECT USING (enabled = true);
CREATE POLICY "projects_admin_all" ON public.projects FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "project_media_public_select" ON public.project_media FOR SELECT USING (enabled = true);
CREATE POLICY "project_media_admin_all" ON public.project_media FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "research_public_select" ON public.research FOR SELECT USING (enabled = true);
CREATE POLICY "research_admin_all" ON public.research FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "research_media_public_select" ON public.research_media FOR SELECT USING (enabled = true);
CREATE POLICY "research_media_admin_all" ON public.research_media FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "cad_cae_public_select" ON public.cad_cae FOR SELECT USING (enabled = true);
CREATE POLICY "cad_cae_admin_all" ON public.cad_cae FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "cad_cae_media_public_select" ON public.cad_cae_media FOR SELECT USING (enabled = true);
CREATE POLICY "cad_cae_media_admin_all" ON public.cad_cae_media FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "plc_public_select" ON public.plc_automation FOR SELECT USING (enabled = true);
CREATE POLICY "plc_admin_all" ON public.plc_automation FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "plc_media_public_select" ON public.plc_media FOR SELECT USING (enabled = true);
CREATE POLICY "plc_media_admin_all" ON public.plc_media FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "certifications_public_select" ON public.certifications FOR SELECT USING (enabled = true);
CREATE POLICY "certifications_admin_all" ON public.certifications FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "ai_eng_public_select" ON public.ai_engineering FOR SELECT USING (enabled = true);
CREATE POLICY "ai_eng_admin_all" ON public.ai_engineering FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "ai_eng_media_public_select" ON public.ai_engineering_media FOR SELECT USING (enabled = true);
CREATE POLICY "ai_eng_media_admin_all" ON public.ai_engineering_media FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "articles_public_select_published" ON public.articles FOR SELECT USING (status = 'published' AND enabled = true);
CREATE POLICY "articles_admin_all" ON public.articles FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "connections_public_select" ON public.connections FOR SELECT USING (enabled = true);
CREATE POLICY "connections_admin_all" ON public.connections FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "contact_messages_public_insert" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "contact_messages_admin_all" ON public.contact_messages FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "navigation_public_select" ON public.navigation_items FOR SELECT USING (enabled = true);
CREATE POLICY "navigation_admin_all" ON public.navigation_items FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "section_visibility_public_select" ON public.section_visibility FOR SELECT USING (true);
CREATE POLICY "section_visibility_admin_all" ON public.section_visibility FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "portfolio_settings_public_select" ON public.portfolio_settings FOR SELECT USING (true);
CREATE POLICY "portfolio_settings_admin_all" ON public.portfolio_settings FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "visualization_settings_public_select" ON public.visualization_settings FOR SELECT USING (true);
CREATE POLICY "visualization_settings_admin_all" ON public.visualization_settings FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ==============================================================================
-- PART 7: ADITHYA MECHNEXUS V18.3 DYNAMIC CMS & SECTION BUILDER
-- ==============================================================================

-- 1. EXTEND PROFILE FOR EDUCATION, ACADEMIC & HERO CTAS
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

-- 2. DYNAMIC PORTFOLIO SECTIONS
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

-- 3. SECTION CONTENT ITEMS
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

-- 4. EXTEND NAVIGATION ITEMS
ALTER TABLE public.navigation_items
  ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES public.portfolio_sections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_external boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS open_in_new_tab boolean NOT NULL DEFAULT false;

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_portfolio_sections_slug ON public.portfolio_sections(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_sections_order ON public.portfolio_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_sections_status ON public.portfolio_sections(status, visible);
CREATE INDEX IF NOT EXISTS idx_portfolio_content_items_section ON public.portfolio_content_items(section_id, display_order);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.portfolio_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_content_items ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES FOR PORTFOLIO SECTIONS
CREATE POLICY "portfolio_sections_public_select" ON public.portfolio_sections
  FOR SELECT USING (status = 'published' AND visible = true);

CREATE POLICY "portfolio_sections_admin_all" ON public.portfolio_sections
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 8. RLS POLICIES FOR PORTFOLIO CONTENT ITEMS
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

CREATE POLICY "portfolio_content_items_admin_all" ON public.portfolio_content_items
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 9. TRIGGERS FOR UPDATED_AT
DROP TRIGGER IF EXISTS trigger_portfolio_sections_updated_at ON public.portfolio_sections;
CREATE TRIGGER trigger_portfolio_sections_updated_at
  BEFORE UPDATE ON public.portfolio_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_portfolio_content_items_updated_at ON public.portfolio_content_items;
CREATE TRIGGER trigger_portfolio_content_items_updated_at
  BEFORE UPDATE ON public.portfolio_content_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. STORAGE BUCKET FOR SECTION MEDIA
INSERT INTO storage.buckets (id, name, public)
VALUES ('section-media', 'section-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Read Section Media"
ON storage.objects FOR SELECT
USING (bucket_id = 'section-media');

CREATE POLICY "Admin Insert Section Media"
ON storage.objects FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin Update Section Media"
ON storage.objects FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin Delete Section Media"
ON storage.objects FOR DELETE
USING (public.is_admin(auth.uid()));

-- 11. SEED DEFAULT SYSTEM SECTIONS
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
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  nav_label = EXCLUDED.nav_label,
  section_type = EXCLUDED.section_type,
  is_system = EXCLUDED.is_system;
