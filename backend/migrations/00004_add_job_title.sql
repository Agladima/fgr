-- ==============================================================================
-- FGR Career Development Center — Migration 00004: Add job_title to admin_profiles
-- ==============================================================================

ALTER TABLE public.admin_profiles
  ADD COLUMN IF NOT EXISTS job_title TEXT;
