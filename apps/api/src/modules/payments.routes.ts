import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/errors.js";
import { logger } from "../lib/logger.js";
import { paymentProvider } from "../services/payment.js";
import { confirmOrder } from "./order.routes.js";

const router = Router();

/**
 * POST /payments/webhook — Razorpay webhook.
 * Verifies the signature against the raw body, then marks the order paid idempotently.
 */
router.post(
  "/webhook",
  asyncHandler(async (req, res) => {
    const signature = req.headers["x-razorpay-signature"] as string | undefined;
    const raw = (req as unknown as { rawBody?: string }).rawBody ?? JSON.stringify(req.body);
    if (!signature || !paymentProvider.verifyWebhookSignature(raw, signature)) {
      logger.warn("Rejected webhook: bad signature");
      return res.status(400).json({ error: { code: "BAD_SIGNATURE", message: "Invalid signature" } });
    }

    const event = req.body as { event?: string; payload?: { payment?: { entity?: { order_id?: string; id?: string } } } };
    const providerOrderId = event.payload?.payment?.entity?.order_id;
    const providerPaymentId = event.payload?.payment?.entity?.id;

    if (event.event === "payment.captured" && providerOrderId) {
      const payment = await prisma.payment.findFirst({ where: { providerOrderId } });
      if (payment && payment.status !== "PAID") {
        await prisma.payment.update({ where: { id: payment.id }, data: { status: "PAID", providerPaymentId, raw: event as never } });
        await prisma.order.update({ where: { id: payment.orderId }, data: { paymentStatus: "PAID" } });
        await confirmOrder(payment.orderId);
        logger.info(`Webhook confirmed order ${payment.orderId}`);
      }
    }
    // Always 200 quickly so Razorpay doesn't retry.
    res.status(200).json({ received: true });
  }),
);

export default router;
