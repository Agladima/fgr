import { NextRequest } from "next/server";
import { authenticateAdmin } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Unauthorized.", 401, "UNAUTHORIZED");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  const supabase = getSupabaseServiceClient();
  let query = supabase
    .from("media_files")
    .select("id, bucket_name, file_path, file_name, file_size, mime_type, alt_text, uploaded_by, created_at")
    .order("created_at", { ascending: false });

  if (search && search.trim().length > 0) {
    query = query.or(`file_name.ilike.%${search.trim()}%,alt_text.ilike.%${search.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    return errorResponse("Failed to fetch media library records.", 500, "DB_ERROR", error.message);
  }

  // Construct public URLs for media items
  const items = (data || []).map((file) => {
    const { data: pubData } = supabase.storage
      .from(file.bucket_name || "public-assets")
      .getPublicUrl(file.file_path);

    return {
      ...file,
      public_url: pubData?.publicUrl || "",
    };
  });

  return successResponse(items);
}
