import crypto from "node:crypto";
import { env, usingSupabaseStorage } from "../env.js";
import { logger } from "../lib/logger.js";

// Upload via the Supabase Storage REST API with fetch — avoids the supabase-js
// client, whose realtime sub-client needs a global WebSocket that Node 20
// (Render) lacks, causing createClient to throw. fetch is built into Node 18+.

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
  if (!usingSupabaseStorage) {
    return { url: `https://picsum.photos/seed/${encodeURIComponent(key)}/900/1200`, key };
  }
  const base = env.SUPABASE_URL.trim().replace(/\/+$/, "");
  const bucket = env.SUPABASE_BUCKET.trim();
  const res = await fetch(`${base}/storage/v1/object/${bucket}/${key}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY.trim()}`,
      "Content-Type": contentType,
      "x-upsert": "false",
      "cache-control": "3600",
    },
    body: buffer,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase upload failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  return { url: `${base}/storage/v1/object/public/${bucket}/${key}`, key };
}

export const storageMode = usingSupabaseStorage ? "supabase" : "stub";
logger.info(`🗂️  Media storage: ${storageMode}`);
