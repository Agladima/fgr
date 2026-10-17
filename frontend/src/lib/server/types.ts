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

export interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'editor' | 'reviewer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
