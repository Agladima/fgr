import { NextRequest } from "next/server";
import { getSupabasePublicClient, getSupabaseServiceClient, isSupabaseConfigured } from "./supabase";

// ============================================================================
// 1. In-Memory Sliding Window Rate Limiter
// ============================================================================
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale entries periodically (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  const maxAge = 15 * 60 * 1000;
  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < maxAge);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000).unref?.();

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Checks if a client IP is within rate limits for a given endpoint action.
 * Default: 6 requests per 10 minutes (600,000 ms).
 */
export function checkRateLimit(
  clientIp: string,
  actionKey: string,
  limit = 6,
  windowMs = 10 * 60 * 1000
): RateLimitResult {
  const key = `${actionKey}:${clientIp}`;
  const now = Date.now();

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Filter out timestamps outside current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetInSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetInSeconds: Math.max(1, resetInSeconds),
    };
  }

  // Record this request
  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);
  const resetInSeconds = Math.ceil(windowMs / 1000);

  return {
    allowed: true,
    limit,
    remaining,
    resetInSeconds,
  };
}

// ============================================================================
// 2. Duplicate Submission Detection (Cooldown Window)
// ============================================================================
const recentSubmissions = new Map<string, number>();

/**
 * Checks for rapid duplicate submissions from the same user/email.
 * Prevents multiple clicks or spam repetitions within cooldown seconds.
 */
export function checkDuplicateSubmission(
  fingerprint: string,
  cooldownSeconds = 180
): boolean {
  const now = Date.now();
  const lastTime = recentSubmissions.get(fingerprint);

  if (lastTime && now - lastTime < cooldownSeconds * 1000) {
    return true; // Is duplicate
  }

  // Record new submission
  recentSubmissions.set(fingerprint, now);

  // Evict older records when map grows
  if (recentSubmissions.size > 2000) {
    const cutoff = now - 3600 * 1000;
    for (const [key, ts] of recentSubmissions.entries()) {
      if (ts < cutoff) recentSubmissions.delete(key);
    }
  }

  return false;
}

// ============================================================================
// 3. Client IP Resolution
// ============================================================================
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

// ============================================================================
// 4. Honeypot Spam Check
// ============================================================================
export function isSpamSubmission(honeypotField?: string | null): boolean {
  return Boolean(honeypotField && honeypotField.trim().length > 0);
}

// ============================================================================
// 5. Administrator Authentication & Authorization
// ============================================================================
export type PermissionKey =
  | 'registrations:read'
  | 'registrations:write'
  | 'registrations:export'
  | 'partnerships:read'
  | 'partnerships:write'
  | 'enquiries:read'
  | 'enquiries:write'
  | 'programmes:read'
  | 'programmes:write'
  | 'events:read'
  | 'events:write'
  | 'content:read'
  | 'content:write'
  | 'follow_ups:read'
  | 'follow_ups:write'
  | 'reports:read'
  | 'reports:export'
  | 'staff:manage'
  | 'audit_logs:read'
  | 'settings:manage';

const ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  super_admin: [
    'registrations:read',
    'registrations:write',
    'registrations:export',
    'partnerships:read',
    'partnerships:write',
    'enquiries:read',
    'enquiries:write',
    'programmes:read',
    'programmes:write',
    'events:read',
    'events:write',
    'content:read',
    'content:write',
    'follow_ups:read',
    'follow_ups:write',
    'reports:read',
    'reports:export',
    'staff:manage',
    'audit_logs:read',
    'settings:manage',
  ],
  admin: [
    'registrations:read',
    'registrations:write',
    'registrations:export',
    'partnerships:read',
    'partnerships:write',
    'enquiries:read',
    'enquiries:write',
    'programmes:read',
    'programmes:write',
    'events:read',
    'events:write',
    'content:read',
    'content:write',
    'follow_ups:read',
    'follow_ups:write',
    'reports:read',
    'reports:export',
    'audit_logs:read',
  ],
  training_officer: [
    'registrations:read',
    'registrations:write',
    'registrations:export',
    'programmes:read',
    'events:read',
    'follow_ups:read',
    'follow_ups:write',
    'reports:read',
  ],
  partnerships_officer: [
    'partnerships:read',
    'partnerships:write',
    'enquiries:read',
    'enquiries:write',
    'follow_ups:read',
    'follow_ups:write',
    'reports:read',
  ],
  content_manager: [
    'programmes:read',
    'programmes:write',
    'events:read',
    'events:write',
    'content:read',
    'content:write',
    'follow_ups:read',
    'reports:read',
  ],
};

