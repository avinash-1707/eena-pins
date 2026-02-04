import axios from "axios";

const AUTHKEY_REST_API_URL =
  "https://console.authkey.io/restapi/requestjson.php";

export async function sendSMS(
  numbersOrPhone: string | string[],
  message: string,
  options?: {
    senderId?: string;
    countryCode?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.AUTHKEY_API_KEY;
  if (!apiKey) throw new Error("Missing AUTHKEY_API_KEY");

  const sid =
    options?.senderId ?? process.env.AUTHKEY_SENDERID ?? undefined;
  if (!sid) return { success: false, error: "Missing senderId (sid)" };

  const country_code = options?.countryCode ?? "91";

  const mobile =
    typeof numbersOrPhone === "string"
      ? numbersOrPhone
      : numbersOrPhone.join(",");

  try {
    const res = await axios.post(
      AUTHKEY_REST_API_URL,
      {
        country_code,
        mobile,
        sid,
        message, // IMPORTANT: REST API expects "message"
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${apiKey}`,
        },
        timeout: 5000,
      }
    );

    /**
     * AuthKey REST API response example:
     * {
     *   "message": "SMS sent successfully",
     *   "type": "success"
     * }
     */

    if (res.data?.type === "success") {
      return { success: true };
    }

    return {
      success: false,
      error: res.data?.message ?? "Unknown AuthKey error",
    };
  } catch (err: any) {
    if (err.response) {
      return {
        success: false,
        error: `HTTP ${err.response.status}: ${JSON.stringify(
          err.response.data
        )}`,
      };
    }

    return { success: false, error: err.message };
  }
}
