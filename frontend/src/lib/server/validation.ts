import { z } from "zod";

/**
 * Common regex for phone validation: allows leading +, 7 to 15 digits
 */
const phoneRegex = /^\+?[0-9]{7,15}$/;

/**
 * Clean and normalize phone string
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\.]/g, "").trim();
}

/**
 * Sanitize text inputs: strip harmful HTML/script tags and normalize whitespace
 */
export function sanitizeText(input?: string | null): string {
  if (!input) return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

// ============================================================================
// 1. Training Registration Validation Schema
// ============================================================================
export const TrainingRegistrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters long.")
    .max(100, "Full name cannot exceed 100 characters."),
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .refine((val) => phoneRegex.test(val), {
      message: "Please enter a valid phone number with 7 to 15 digits.",
    }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address."),
  age: z
    .string()
    .trim()
    .min(1, "Please select your age range."),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters long.")
    .max(120, "Location cannot exceed 120 characters."),
  programme: z
    .string()
    .trim()
    .min(2, "Please select a programme."),
  currentStatus: z
    .string()
    .trim()
    .min(2, "Please select your current status."),
  otherOccupation: z
    .string()
    .trim()
    .max(150, "Occupation description cannot exceed 150 characters.")
    .optional()
    .nullable(),
  previousTraining: z
    .string()
    .trim()
    .max(250, "Previous training description cannot exceed 250 characters.")
    .optional()
    .nullable(),
  trainingPreference: z
    .string()
    .trim()
    .optional()
    .default("Admin Assigned"),
  referralSource: z
    .string()
    .trim()
    .default("Social Media"),
  otherReferral: z
    .string()
    .trim()
    .max(150, "Referral details cannot exceed 150 characters.")
    .optional()
    .nullable(),
  additionalInfo: z
    .string()
    .trim()
    .max(2000, "Additional information cannot exceed 2000 characters.")
    .optional()
    .nullable(),
  // Honeypot field for bot spam detection
  hp_field: z.string().optional(),
});

export type TrainingRegistrationInput = z.infer<typeof TrainingRegistrationSchema>;

// ============================================================================
// 2. Contact Enquiry Validation Schema
// ============================================================================
export const ContactEnquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters long.")
    .max(100, "Full name cannot exceed 100 characters."),
  organisation: z
    .string()
    .trim()
    .max(150, "Organisation name cannot exceed 150 characters.")
    .optional()
    .nullable(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address."),
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .refine((val) => phoneRegex.test(val), {
      message: "Please enter a valid phone number with 7 to 15 digits.",
    }),
  interests: z
    .array(z.string().trim())
    .default([]),
  otherInterest: z
    .string()
    .trim()
    .max(200, "Other interest description cannot exceed 200 characters.")
    .optional()
    .nullable(),
  message: z
    .string()
    .trim()
    .min(10, "Your message must contain at least 10 characters.")
    .max(3000, "Your message cannot exceed 3000 characters."),
  hp_field: z.string().optional(),
});

export type ContactEnquiryInput = z.infer<typeof ContactEnquirySchema>;

// ============================================================================
// 3. Partnership Enquiry Validation Schema
// ============================================================================
export const PartnershipEnquirySchema = z.object({
  organisationName: z
    .string()
    .trim()
    .min(2, "Organisation name must be at least 2 characters long.")
    .max(150, "Organisation name cannot exceed 150 characters."),
  contactPerson: z
    .string()
    .trim()
    .min(2, "Contact person name must be at least 2 characters long.")
    .max(120, "Contact person name cannot exceed 120 characters."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address."),
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .refine((val) => phoneRegex.test(val), {
      message: "Please enter a valid phone number with 7 to 15 digits.",
    }),
  organisationType: z
    .string()
    .trim()
    .min(2, "Please select an organisation type."),
  otherOrgType: z
    .string()
    .trim()
    .max(150, "Organisation type description cannot exceed 150 characters.")
    .optional()
    .nullable(),
  interests: z
    .array(z.string().trim())
    .min(1, "Please select at least one area of partnership interest."),
  otherInterestDetails: z
    .string()
    .trim()
    .max(300, "Other interest details cannot exceed 300 characters.")
    .optional()
    .nullable(),
  message: z
    .string()
    .trim()
    .min(15, "Proposed collaboration details must contain at least 15 characters.")
    .max(4000, "Message cannot exceed 4000 characters."),
  hp_field: z.string().optional(),
});

export type PartnershipEnquiryInput = z.infer<typeof PartnershipEnquirySchema>;

// ============================================================================
// 4. Status Update Schemas for Admin CRM
// ============================================================================
export const UpdateRegistrationStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'accepted', 'waitlisted', 'rejected', 'archived']),
  admin_notes: z.string().trim().max(2000).optional(),
});

export const UpdateContactStatusSchema = z.object({
  status: z.enum(['unread', 'in_review', 'responded', 'archived']),
  admin_notes: z.string().trim().max(2000).optional(),
});

export const UpdatePartnershipStatusSchema = z.object({
  status: z.enum(['new', 'reviewing', 'contacted', 'partnered', 'declined', 'archived']),
  admin_notes: z.string().trim().max(2000).optional(),
});
