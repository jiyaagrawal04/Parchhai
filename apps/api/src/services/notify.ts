import { Prisma } from "@parchhai/db";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";

type Channel = "email" | "sms" | "push";

/**
 * Notification service. Logs to NotificationLog and (in dev/stub mode) prints to console.
 * Wire Resend / MSG91 here when keys are present.
 */
export const notify = {
  async send(channel: Channel, target: string, template: string, payload?: Record<string, unknown>) {
    logger.info({ channel, target, template, payload }, "📨 notification");
    await prisma.notificationLog.create({
      data: { channel, target, template, payload: (payload ?? {}) as Prisma.InputJsonValue, status: "sent" },
    });
  },

  /** Returns the generated OTP code (caller persists the hash). Logs it in dev. */
  async sendOtp(target: string, code: string) {
    logger.info(`🔐 OTP for ${target}: ${code}`);
    await this.send("sms", target, "otp", { codeMasked: "••••••" });
  },

  async orderPlaced(email: string | null, orderNumber: string) {
    if (email) await this.send("email", email, "order_placed", { orderNumber });
  },

  async orderStatus(email: string | null, orderNumber: string, status: string) {
    if (email) await this.send("email", email, "order_status", { orderNumber, status });
  },
};
