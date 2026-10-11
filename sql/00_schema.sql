-- ==============================================================================
-- ADITHYA MECHNEXUS V18.0 — COMPLETE MASTER SCHEMA
-- Pure PostgreSQL + Supabase. All IDs use UUID gen_random_uuid().
-- ==============================================================================

-- 1. ADMIN AUTHORIZATION TABLE
-- Links directly to auth.users. Never relies solely on email or frontend state.
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  email text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. PROFILE & IDENTITY
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

-- 3. ABOUT SECTION
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

-- 4. SKILLS MATRIX
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

-- 5. PROJECTS
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

-- 6. PROJECT MEDIA (Images, Videos, Technical CAD Documents)
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

-- 7. RESEARCH
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

-- 8. RESEARCH MEDIA
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

-- 9. CAD & CAE SIMULATIONS
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

-- 10. CAD & CAE MEDIA
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

-- 11. PLC & INDUSTRIAL AUTOMATION
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

-- 12. PLC MEDIA
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

-- 13. CERTIFICATIONS
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

-- 14. AI × ENGINEERING
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

-- 15. AI × ENGINEERING MEDIA
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

-- 16. ARTICLES (Drafts NEVER visible publicly)
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

-- 17. CONNECTIONS (Not "Socials")
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

-- 18. CONTACT MESSAGES (Public INSERT only, Admin read/manage)
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

-- 19. NAVIGATION CONFIGURATION
CREATE TABLE IF NOT EXISTS public.navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 20. SECTION VISIBILITY
CREATE TABLE IF NOT EXISTS public.section_visibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  label text NOT NULL,
  visible boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 21. PORTFOLIO SETTINGS
CREATE TABLE IF NOT EXISTS public.portfolio_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 22. VISUALIZATION SETTINGS (Live 3D Background Config)
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
