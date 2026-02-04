import axios from "axios";

const AUTHKEY_GET_API_URL = "https://api.authkey.io/request";

export async function sendSMS(
  mobile: string,
  otp: string,
  options?: {
    senderId?: string;
    countryCode?: string;
  },
): Promise<{ success: boolean; error?: string; logId?: string }> {
  const authkey = process.env.AUTHKEY_API_KEY;
  if (!authkey) throw new Error("Missing AUTHKEY_API_KEY");

  const sid = options?.senderId ?? process.env.AUTHKEY_SENDERID ?? undefined;
  if (!sid) return { success: false, error: "Missing senderId (sid)" };

  const country_code = options?.countryCode ?? "91";

  try {
    const res = await axios.get(AUTHKEY_GET_API_URL, {
      params: {
        authkey,
        mobile,
        country_code,
        sid,
        otp,
      },
      timeout: 5000,
    });

    /**
     * Expected response:
     * {
     *   "LogID": "xxxx",
     *   "Message": "Submitted Successfully"
     * }
     */

    if (res.data?.Message === "Submitted Successfully") {
      return {
        success: true,
        logId: res.data.LogID,
      };
    }

    return {
      success: false,
      error: res.data?.Message ?? "Unknown AuthKey error",
    };
  } catch (err: any) {
    if (err.response) {
      return {
        success: false,
        error: `HTTP ${err.response.status}: ${JSON.stringify(
          err.response.data,
        )}`,
      };
    }

    return { success: false, error: err.message };
  }
}
