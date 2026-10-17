# FGR Career Development Center — Backend & Database Documentation

This directory contains the database schema, version-controlled migrations, and backend configuration documentation for the **FGR Career Development Center** platform.

---

## 1. Architecture Overview

- **Host Application**: Next.js App Router (located in `/frontend`). Route Handlers (`/src/app/api/...`) host the server-side API endpoints, eliminating the overhead and security surface of an unnecessary separate Node.js/Python server.
- **Database**: Supabase PostgreSQL with Row Level Security (RLS) enabled on all tables.
- **ORM / Client**: `@supabase/supabase-js` with typed database interfaces.
- **Validation**: Strict server-side validation using **Zod**.
- **Email Service**: **Resend** transactional email API.
- **Spam & Security**: In-memory rate limiting, duplicate submission cooldown, honeypot spam protection, and sanitized inputs.

---

## 2. Database Schema & Tables

The database includes 11 core tables:

| Table | Description | RLS Policy |
| :--- | :--- | :--- |
| `admin_profiles` | Administrator accounts linked to `auth.users(id)` with roles (`super_admin`, `admin`, `editor`, `reviewer`) | Admins can view own profile; Super admins manage all |
| `training_registrations` | Admissions and student enrollment applications | Public `INSERT`; Active Admins `SELECT`, `UPDATE`, `DELETE` |
| `contact_enquiries` | General website contact requests and messages | Public `INSERT`; Active Admins `SELECT`, `UPDATE`, `DELETE` |
| `partnership_enquiries` | Institutional, funding, and corporate collaboration requests | Public `INSERT`; Active Admins `SELECT`, `UPDATE`, `DELETE` |
| `programmes` | The 5 strategic training pillars and detailed curriculum areas | Public `SELECT` (published); Admins full access |
| `news_articles` | News, announcements, cohort openings, press releases | Public `SELECT` (published); Admins full access |
| `events` | Workshops, graduation ceremonies, bootcamps, conferences | Public `SELECT` (active); Admins full access |
| `resources` | Downloadable toolkits, CV guides, SME templates, publications | Public `SELECT` (active); Admins full access |
| `impact_metrics` | Quantified outcomes (People trained, businesses supported, etc.) | Public `SELECT`; Admins full access |
| `success_stories` | Testimonials and case studies of programme participants | Public `SELECT` (active); Admins full access |
| `media_files` | Uploaded assets and documents metadata in Supabase Storage | Public `SELECT`; Admins full access |

---

## 3. Migration Files

Migrations are stored chronologically in `backend/migrations/`:

1. [`00001_initial_schema.sql`](file:///c:/Users/Austi/Desktop/FGR/backend/migrations/00001_initial_schema.sql): Creates UUID extensions, trigger functions, 11 tables, constraints, and indexes.
2. [`00002_rls_policies.sql`](file:///c:/Users/Austi/Desktop/FGR/backend/migrations/00002_rls_policies.sql): Enables RLS on all tables and creates zero-trust security policies and the `is_admin()` security definer function.
3. [`00003_seed_data.sql`](file:///c:/Users/Austi/Desktop/FGR/backend/migrations/00003_seed_data.sql): Seeds initial data for programmes, impact metrics, news articles, success stories, and resources.

---

## 4. How to Apply Migrations to Supabase

### Option A: Via Supabase Dashboard (SQL Editor)
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project and navigate to the **SQL Editor**.
3. Copy and run the contents of `00001_initial_schema.sql`, followed by `00002_rls_policies.sql`, and then `00003_seed_data.sql`.
4. (Or run the single combined file `backend/schema.sql`).

### Option B: Via Supabase CLI (Local or Remote Link)
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your local project to your remote Supabase project
supabase link --project-ref <your-project-id>

# Push migrations to the remote database
supabase db push
```

---

## 5. Environment Variables Configuration

Copy `.env.example` in `/frontend/.env.example` to `/frontend/.env.local` and provide your actual Supabase and Resend keys:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Resend Email Integration
RESEND_API_KEY=re_123456789...
RESEND_FROM_EMAIL=FGR Career Development Center <noreply@fgrcareer.org>
STAFF_NOTIFICATION_EMAIL=contact@fgrcareer.org

# Rate Limiting & Admin Security
ADMIN_API_SECRET_KEY=your_secure_admin_passphrase_here
```

> **Security Rule**: `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_API_SECRET_KEY` must **NEVER** have the `NEXT_PUBLIC_` prefix and must never be committed or imported into client components.
