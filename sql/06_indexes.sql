-- ==============================================================================
-- ADITHYA MECHNEXUS V18.0 — PERFORMANCE INDEXES
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
