// Vercel serverless entry — wraps the Express app as a function handler.
// (Local/Render use src/index.ts which calls app.listen; serverless must NOT.)
// vercel.json rewrites every path here, so Express still sees the full /api/v1/* URL.
import { createApp } from "../src/app.js";

const app = createApp();

export default app;
