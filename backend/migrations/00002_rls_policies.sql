-- ==============================================================================
-- FGR Career Development Center — Migration 00002: Row Level Security (RLS)
-- ==============================================================================

-- Admin check helper function (runs in security definer context)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 1. admin_profiles RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Admins can read their own profile
CREATE POLICY "Admins can view own profile"
  ON public.admin_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Super admins have full management
CREATE POLICY "Super admins can manage all profiles"
  ON public.admin_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE id = auth.uid() AND role = 'super_admin' AND is_active = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE id = auth.uid() AND role = 'super_admin' AND is_active = TRUE
    )
  );

-- ------------------------------------------------------------------------------
-- 2. training_registrations RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.training_registrations ENABLE ROW LEVEL SECURITY;

-- Anonymous and authenticated visitors can submit registrations
CREATE POLICY "Allow public insert for registrations"
  ON public.training_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only verified active admins can read, update or delete registrations
CREATE POLICY "Admins can view all registrations"
  ON public.training_registrations
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update registrations"
  ON public.training_registrations
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete registrations"
  ON public.training_registrations
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. contact_enquiries RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;

-- Allow public insert
CREATE POLICY "Allow public insert for contact enquiries"
  ON public.contact_enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only verified admins can read, update or delete enquiries
CREATE POLICY "Admins can view all contact enquiries"
  ON public.contact_enquiries
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update contact enquiries"
  ON public.contact_enquiries
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete contact enquiries"
  ON public.contact_enquiries
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 4. partnership_enquiries RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.partnership_enquiries ENABLE ROW LEVEL SECURITY;

-- Allow public insert
CREATE POLICY "Allow public insert for partnership enquiries"
  ON public.partnership_enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only verified admins can read, update or delete partnership enquiries
CREATE POLICY "Admins can view all partnership enquiries"
  ON public.partnership_enquiries
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update partnership enquiries"
  ON public.partnership_enquiries
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete partnership enquiries"
  ON public.partnership_enquiries
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 5. programmes RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;

-- Public can read published programmes
CREATE POLICY "Public read published programmes"
  ON public.programmes
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Admins can do everything
CREATE POLICY "Admins full access on programmes"
  ON public.programmes
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 6. news_articles RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Public can read published articles
CREATE POLICY "Public read published news articles"
  ON public.news_articles
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Admins can do everything
CREATE POLICY "Admins full access on news articles"
  ON public.news_articles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 7. events RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Public can read events (upcoming, ongoing, completed)
CREATE POLICY "Public read active events"
  ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('upcoming', 'ongoing', 'completed'));

-- Admins can do everything
CREATE POLICY "Admins full access on events"
  ON public.events
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 8. resources RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Public can read active resources
CREATE POLICY "Public read active resources"
  ON public.resources
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- Admins can do everything
CREATE POLICY "Admins full access on resources"
  ON public.resources
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 9. impact_metrics RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;

-- Public can read impact metrics
CREATE POLICY "Public read impact metrics"
  ON public.impact_metrics
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admins can do everything
CREATE POLICY "Admins full access on impact metrics"
  ON public.impact_metrics
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 10. success_stories RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;

-- Public can read active success stories
CREATE POLICY "Public read active success stories"
  ON public.success_stories
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- Admins can do everything
CREATE POLICY "Admins full access on success stories"
  ON public.success_stories
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 11. media_files RLS
-- ------------------------------------------------------------------------------
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- Public can read media files
CREATE POLICY "Public read media files"
  ON public.media_files
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admins can upload and manage media files
CREATE POLICY "Admins full access on media files"
  ON public.media_files
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
