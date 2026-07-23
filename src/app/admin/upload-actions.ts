"use server";

/* Admin image upload to the public Supabase Storage bucket. Requires a valid
   admin session; validates type and size; returns the public CDN URL that the
   editors then save into their content. */

import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/adminAuth.server";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  if (!(await isAdminRequest())) return { ok: false, error: "Not logged in." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file received." };
  const ext = ALLOWED[file.type];
  if (!ext) return { ok: false, error: "Please choose a JPG, PNG, WebP or AVIF image." };
  if (file.size > MAX_BYTES) return { ok: false, error: "Image is too large (max 8 MB)." };

  const cleanName = (file.name.replace(/\.[^.]*$/, "") || "image")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const path = `uploads/${Date.now()}-${cleanName}.${ext}`;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.storage
      .from("images")
      .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (error) {
      console.error("uploadImage:", error.message);
      return { ok: false, error: "Upload failed. Please try again." };
    }
    const { data } = supabase.storage.from("images").getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (e) {
    console.error("uploadImage:", e instanceof Error ? e.message : e);
    return { ok: false, error: "Upload failed. Please try again." };
  }
}
