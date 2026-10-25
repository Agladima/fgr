-- ==============================================================================
-- FGR Career Development Center — Complete Consolidated Schema & RLS
-- ==============================================================================

-- 1. EXTENSIONS & FUNCTIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. TABLES DEFINITIONS
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor', 'reviewer')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_admin_profiles_modtime
BEFORE UPDATE ON public.admin_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.training_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  age_range TEXT NOT NULL,
  location TEXT NOT NULL,
  programme TEXT NOT NULL,
  current_status TEXT NOT NULL,
  other_occupation TEXT,
  previous_training TEXT,
  training_preference TEXT NOT NULL,
  referral_source TEXT NOT NULL DEFAULT 'Social Media',
  other_referral TEXT,
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'waitlisted', 'rejected', 'archived')),
  admin_notes TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_registrations_email ON public.training_registrations (email);
CREATE INDEX IF NOT EXISTS idx_training_registrations_status ON public.training_registrations (status);
CREATE INDEX IF NOT EXISTS idx_training_registrations_created ON public.training_registrations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_training_registrations_programme ON public.training_registrations (programme);

CREATE TRIGGER update_training_registrations_modtime
BEFORE UPDATE ON public.training_registrations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.contact_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organisation TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  interests TEXT[] DEFAULT '{}',
  other_interest TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'in_review', 'responded', 'archived')),
  admin_notes TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_enquiries_email ON public.contact_enquiries (email);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_status ON public.contact_enquiries (status);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_created ON public.contact_enquiries (created_at DESC);

CREATE TRIGGER update_contact_enquiries_modtime
BEFORE UPDATE ON public.contact_enquiries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.partnership_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  organisation_type TEXT NOT NULL,
  other_org_type TEXT,
  interests TEXT[] DEFAULT '{}',
  other_interest_details TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'contacted', 'partnered', 'declined', 'archived')),
  admin_notes TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partnership_enquiries_email ON public.partnership_enquiries (email);
CREATE INDEX IF NOT EXISTS idx_partnership_enquiries_org ON public.partnership_enquiries (organisation_name);
CREATE INDEX IF NOT EXISTS idx_partnership_enquiries_status ON public.partnership_enquiries (status);
CREATE INDEX IF NOT EXISTS idx_partnership_enquiries_created ON public.partnership_enquiries (created_at DESC);

CREATE TRIGGER update_partnership_enquiries_modtime
BEFORE UPDATE ON public.partnership_enquiries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  pillar_number INTEGER NOT NULL,
  pillar_name TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT,
  areas TEXT[] DEFAULT '{}',
  outcomes TEXT[] DEFAULT '{}',
  target_audience TEXT,
  duration TEXT,
  delivery_modalities TEXT[] DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_programmes_slug ON public.programmes (slug);
CREATE INDEX IF NOT EXISTS idx_programmes_status ON public.programmes (status);
CREATE INDEX IF NOT EXISTS idx_programmes_pillar ON public.programmes (pillar_number);

CREATE TRIGGER update_programmes_modtime
BEFORE UPDATE ON public.programmes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author TEXT DEFAULT 'FGR Editorial',
  featured_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_articles_slug ON public.news_articles (slug);
CREATE INDEX IF NOT EXISTS idx_news_articles_status ON public.news_articles (status);
CREATE INDEX IF NOT EXISTS idx_news_articles_published ON public.news_articles (published_at DESC);

CREATE TRIGGER update_news_articles_modtime
BEFORE UPDATE ON public.news_articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  registration_url TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (event_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events (status);

CREATE TRIGGER update_events_modtime
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  file_url TEXT,
  external_link TEXT,
  format TEXT NOT NULL DEFAULT 'PDF',
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources (category);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources (status);

CREATE TRIGGER update_resources_modtime
BEFORE UPDATE ON public.resources
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.impact_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_impact_metrics_order ON public.impact_metrics (order_index ASC);

CREATE TRIGGER update_impact_metrics_modtime
BEFORE UPDATE ON public.impact_metrics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  programme_name TEXT NOT NULL,
  challenge TEXT NOT NULL,
  experience TEXT NOT NULL,
  outcome TEXT NOT NULL,
  quote TEXT NOT NULL,
  avatar_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_success_stories_status ON public.success_stories (status);
CREATE INDEX IF NOT EXISTS idx_success_stories_order ON public.success_stories (order_index ASC);

CREATE TRIGGER update_success_stories_modtime
BEFORE UPDATE ON public.success_stories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_name TEXT NOT NULL DEFAULT 'public-assets',
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_files_path ON public.media_files (bucket_name, file_path);

-- 3. ROW LEVEL SECURITY (RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = auth.uid() AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view own profile" ON public.admin_profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Super admins manage all" ON public.admin_profiles FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid() AND role = 'super_admin' AND is_active = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid() AND role = 'super_admin' AND is_active = TRUE));

ALTER TABLE public.training_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert training" ON public.training_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins select training" ON public.training_registrations FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins update training" ON public.training_registrations FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete training" ON public.training_registrations FOR DELETE TO authenticated USING (public.is_admin());

ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert contact" ON public.contact_enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins select contact" ON public.contact_enquiries FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins update contact" ON public.contact_enquiries FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete contact" ON public.contact_enquiries FOR DELETE TO authenticated USING (public.is_admin());

