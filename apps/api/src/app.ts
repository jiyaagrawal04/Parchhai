import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { env } from "./env.js";
import { logger } from "./lib/logger.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import api from "./router.js";

const allowedOrigins = env.WEB_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);

/** CORS policy: any origin in dev; in prod allow WEB_ORIGIN + any *.vercel.app / *.onrender.com host. */
const corsOrigin: cors.CorsOptions["origin"] = (origin, cb) => {
  if (!origin) return cb(null, true); // curl / same-origin / server-to-server
  if (env.NODE_ENV === "development" || env.WEB_ORIGIN === "*") return cb(null, true);
  if (allowedOrigins.includes(origin)) return cb(null, true);
  try {
    const host = new URL(origin).hostname;
    if (/\.(vercel\.app|onrender\.com)$/.test(host)) return cb(null, true);
  } catch {
    /* malformed origin */
  }
  return cb(new Error(`Origin ${origin} not allowed by CORS`));
};

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: corsOrigin, credentials: true }));
  // Capture the raw body so the Razorpay webhook can verify its signature.
  app.use(
    express.json({
      limit: "1mb",
      verify: (req, _res, buf) => {
        (req as unknown as { rawBody?: string }).rawBody = buf.toString("utf8");
      },
    }),
  );
  app.use(cookieParser());
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === "/api/v1/health" } }));
  app.use("/api/v1", apiLimiter, api);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
