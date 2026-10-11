-- ==============================================================================
-- ADITHYA MECHNEXUS V18.0 — DATABASE FUNCTIONS
-- ==============================================================================

-- 1. IS_ADMIN VERIFICATION FUNCTION (SECURITY DEFINER)
-- Checks if a specific UUID is enabled in admin_users table.
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

-- 2. AUTO-UPDATE UPDATED_AT TIMESTAMP
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. AUTO-GENERATE URL SLUGS
CREATE OR REPLACE FUNCTION public.generate_slug(title text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(
    regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  ));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. AUTO-CALCULATE READING TIME FOR ARTICLES
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
