-- ==============================================================================
-- FGR Career Development Center — Migration 00006: CMS Enhancements
-- ==============================================================================

-- 1. ENHANCE PROGRAMMES TABLE
-- Add application lifecycle dates, eligibility, instructions, and registration URL
ALTER TABLE public.programmes
  ADD COLUMN IF NOT EXISTS application_open_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS application_close_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS eligibility TEXT,
  ADD COLUMN IF NOT EXISTS application_instructions TEXT,
  ADD COLUMN IF NOT EXISTS registration_url TEXT;

-- Update status constraint to support full lifecycle
ALTER TABLE public.programmes
  DROP CONSTRAINT IF EXISTS programmes_status_check;

ALTER TABLE public.programmes
  ADD CONSTRAINT programmes_status_check
  CHECK (status IN ('draft', 'published', 'open', 'closing_soon', 'closed', 'completed', 'archived'));

-- 2. ENHANCE EVENTS TABLE
-- Add featured image and enrich status constraint to support draft & archived
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS featured_image_url TEXT;

ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_status_check;

ALTER TABLE public.events
  ADD CONSTRAINT events_status_check
  CHECK (status IN ('draft', 'published', 'upcoming', 'ongoing', 'completed', 'cancelled', 'archived'));

-- 3. ENHANCE RESOURCES TABLE
-- Add cover image, confidential flag, and update status constraint
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_confidential BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.resources
  DROP CONSTRAINT IF EXISTS resources_status_check;

ALTER TABLE public.resources
  ADD CONSTRAINT resources_status_check
  CHECK (status IN ('draft', 'published', 'active', 'archived'));

-- 4. ENHANCE SUCCESS STORIES TABLE
-- Unify fields so role_after, title, and rich story are supported seamlessly
ALTER TABLE public.success_stories
  ADD COLUMN IF NOT EXISTS role_after TEXT,
  ADD COLUMN IF NOT EXISTS story TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT;

-- Allow legacy nullable columns for flexible story creation
ALTER TABLE public.success_stories
  ALTER COLUMN challenge DROP NOT NULL,
  ALTER COLUMN experience DROP NOT NULL,
  ALTER COLUMN outcome DROP NOT NULL,
  ALTER COLUMN quote DROP NOT NULL;

ALTER TABLE public.success_stories
  DROP CONSTRAINT IF EXISTS success_stories_status_check;

ALTER TABLE public.success_stories
  ADD CONSTRAINT success_stories_status_check
  CHECK (status IN ('draft', 'published', 'active', 'archived', 'hidden'));

-- 5. ENHANCE IMPACT METRICS TABLE
-- Add formatting, descriptions, reporting period, and status
ALTER TABLE public.impact_metrics
  ADD COLUMN IF NOT EXISTS display_format TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS reporting_period TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived'));

-- 6. ENHANCE MEDIA FILES TABLE
-- Add alt_text for accessible media library management
ALTER TABLE public.media_files
  ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- 7. RE-VERIFY INDEXES FOR FAST PUBLIC QUERIES
CREATE INDEX IF NOT EXISTS idx_programmes_status_dates ON public.programmes (status, application_close_date);
CREATE INDEX IF NOT EXISTS idx_events_status_date ON public.events (status, event_date);
CREATE INDEX IF NOT EXISTS idx_resources_status_order ON public.resources (status, order_index ASC);
CREATE INDEX IF NOT EXISTS idx_success_stories_status_order ON public.success_stories (status, order_index ASC);
CREATE INDEX IF NOT EXISTS idx_impact_metrics_status_order ON public.impact_metrics (status, order_index ASC);
