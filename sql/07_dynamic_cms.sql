-- ==============================================================================
-- ADITHYA MECHNEXUS V18.3 — DYNAMIC SECTION BUILDER & CMS SCHEMA MIGRATION
-- Non-destructive extension. Preserves all existing tables and data.
-- ==============================================================================

-- 1. EXTEND PROFILE FOR EDUCATION, ACADEMIC & HERO CTAS
ALTER TABLE public.profile 
  ADD COLUMN IF NOT EXISTS education_institution text DEFAULT 'Anna University Affiliate / Engineering Institute',
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

-- 3. SECTION CONTENT ITEMS (For custom sections, galleries, structured cards, timelines)
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

-- 4. EXTEND NAVIGATION ITEMS FOR ARBITRARY LINKS
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

-- 11. SEED DEFAULT SYSTEM SECTIONS (Preserving existing portfolio ordering)
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