ALTER TABLE public.partnership_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert partnership" ON public.partnership_enquiries FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins select partnership" ON public.partnership_enquiries FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins update partnership" ON public.partnership_enquiries FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete partnership" ON public.partnership_enquiries FOR DELETE TO authenticated USING (public.is_admin());

ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published programmes" ON public.programmes FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins manage programmes" ON public.programmes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published articles" ON public.news_articles FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins manage articles" ON public.news_articles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active events" ON public.events FOR SELECT TO anon, authenticated USING (status IN ('upcoming', 'ongoing', 'completed'));
CREATE POLICY "Admins manage events" ON public.events FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active resources" ON public.resources FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Admins manage resources" ON public.resources FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read impact metrics" ON public.impact_metrics FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage impact metrics" ON public.impact_metrics FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read success stories" ON public.success_stories FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "Admins manage success stories" ON public.success_stories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read media files" ON public.media_files FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage media files" ON public.media_files FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. CRM EXTENSIONS (ORGANIZATIONS, COHORTS, FOLLOW-UPS, NOTES, AUDIT LOGS)
ALTER TABLE public.admin_profiles
  DROP CONSTRAINT IF EXISTS admin_profiles_role_check;

ALTER TABLE public.admin_profiles
  ADD CONSTRAINT admin_profiles_role_check 
  CHECK (role IN ('super_admin', 'admin', 'training_officer', 'partnerships_officer', 'content_manager'));

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  partnership_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (partnership_status IN ('prospect', 'in_discussion', 'confirmed', 'inactive')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_organizations_modtime
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.training_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id UUID REFERENCES public.programmes(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  cohort_code TEXT UNIQUE,
  start_date DATE,
  end_date DATE,
  capacity INTEGER DEFAULT 50,
  enrolled_count INTEGER DEFAULT 0,
  delivery_mode TEXT DEFAULT 'In-Person' CHECK (delivery_mode IN ('In-Person', 'Online', 'Hybrid')),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_training_cohorts_modtime
BEFORE UPDATE ON public.training_cohorts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.follow_up_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  related_type TEXT NOT NULL CHECK (related_type IN ('registration', 'partnership', 'enquiry', 'programme', 'event', 'general')),
  related_id UUID,
  due_date TIMESTAMPTZ,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_status ON public.follow_up_tasks (status);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_assignee ON public.follow_up_tasks (assigned_to);
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_due ON public.follow_up_tasks (due_date);

CREATE TRIGGER update_follow_up_tasks_modtime
BEFORE UPDATE ON public.follow_up_tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.internal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  record_type TEXT NOT NULL CHECK (record_type IN ('registration', 'partnership', 'enquiry', 'task', 'general')),
  record_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internal_notes_record ON public.internal_notes (record_type, record_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_created ON public.internal_notes (created_at DESC);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
  actor_email TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage organizations" ON public.organizations FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.training_cohorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active cohorts" ON public.training_cohorts FOR SELECT TO anon, authenticated USING (status IN ('upcoming', 'in_progress'));
CREATE POLICY "Admins manage cohorts" ON public.training_cohorts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.follow_up_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage tasks" ON public.follow_up_tasks FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage notes" ON public.internal_notes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = auth.uid() AND role = 'super_admin' AND is_active = TRUE)
);
CREATE POLICY "Staff insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- 5. TABLE AND SCHEMA PERMISSIONS TO ROLES
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- 6. CMS LIFECYCLE & CONTENT ENHANCEMENTS
ALTER TABLE public.programmes
  ADD COLUMN IF NOT EXISTS application_open_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS application_close_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS eligibility TEXT,
  ADD COLUMN IF NOT EXISTS application_instructions TEXT,
  ADD COLUMN IF NOT EXISTS registration_url TEXT;

ALTER TABLE public.programmes DROP CONSTRAINT IF EXISTS programmes_status_check;
ALTER TABLE public.programmes ADD CONSTRAINT programmes_status_check
  CHECK (status IN ('draft', 'published', 'open', 'closing_soon', 'closed', 'completed', 'archived'));

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS featured_image_url TEXT;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE public.events ADD CONSTRAINT events_status_check
  CHECK (status IN ('draft', 'published', 'upcoming', 'ongoing', 'completed', 'cancelled', 'archived'));

ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_confidential BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_status_check;
ALTER TABLE public.resources ADD CONSTRAINT resources_status_check
  CHECK (status IN ('draft', 'published', 'active', 'archived'));

ALTER TABLE public.success_stories
  ADD COLUMN IF NOT EXISTS role_after TEXT,
  ADD COLUMN IF NOT EXISTS story TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.success_stories
  ALTER COLUMN challenge DROP NOT NULL,
  ALTER COLUMN experience DROP NOT NULL,
  ALTER COLUMN outcome DROP NOT NULL,
  ALTER COLUMN quote DROP NOT NULL;
ALTER TABLE public.success_stories DROP CONSTRAINT IF EXISTS success_stories_status_check;
ALTER TABLE public.success_stories ADD CONSTRAINT success_stories_status_check
  CHECK (status IN ('draft', 'published', 'active', 'archived', 'hidden'));

ALTER TABLE public.impact_metrics
  ADD COLUMN IF NOT EXISTS display_format TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS reporting_period TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));

ALTER TABLE public.media_files ADD COLUMN IF NOT EXISTS alt_text TEXT;



