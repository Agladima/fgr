-- ==============================================================================
-- FGR Career Development Center — Migration 00005: CRM Extensions
-- ==============================================================================

-- 1. UPDATE ROLES ON admin_profiles
-- Drop previous check constraint and add updated CRM roles
ALTER TABLE public.admin_profiles
  DROP CONSTRAINT IF EXISTS admin_profiles_role_check;

ALTER TABLE public.admin_profiles
  ADD CONSTRAINT admin_profiles_role_check 
  CHECK (role IN ('super_admin', 'admin', 'training_officer', 'partnerships_officer', 'content_manager'));

-- 2. CREATE ORGANIZATIONS TABLE (for confirmed partners & institutions)
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

-- 3. CREATE TRAINING COHORTS TABLE
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

-- 4. CREATE FOLLOW-UP TASKS TABLE
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
CREATE INDEX IF NOT EXISTS idx_follow_up_tasks_related ON public.follow_up_tasks (related_type, related_id);

CREATE TRIGGER update_follow_up_tasks_modtime
BEFORE UPDATE ON public.follow_up_tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. CREATE INTERNAL NOTES TABLE
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

-- 6. CREATE AUDIT LOGS TABLE
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
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON public.audit_logs (resource_type, resource_id);

-- 7. ROW LEVEL SECURITY (RLS) FOR NEW TABLES
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage organizations" ON public.organizations 
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.training_cohorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active cohorts" ON public.training_cohorts 
  FOR SELECT TO anon, authenticated USING (status IN ('upcoming', 'in_progress'));
CREATE POLICY "Admins manage cohorts" ON public.training_cohorts 
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.follow_up_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage tasks" ON public.follow_up_tasks 
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage notes" ON public.internal_notes 
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins view audit logs" ON public.audit_logs 
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles 
      WHERE id = auth.uid() AND role = 'super_admin' AND is_active = TRUE
    )
  );
CREATE POLICY "Staff insert audit logs" ON public.audit_logs 
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- 8. GRANT PRIVILEGES TO SUPABASE ROLES
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
