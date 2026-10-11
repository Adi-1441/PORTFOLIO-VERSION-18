-- ==============================================================================
-- ADITHYA MECHNEXUS V18.0 — STORAGE BUCKETS & POLICIES
-- ==============================================================================

-- 1. Create storage buckets (if storage schema exists)
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
  ('resume', 'resume', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Policies: Public SELECT for all buckets
CREATE POLICY "Public Read Access on All Buckets"
ON storage.objects FOR SELECT
USING (bucket_id IN (
  'project-media', 'research-media', 'cad-cae-media', 'plc-media',
  'ai-eng-media', 'certificates', 'articles', 'profile', 'resume'
));

-- 3. Storage Policies: Admin INSERT/UPDATE/DELETE
CREATE POLICY "Admin Insert Media"
ON storage.objects FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin Update Media"
ON storage.objects FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admin Delete Media"
ON storage.objects FOR DELETE
USING (public.is_admin(auth.uid()));
