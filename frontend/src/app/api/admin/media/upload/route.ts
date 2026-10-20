import { NextRequest } from "next/server";
import { authenticateAdmin } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated || !auth.userId) {
    return errorResponse(auth.error || "Unauthorized.", 401, "UNAUTHORIZED");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return errorResponse("Please select an image to upload.", 400, "INVALID_FILE");
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return errorResponse("Only JPG, PNG, and WebP images are supported.", 400, "INVALID_FILE_TYPE");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return errorResponse("Images must be 5 MB or smaller.", 400, "FILE_TOO_LARGE");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filePath = `news/${crypto.randomUUID()}.${extension}`;
  const supabase = getSupabaseServiceClient();
  const storage = supabase.storage;
  const { data: existingBucket } = await storage.getBucket("public-assets");

  if (!existingBucket) {
    const { error: bucketError } = await storage.createBucket("public-assets", {
      public: true,
      fileSizeLimit: `${MAX_IMAGE_SIZE}B`,
      allowedMimeTypes: [...ALLOWED_IMAGE_TYPES],
    });

    if (bucketError && !bucketError.message.toLowerCase().includes("already exists")) {
      return errorResponse("Image storage is not configured.", 500, "BUCKET_SETUP_FAILED", bucketError.message);
    }
  }

  const { error: uploadError } = await supabase.storage
    .from("public-assets")
    .upload(filePath, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return errorResponse("Failed to upload image.", 500, "UPLOAD_FAILED", uploadError.message);
  }

  const { data: publicUrl } = supabase.storage
    .from("public-assets")
    .getPublicUrl(filePath);

  const { error: mediaError } = await supabase.from("media_files").insert({
    bucket_name: "public-assets",
    file_path: filePath,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
    uploaded_by: auth.userId,
  });

  if (mediaError) {
    return errorResponse("Image uploaded, but its media record could not be saved.", 500, "MEDIA_RECORD_FAILED", mediaError.message);
  }

  return successResponse({ url: publicUrl.publicUrl, path: filePath }, "Image uploaded successfully.");
}
