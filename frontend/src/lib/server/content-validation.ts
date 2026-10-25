import { z } from "zod";

/**
 * Normalizes text to a clean URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

// 1. News Articles Schema
export const NewsArticleSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, "Title must be at least 3 characters."),
  slug: z.string().min(2, "Slug is required.").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and dashes."),
  category: z.string().min(2, "Category is required."),
  summary: z.string().min(10, "Summary must be at least 10 characters."),
  content: z.string().optional().nullable(),
  author: z.string().default("FGR Communications"),
  featured_image_url: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  published_at: z.string().optional().nullable(),
});

// 2. Programmes Schema
export const ProgrammeSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, "Title must be at least 3 characters."),
  slug: z.string().min(2, "Slug is required.").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and dashes."),
  pillar_number: z.coerce.number().int().min(1).max(20).default(1),
  pillar_name: z.string().default("Strategic Pillar"),
  summary: z.string().min(10, "Summary must be at least 10 characters."),
  description: z.string().optional().nullable(),
  areas: z.array(z.string()).default([]),
  outcomes: z.array(z.string()).default([]),
  target_audience: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  delivery_modalities: z.array(z.string()).default([]),
  application_open_date: z.string().optional().nullable(),
  application_close_date: z.string().optional().nullable(),
  eligibility: z.string().optional().nullable(),
  application_instructions: z.string().optional().nullable(),
  registration_url: z.string().optional().nullable(),
  order_index: z.coerce.number().int().default(0),
  status: z.enum(["draft", "published", "open", "closing_soon", "closed", "completed", "archived"]).default("draft"),
});

// 3. Events Schema
export const EventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, "Event title must be at least 3 characters."),
  category: z.string().min(2, "Category is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  event_date: z.string().min(1, "Event date and time is required."),
  location: z.string().min(2, "Location or online venue is required."),
  registration_url: z.string().optional().nullable(),
  featured_image_url: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "upcoming", "ongoing", "completed", "cancelled", "archived"]).default("upcoming"),
});

// 4. Resources Schema
export const ResourceSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, "Resource title is required."),
  category: z.string().min(2, "Category is required."),
  description: z.string().min(5, "Description is required."),
  file_url: z.string().optional().nullable(),
  external_link: z.string().optional().nullable(),
  cover_image_url: z.string().optional().nullable(),
  format: z.string().default("PDF"),
  is_confidential: z.boolean().default(false),
  order_index: z.coerce.number().int().default(0),
  status: z.enum(["draft", "published", "active", "archived"]).default("active"),
});

// 5. Success Stories Schema
export const SuccessStorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Participant name is required."),
  title: z.string().optional().nullable(),
  programme_name: z.string().min(2, "Programme name is required."),
  role_after: z.string().optional().nullable(),
  quote: z.string().optional().nullable(),
  story: z.string().optional().nullable(),
  challenge: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  outcome: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
  order_index: z.coerce.number().int().default(0),
  status: z.enum(["draft", "published", "active", "archived", "hidden"]).default("active"),
});

// 6. Impact Metrics Schema
export const ImpactMetricSchema = z.object({
  id: z.string().uuid().optional(),
  metric_key: z.string().min(2, "Metric key is required.").regex(/^[a-z0-9_]+$/, "Metric key should be lowercase alphanumeric with underscores."),
  label: z.string().min(2, "Label is required."),
  value: z.string().min(1, "Metric value is required."),
  display_format: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  reporting_period: z.string().optional().nullable(),
  is_verified: z.boolean().default(true),
  order_index: z.coerce.number().int().default(0),
  status: z.enum(["draft", "published", "archived"]).default("published"),
});

export const CONTENT_SCHEMAS: Record<string, z.ZodTypeAny> = {
  news: NewsArticleSchema,
  programmes: ProgrammeSchema,
  events: EventSchema,
  resources: ResourceSchema,
  stories: SuccessStorySchema,
  impact: ImpactMetricSchema,
};
