import crypto from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, usingSupabaseStorage } from "../env.js";
import { logger } from "../lib/logger.js";

// Lazily create the Supabase client so a bad/missing config can never crash the
// whole API at startup — uploads just fall back to the stub instead.
let cached: SupabaseClient | null | undefined;

function getClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  if (!usingSupabaseStorage) {
    cached = null;
    return cached;
  }
  try {
    cached = createClient(env.SUPABASE_URL.trim(), env.SUPABASE_SERVICE_ROLE_KEY.trim(), {
      auth: { persistSession: false },
    });
  } catch (e) {
    logger.error(`Supabase Storage init failed (uploads will use stub): ${(e as Error).message}`);
    cached = null;
  }
  return cached;
}

const keyFor = (filename: string) => {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
  return `uploads/${crypto.randomBytes(8).toString("hex")}-${safe}`;
};

export interface UploadResult {
  url: string;
  key: string;
}

/** Uploads a file buffer to Supabase Storage and returns its public URL.
 *  Falls back to a deterministic placeholder when Supabase isn't configured. */
export async function uploadMedia(buffer: Buffer, filename: string, contentType: string): Promise<UploadResult> {
  const key = keyFor(filename);
  const supabase = getClient();
  if (!supabase) {
    return { url: `https://picsum.photos/seed/${encodeURIComponent(key)}/900/1200`, key };
  }
  const { error } = await supabase.storage.from(env.SUPABASE_BUCKET.trim()).upload(key, buffer, { contentType, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabase.storage.from(env.SUPABASE_BUCKET.trim()).getPublicUrl(key);
  return { url: data.publicUrl, key };
}

export const storageMode = usingSupabaseStorage ? "supabase" : "stub";
logger.info(`🗂️  Media storage: ${storageMode}`);
