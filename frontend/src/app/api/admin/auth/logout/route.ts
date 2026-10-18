import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin, recordAuditLog, getClientIp } from "@/lib/server/security";
import { getSupabasePublicClient } from "@/lib/server/supabase";

export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  const ip = getClientIp(req);

  if (auth.isAuthenticated && auth.userId) {
    await recordAuditLog({
      actorId: auth.userId,
      actorEmail: auth.email || "unknown",
      actorRole: auth.role || "unknown",
      action: "auth.logout",
      resourceType: "session",
      resourceId: auth.userId,
      ipAddress: ip,
    });
  }

  try {
    const supabase = getSupabasePublicClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore signout error if session already revoked
  }

  const response = NextResponse.json({
    success: true,
    message: "Signed out successfully.",
  });

  response.cookies.set("fgr_admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
