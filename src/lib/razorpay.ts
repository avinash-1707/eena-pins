import crypto from "node:crypto";
import Razorpay from "razorpay";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

export function getRazorpayInstance(): Razorpay {
  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function getRazorpayKeyId(): string {
  if (!keyId) throw new Error("RAZORPAY_KEY_ID must be set");
  return keyId;
}

/** Create a Razorpay Order. Amount in paise. Returns Razorpay order id. */
export async function createRazorpayOrder(params: {
  amount: number;
  currency?: string;
  receipt: string;
}): Promise<string> {
  const instance = getRazorpayInstance();
  const order = await new Promise<{ id: string }>((resolve, reject) => {
    instance.orders.create(
      {
        amount: params.amount,
        currency: params.currency ?? "INR",
        receipt: params.receipt,
      },
      (err: unknown, order: { id: string }) => {
        if (err) reject(err instanceof Error ? err : new Error(String(err)));
        else resolve(order);
      }
    );
  });
  return order.id;
}

/** Verify payment signature from frontend. Payload = order_id|payment_id, HMAC-SHA256 with key_secret. */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!keySecret) throw new Error("RAZORPAY_KEY_SECRET must be set");
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", keySecret).update(payload).digest("hex");
  return expected === signature;
}

/** Verify webhook signature. Uses RAZORPAY_WEBHOOK_SECRET. */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

/** Create refund for a payment. Amount in paise; omit for full refund. */
export async function createRefund(
  razorpayPaymentId: string,
  amountPaise?: number
): Promise<{ id: string }> {
  const instance = getRazorpayInstance();
  const params = amountPaise != null ? { amount: amountPaise } : {};
  const refund = await new Promise<{ id: string }>((resolve, reject) => {
    (instance.payments as { refund: (id: string, params: { amount?: number }, cb: (err: Error | null, data: { id: string }) => void) => void })
      .refund(razorpayPaymentId, params, (err: Error | null, data: { id: string }) => {
        if (err) reject(err);
        else resolve(data);
      });
  });
  return refund;
}
