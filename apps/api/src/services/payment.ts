import crypto from "node:crypto";
import { env, usingRazorpay } from "../env.js";
import { logger } from "../lib/logger.js";

export interface PaymentProvider {
  readonly name: "razorpay" | "stub";
  readonly keyId: string;
  createOrder(amountPaise: number, receipt: string): Promise<{ providerOrderId: string }>;
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
}

/** Stub provider — used when Razorpay keys are absent so the app runs end-to-end locally. */
class StubPaymentProvider implements PaymentProvider {
  readonly name = "stub" as const;
  readonly keyId = "stub_key";
  async createOrder(_amount: number, receipt: string) {
    return { providerOrderId: `order_stub_${receipt}_${crypto.randomBytes(4).toString("hex")}` };
  }
  // In stub mode any non-empty signature is accepted so the client checkout flow completes.
  verifyPaymentSignature(_orderId: string, _paymentId: string, signature: string) {
    return signature.length > 0;
  }
  verifyWebhookSignature(_rawBody: string, signature: string) {
    return signature.length > 0;
  }
}

class RazorpayProvider implements PaymentProvider {
  readonly name = "razorpay" as const;
  readonly keyId = env.RAZORPAY_KEY_ID;
  // Lazily import the SDK so the dependency isn't required in stub mode.
  private clientPromise = import("razorpay").then(
    (m) => new m.default({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET }),
  );

  async createOrder(amountPaise: number, receipt: string) {
    const client = await this.clientPromise;
    const order = await client.orders.create({ amount: amountPaise, currency: "INR", receipt });
    return { providerOrderId: order.id };
  }

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
    const expected = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }

  verifyWebhookSignature(rawBody: string, signature: string) {
    const expected = crypto
      .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }
}

export const paymentProvider: PaymentProvider = usingRazorpay
  ? new RazorpayProvider()
  : new StubPaymentProvider();

logger.info(`💳 Payment provider: ${paymentProvider.name}`);
