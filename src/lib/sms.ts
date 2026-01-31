const SMSZONE_API_URL = "http://www.smszone.in/sendsms.asp";

export interface SendSMSOptions {
  /** Comma-separated mobile numbers or array of numbers */
  numbers: string | string[];
  /** The message to send */
  message: string;
  /** Optional: SenderID/HeaderID (uses SMSZONE_SENDERID from env if not set) */
  senderId?: string;
  /** Optional: Future date/time for scheduled send (format: DD/MM/YY) */
  scheduleDate?: string;
  /** Optional: DLT Template Id for India */
  tid?: string;
}

function getEnvOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Send SMS via SMSZone API.
 * Requires SMSZONE_USERNAME and SMSZONE_PASSWORD in .env.
 * Optional: SMSZONE_SENDERID for default sender ID.
 */
export async function sendSMS(
  numbersOrPhone: string | string[],
  message: string,
  options?: Partial<Omit<SendSMSOptions, "numbers" | "message">>
): Promise<{ success: boolean; error?: string }> {
  const username = getEnvOrThrow("SMSZONE_USERNAME");
  const password = getEnvOrThrow("SMSZONE_PASSWORD");
  const senderId =
    options?.senderId ?? process.env.SMSZONE_SENDERID ?? undefined;

  const numbers =
    typeof numbersOrPhone === "string"
      ? numbersOrPhone
      : numbersOrPhone.join(",");

  const params = new URLSearchParams({
    page: "SendSmsBulk",
    username,
    password,
    number: numbers,
    message,
  });

  if (senderId) {
    params.set("senderid", senderId);
  }
  if (options?.scheduleDate) {
    params.set("scheduledate", options.scheduleDate);
  }
  if (options?.tid) {
    params.set("tid", options.tid);
  }

  const url = `${SMSZONE_API_URL}?${params.toString()}`;

  try {
    const res = await fetch(url);
    const text = await res.text();

    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}: ${text}` };
    }

    // SMSZone may return success/failure in response body; adjust based on actual API response
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
