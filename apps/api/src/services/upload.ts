import crypto from "node:crypto";
import { env, usingR2 } from "../env.js";
import { logger } from "../lib/logger.js";

export interface PresignResult {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export interface Uploader {
  readonly name: "r2" | "stub";
  presignUpload(filename: string, contentType: string): Promise<PresignResult>;
}

const keyFor = (filename: string) => {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `uploads/${crypto.randomBytes(8).toString("hex")}-${safe}`;
};

/** Stub uploader returns a fake signed URL so the admin UI flow works without R2 keys. */
class StubUploader implements Uploader {
  readonly name = "stub" as const;
  async presignUpload(filename: string, _contentType: string) {
    const key = keyFor(filename);
    return {
      uploadUrl: `http://localhost:${env.API_PORT}/api/v1/admin/uploads/stub-put/${encodeURIComponent(key)}`,
      publicUrl: `https://picsum.photos/seed/${encodeURIComponent(key)}/900/1200`,
      key,
    };
  }
}

class R2Uploader implements Uploader {
  readonly name = "r2" as const;
  private clientPromise = import("@aws-sdk/client-s3").then(
    (m) =>
      new m.S3Client({
        region: "auto",
        endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        },
      }),
  );

  async presignUpload(filename: string, contentType: string) {
    const key = keyFor(filename);
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
    const client = await this.clientPromise;
    const command = new PutObjectCommand({ Bucket: env.R2_BUCKET, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 });
    return { uploadUrl, publicUrl: `${env.R2_PUBLIC_URL}/${key}`, key };
  }
}

export const uploader: Uploader = usingR2 ? new R2Uploader() : new StubUploader();
logger.info(`📦 Uploader: ${uploader.name}`);
