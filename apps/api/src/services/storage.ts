import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { env, usingSupabaseStorage } from "../env.js";
import { logger } from "../lib/logger.js";

const supabase = usingSupabaseStorage
  ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

const keyFor = (filename: string) => {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  return `uploads/${crypto.randomBytes(8).toString("hex")}-${safe}`;
};

export interface UploadResult {
  url: string;
  key: string;
}

/** Uploads a file buffer to Supabase Storage and returns its public URL.
 *  Falls back to a deterministic placeholder when Supabase keys aren't set (local/dev). */
export async function uploadMedia(buffer: Buffer, filename: string, contentType: string): Promise<UploadResult> {
  const key = keyFor(filename);
  if (!supabase) {
    return { url: `https://picsum.photos/seed/${encodeURIComponent(key)}/900/1200`, key };
  }
  const { error } = await supabase.storage.from(env.SUPABASE_BUCKET).upload(key, buffer, { contentType, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from(env.SUPABASE_BUCKET).getPublicUrl(key);
  return { url: data.publicUrl, key };
}

export const storageMode = usingSupabaseStorage ? "supabase" : "stub";
logger.info(`🗂️  Media storage: ${storageMode}`);
