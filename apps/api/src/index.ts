import { createApp } from "./app.js";
import { env } from "./env.js";
import { logger } from "./lib/logger.js";

const app = createApp();

const server = app.listen(env.API_PORT, () => {
  logger.info(`🪡 Parchhai API listening on http://localhost:${env.API_PORT}/api/v1`);
});

const shutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down…`);
  server.close(() => process.exit(0));
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
