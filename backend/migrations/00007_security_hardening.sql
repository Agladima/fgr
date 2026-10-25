-- ==============================================================================
-- FGR Career Development Center — Migration 00007: Security Hardening
-- ==============================================================================
-- This migration updates RLS policies to match the CMS status enhancements
-- from migration 00006 and ensures public visitors can only read published
-- content while admin tables remain properly secured.

-- 1. FIX PROGRAMMES PUBLIC-READ POLICY
-- The old policy only allowed status = 'published', but CMS added:
-- 'open', 'closing_soon', 'closed', 'completed' as valid public-visible statuses.
DROP POLICY IF EXISTS "Public read published programmes" ON public.programmes;
CREATE POLICY "Public read visible programmes"
  ON public.programmes
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('published', 'open', 'closing_soon', 'closed', 'completed'));

-- 2. FIX EVENTS PUBLIC-READ POLICY
-- CMS added 'published' as a valid event status; include it along with existing ones.
DROP POLICY IF EXISTS "Public read active events" ON public.events;
CREATE POLICY "Public read visible events"
  ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('published', 'upcoming', 'ongoing', 'completed'));

-- 3. FIX RESOURCES PUBLIC-READ POLICY
-- CMS changed statuses; 'published' should be publicly visible alongside 'active'.
-- Confidential resources must be excluded.
DROP POLICY IF EXISTS "Public read active resources" ON public.resources;
CREATE POLICY "Public read visible resources"
  ON public.resources
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('published', 'active') AND is_confidential = FALSE);

-- 4. FIX SUCCESS STORIES PUBLIC-READ POLICY
-- CMS added 'published' status; include alongside 'active'.
DROP POLICY IF EXISTS "Public read active success stories" ON public.success_stories;
CREATE POLICY "Public read visible success stories"
  ON public.success_stories
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('published', 'active'));

-- 5. FIX IMPACT METRICS PUBLIC-READ POLICY
-- Old policy allowed all reads (USING true). Restrict to published only.
DROP POLICY IF EXISTS "Public read impact metrics" ON public.impact_metrics;
CREATE POLICY "Public read published impact metrics"
  ON public.impact_metrics
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- 6. VERIFY STORAGE BUCKET POLICIES
-- Note: Supabase storage bucket policies must be configured via the
-- Supabase Dashboard → Storage → Policies. Ensure:
--   • public-assets bucket: Public SELECT allowed, INSERT/UPDATE/DELETE
--     restricted to authenticated users where is_admin() = true.
--   • No other buckets allow public writes.

-- 7. GRANT PRIVILEGES (idempotent safety net)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
