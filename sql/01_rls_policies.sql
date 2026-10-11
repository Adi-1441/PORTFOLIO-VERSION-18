-- ==============================================================================
-- ADITHYA MECHNEXUS V18.0 — ROW LEVEL SECURITY POLICIES
-- Zero permissive shortcuts. Never use USING(true) on sensitive data.
-- ==============================================================================

-- Enable RLS on all 22 tables
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

-- 1. ADMIN USERS TABLE
-- Public cannot view or mutate admin users.
CREATE POLICY "admin_users_self_or_admin" ON public.admin_users
  FOR ALL
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 2. PROFILE
CREATE POLICY "profile_public_select" ON public.profile
  FOR SELECT USING (true);

CREATE POLICY "profile_admin_all" ON public.profile
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3. ABOUT
CREATE POLICY "about_public_select" ON public.about
  FOR SELECT USING (enabled = true);

CREATE POLICY "about_admin_all" ON public.about
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 4. SKILLS
CREATE POLICY "skills_public_select" ON public.skills
  FOR SELECT USING (enabled = true);

CREATE POLICY "skills_admin_all" ON public.skills
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 5. PROJECTS
CREATE POLICY "projects_public_select" ON public.projects
  FOR SELECT USING (enabled = true);

CREATE POLICY "projects_admin_all" ON public.projects
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 6. PROJECT MEDIA
CREATE POLICY "project_media_public_select" ON public.project_media
  FOR SELECT USING (enabled = true);

CREATE POLICY "project_media_admin_all" ON public.project_media
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 7. RESEARCH
CREATE POLICY "research_public_select" ON public.research
  FOR SELECT USING (enabled = true);

CREATE POLICY "research_admin_all" ON public.research
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 8. RESEARCH MEDIA
CREATE POLICY "research_media_public_select" ON public.research_media
  FOR SELECT USING (enabled = true);

CREATE POLICY "research_media_admin_all" ON public.research_media
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 9. CAD & CAE
CREATE POLICY "cad_cae_public_select" ON public.cad_cae
  FOR SELECT USING (enabled = true);

CREATE POLICY "cad_cae_admin_all" ON public.cad_cae
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 10. CAD & CAE MEDIA
CREATE POLICY "cad_cae_media_public_select" ON public.cad_cae_media
  FOR SELECT USING (enabled = true);

CREATE POLICY "cad_cae_media_admin_all" ON public.cad_cae_media
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 11. PLC & AUTOMATION
CREATE POLICY "plc_public_select" ON public.plc_automation
  FOR SELECT USING (enabled = true);

CREATE POLICY "plc_admin_all" ON public.plc_automation
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 12. PLC MEDIA
CREATE POLICY "plc_media_public_select" ON public.plc_media
  FOR SELECT USING (enabled = true);

CREATE POLICY "plc_media_admin_all" ON public.plc_media
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 13. CERTIFICATIONS
CREATE POLICY "certifications_public_select" ON public.certifications
  FOR SELECT USING (enabled = true);

CREATE POLICY "certifications_admin_all" ON public.certifications
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 14. AI × ENGINEERING
CREATE POLICY "ai_eng_public_select" ON public.ai_engineering
  FOR SELECT USING (enabled = true);

CREATE POLICY "ai_eng_admin_all" ON public.ai_engineering
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 15. AI × ENGINEERING MEDIA
CREATE POLICY "ai_eng_media_public_select" ON public.ai_engineering_media
  FOR SELECT USING (enabled = true);

CREATE POLICY "ai_eng_media_admin_all" ON public.ai_engineering_media
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 16. ARTICLES (CRITICAL: Drafts NEVER public)
CREATE POLICY "articles_public_select_published" ON public.articles
  FOR SELECT USING (status = 'published' AND enabled = true);

CREATE POLICY "articles_admin_all" ON public.articles
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 17. CONNECTIONS
CREATE POLICY "connections_public_select" ON public.connections
  FOR SELECT USING (enabled = true);

CREATE POLICY "connections_admin_all" ON public.connections
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 18. CONTACT MESSAGES (Public INSERT only. No public read/update/delete)
CREATE POLICY "contact_messages_public_insert" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_messages_admin_all" ON public.contact_messages
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 19. NAVIGATION ITEMS
CREATE POLICY "navigation_public_select" ON public.navigation_items
  FOR SELECT USING (enabled = true);

CREATE POLICY "navigation_admin_all" ON public.navigation_items
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 20. SECTION VISIBILITY
CREATE POLICY "section_visibility_public_select" ON public.section_visibility
  FOR SELECT USING (true);

CREATE POLICY "section_visibility_admin_all" ON public.section_visibility
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 21. PORTFOLIO SETTINGS
CREATE POLICY "portfolio_settings_public_select" ON public.portfolio_settings
  FOR SELECT USING (true);

CREATE POLICY "portfolio_settings_admin_all" ON public.portfolio_settings
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 22. VISUALIZATION SETTINGS
CREATE POLICY "visualization_settings_public_select" ON public.visualization_settings
  FOR SELECT USING (true);

CREATE POLICY "visualization_settings_admin_all" ON public.visualization_settings
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
