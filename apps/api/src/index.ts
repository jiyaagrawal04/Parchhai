import { createApp } from "./app.js";
import { env } from "./env.js";
import { logger } from "./lib/logger.js";

const app = createApp();

const port = env.PORT ?? env.API_PORT;
const server = app.listen(port, () => {
  logger.info(`🪡 Parchhai API listening on port ${port} (/api/v1)`);
});

const shutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down…`);
  server.close(() => process.exit(0));
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