/**
 * Centralized Role-Based Access Control validator
 */
export function hasPermission(role: string, permission: PermissionKey): boolean {
  const allowed = ROLE_PERMISSIONS[role];
  if (!allowed) return false;
  return allowed.includes(permission);
}

export interface AdminAuthResult {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  fullName?: string;
  jobTitle?: string;
  role?: string;
  error?: string;
}

/**
 * Validates admin authentication via:
 * 1. HTTP-only cookie 'fgr_admin_token'
 * 2. Bearer Authorization header
 * 3. Or server ADMIN_API_SECRET_KEY header for local testing/automation
 */
export async function authenticateAdmin(req: NextRequest): Promise<AdminAuthResult> {
  const authHeader = req.headers.get("authorization");
  const cookieToken = req.cookies.get("fgr_admin_token")?.value;
  const adminSecretHeader = req.headers.get("x-admin-key");

  // Check secret key header (useful for automated jobs or local testing)
  const configuredSecret = process.env.ADMIN_API_SECRET_KEY;
  if (
    configuredSecret &&
    adminSecretHeader &&
    adminSecretHeader === configuredSecret
  ) {
    return {
      isAuthenticated: true,
      email: "admin@fgrcdc.org.ng",
      fullName: "System Super Administrator",
      role: "super_admin",
    };
  }

  // Extract token from cookie or Bearer header
  let token = cookieToken;
  if (!token && authHeader?.startsWith("Bearer ")) {
    token = authHeader.replace("Bearer ", "").trim();
  }

  if (!token) {
    return {
      isAuthenticated: false,
      error: "Authentication required. Please sign in to access the CRM.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      isAuthenticated: false,
      error: "Database authentication service is not configured.",
    };
  }

  try {
    const supabase = getSupabasePublicClient();
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return {
        isAuthenticated: false,
        error: "Session expired or invalid authorization token. Please sign in again.",
      };
    }

    const userId = userData.user.id;

    // Check if user is registered in admin_profiles with is_active = true
    const serviceClient = getSupabaseServiceClient();
    const { data: profile, error: profileError } = await serviceClient
      .from("admin_profiles")
      .select("id, email, full_name, job_title, role, is_active")
      .eq("id", userId)
      .eq("is_active", true)
      .single();

    if (profileError || !profile) {
      return {
        isAuthenticated: false,
        error: "Your staff account has been deactivated or does not have authorized CRM privileges.",
      };
    }

    return {
      isAuthenticated: true,
      userId: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      jobTitle: profile.job_title,
      role: profile.role,
    };
  } catch (err) {
    return {
      isAuthenticated: false,
      error: (err as Error).message || "Authentication verification failed.",
    };
  }
}

/**
 * Records an entry into the audit_logs table
 */
export async function recordAuditLog({
  actorId,
  actorEmail,
  actorRole,
  action,
  resourceType,
  resourceId,
  details,
  ipAddress,
}: {
  actorId?: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  details?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  try {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseServiceClient();
    await supabase.from("audit_logs").insert([
      {
        actor_id: actorId || null,
        actor_email: actorEmail,
        actor_role: actorRole,
        action,
        resource_type: resourceType,
        resource_id: resourceId || null,
        details: details || {},
        ip_address: ipAddress || null,
      },
    ]);
  } catch (err) {
    // Non-blocking catch so audit failure never crashes application operation
    console.error("[Audit Log Error]", err);
  }
}

