-- ==============================================================================
-- ADITHYA MECHNEXUS V18.0 — DATABASE TRIGGERS
-- ==============================================================================

-- Drop existing triggers to ensure idempotent execution
DROP TRIGGER IF EXISTS trg_admin_users_updated_at ON public.admin_users;
DROP TRIGGER IF EXISTS trg_profile_updated_at ON public.profile;
DROP TRIGGER IF EXISTS trg_about_updated_at ON public.about;
DROP TRIGGER IF EXISTS trg_skills_updated_at ON public.skills;
DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS trg_project_media_updated_at ON public.project_media;
DROP TRIGGER IF EXISTS trg_research_updated_at ON public.research;
DROP TRIGGER IF EXISTS trg_research_media_updated_at ON public.research_media;
DROP TRIGGER IF EXISTS trg_cad_cae_updated_at ON public.cad_cae;
DROP TRIGGER IF EXISTS trg_cad_cae_media_updated_at ON public.cad_cae_media;
DROP TRIGGER IF EXISTS trg_plc_automation_updated_at ON public.plc_automation;
DROP TRIGGER IF EXISTS trg_plc_media_updated_at ON public.plc_media;
DROP TRIGGER IF EXISTS trg_certifications_updated_at ON public.certifications;
DROP TRIGGER IF EXISTS trg_ai_engineering_updated_at ON public.ai_engineering;
DROP TRIGGER IF EXISTS trg_ai_engineering_media_updated_at ON public.ai_engineering_media;
DROP TRIGGER IF EXISTS trg_articles_updated_at ON public.articles;
DROP TRIGGER IF EXISTS trg_articles_reading_time ON public.articles;
DROP TRIGGER IF EXISTS trg_connections_updated_at ON public.connections;
DROP TRIGGER IF EXISTS trg_navigation_items_updated_at ON public.navigation_items;
DROP TRIGGER IF EXISTS trg_section_visibility_updated_at ON public.section_visibility;
DROP TRIGGER IF EXISTS trg_portfolio_settings_updated_at ON public.portfolio_settings;
DROP TRIGGER IF EXISTS trg_visualization_settings_updated_at ON public.visualization_settings;

-- Create update triggers
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
CREATE TRIGGER trg_connections_updated_at BEFORE UPDATE ON public.connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_navigation_items_updated_at BEFORE UPDATE ON public.navigation_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_section_visibility_updated_at BEFORE UPDATE ON public.section_visibility FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portfolio_settings_updated_at BEFORE UPDATE ON public.portfolio_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_visualization_settings_updated_at BEFORE UPDATE ON public.visualization_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Reading time trigger for articles
CREATE TRIGGER trg_articles_reading_time BEFORE INSERT OR UPDATE OF content ON public.articles FOR EACH ROW EXECUTE FUNCTION public.calculate_article_reading_time();
