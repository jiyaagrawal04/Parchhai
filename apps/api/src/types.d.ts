import type { AccessTokenPayload } from "@parchhai/types";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
      /** Resolved guest cart session id (from cookie/header). */
      cartSessionId?: string;
    }
  }
}

export {};
