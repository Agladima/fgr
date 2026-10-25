import { NextRequest } from "next/server";
import { authenticateAdmin, hasPermission, recordAuditLog, getClientIp } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated || !auth.userId) {
    return errorResponse(auth.error || "Unauthorized.", 401, "UNAUTHORIZED");
  }

  if (!hasPermission(auth.role || "", "content:write")) {
    return errorResponse("Forbidden. Insufficient permissions to upload media.", 403, "FORBIDDEN");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const altText = (formData.get("alt_text") as string) || "";
  const folder = (formData.get("folder") as string) || "uploads";

  if (!(file instanceof File)) {
    return errorResponse("Please select a file to upload.", 400, "INVALID_FILE");
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return errorResponse(
      "Unsupported file format. Allowed formats: JPG, PNG, WebP, SVG, PDF, DOCX, XLSX, PPTX.",
      400,
      "INVALID_FILE_TYPE"
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return errorResponse("Files must be 15 MB or smaller.", 400, "FILE_TOO_LARGE");
  }

  // Safe file naming
  const rawExt = file.name.split(".").pop()?.toLowerCase() || "bin";
  const extension = rawExt.replace(/[^a-z0-9]/g, "");
  const cleanFolder = folder.replace(/[^a-z0-9_-]/gi, "");
  const filePath = `${cleanFolder}/${crypto.randomUUID()}.${extension}`;

  const supabase = getSupabaseServiceClient();
  const storage = supabase.storage;
  const { data: existingBucket } = await storage.getBucket("public-assets");

  if (!existingBucket) {
    const { error: bucketError } = await storage.createBucket("public-assets", {
      public: true,
      fileSizeLimit: `${MAX_FILE_SIZE}B`,
    });

    if (bucketError && !bucketError.message.toLowerCase().includes("already exists")) {
      return errorResponse("Storage bucket setup failed.", 500, "BUCKET_SETUP_FAILED", bucketError.message);
    }
  }

  const { error: uploadError } = await supabase.storage
    .from("public-assets")
    .upload(filePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return errorResponse("Failed to upload file to storage.", 500, "UPLOAD_FAILED", uploadError.message);
  }

  const { data: publicUrl } = supabase.storage
    .from("public-assets")
    .getPublicUrl(filePath);

  const { data: insertedMedia, error: mediaError } = await supabase.from("media_files").insert({
    bucket_name: "public-assets",
    file_path: filePath,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
    alt_text: altText || file.name,
    uploaded_by: auth.userId,
  }).select().single();

  if (mediaError) {
    return errorResponse("File uploaded to storage, but its media record could not be registered.", 500, "MEDIA_RECORD_FAILED", mediaError.message);
  }

  const ip = getClientIp(req);
  await recordAuditLog({
    actorId: auth.userId,
    actorEmail: auth.email || "staff",
    actorRole: auth.role || "staff",
    action: "media.upload",
    resourceType: "media",
    resourceId: insertedMedia.id,
    details: { file_name: file.name, file_size: file.size, mime_type: file.type },
    ipAddress: ip,
  });

  return successResponse({
    id: insertedMedia.id,
    url: publicUrl.publicUrl,
    path: filePath,
    file_name: file.name,
    mime_type: file.type,
    alt_text: altText,
  }, "Media uploaded successfully.");
}
