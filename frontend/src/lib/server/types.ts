/**
 * Database type definitions for FGR Career Development Center
 */

export type RegistrationStatus =
  | 'pending'
  | 'reviewed'
  | 'accepted'
  | 'waitlisted'
  | 'rejected'
  | 'archived';

export interface TrainingRegistration {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  age_range: string;
  location: string;
  programme: string;
  current_status: string;
  other_occupation?: string | null;
  previous_training?: string | null;
  training_preference: string;
  referral_source: string;
  other_referral?: string | null;
  additional_info?: string | null;
  status: RegistrationStatus;
  admin_notes?: string | null;
  ip_address?: string | null;
  created_at: string;
  updated_at: string;
}

export type ContactEnquiryStatus = 'unread' | 'in_review' | 'responded' | 'archived';

export interface ContactEnquiry {
  id: string;
  name: string;
  organisation?: string | null;
  email: string;
  phone: string;
  interests: string[];
  other_interest?: string | null;
  message: string;
  status: ContactEnquiryStatus;
  admin_notes?: string | null;
  responded_at?: string | null;
  responded_by?: string | null;
  ip_address?: string | null;
  created_at: string;
  updated_at: string;
}

export type PartnershipStatus =
  | 'new'
  | 'reviewing'
  | 'contacted'
  | 'partnered'
  | 'declined'
  | 'archived';

export interface PartnershipEnquiry {
  id: string;
  organisation_name: string;
  contact_person: string;
  email: string;
  phone: string;
  organisation_type: string;
  other_org_type?: string | null;
  interests: string[];
  other_interest_details?: string | null;
  message: string;
  status: PartnershipStatus;
  admin_notes?: string | null;
  ip_address?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Programme {
  id: string;
  slug: string;
  title: string;
  pillar_number: number;
  pillar_name: string;
  summary: string;
  description?: string | null;
  areas: string[];
  outcomes: string[];
  target_audience?: string | null;
  duration?: string | null;
  delivery_modalities: string[];
  order_index: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content?: string | null;
  published_at: string;
  author: string;
  featured_image_url?: string | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  category: string;
  description: string;
  event_date: string;
  location: string;
  registration_url?: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  file_url?: string | null;
  external_link?: string | null;
  format: string;
  order_index: number;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ImpactMetric {
  id: string;
  metric_key: string;
  label: string;
  value: string;
  order_index: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface SuccessStory {
  id: string;
  name: string;
  programme_name: string;
  challenge: string;
  experience: string;
  outcome: string;
  quote: string;
  avatar_url?: string | null;
  order_index: number;
  status: 'active' | 'hidden';
  created_at: string;
  updated_at: string;
}

export type StaffRole =
  | 'super_admin'
  | 'admin'
  | 'training_officer'
  | 'partnerships_officer'
  | 'content_manager';

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskRelatedType = 'registration' | 'partnership' | 'enquiry' | 'programme' | 'event' | 'general';

export interface FollowUpTask {
  id: string;
  title: string;
  description?: string | null;
  assigned_to?: string | null;
  assigned_to_profile?: AdminProfile | null;
  created_by?: string | null;
  created_by_profile?: AdminProfile | null;
  related_type: TaskRelatedType;
  related_id?: string | null;
  due_date?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InternalNote {
  id: string;
  author_id?: string | null;
  author_name: string;
  record_type: 'registration' | 'partnership' | 'enquiry' | 'task' | 'general';
  record_id: string;
  content: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string | null;
  actor_email: string;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  details?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  partnership_status: 'prospect' | 'in_discussion' | 'confirmed' | 'inactive';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrainingCohort {
  id: string;
  programme_id?: string | null;
  name: string;
  cohort_code?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  capacity: number;
  enrolled_count: number;
  delivery_mode: 'In-Person' | 'Online' | 'Hybrid';
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

