import { NextRequest } from "next/server";
import { authenticateAdmin } from "@/lib/server/security";
import { successResponse, errorResponse } from "@/lib/server/api-response";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Authentication required.", 401, "UNAUTHORIZED");
  }

  return successResponse({
    user: {
      id: auth.userId,
      email: auth.email,
      fullName: auth.fullName,
      jobTitle: auth.jobTitle,
      role: auth.role,
    },
  });
}
