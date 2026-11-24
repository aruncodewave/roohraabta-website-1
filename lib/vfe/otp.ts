import { getVfeApiUrl } from "@/lib/vfe/config";

type OtpResult = {
  success: boolean;
  verificationId?: string;
  error?: string;
};

async function postOtp(path: string, payload: Record<string, string>): Promise<OtpResult & { data?: Record<string, unknown> }> {
  try {
    const response = await fetch(`${getVfeApiUrl()}${path}`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
      statusCode?: number;
      data?: { verificationId?: string; verification_id?: string };
      verificationId?: string;
      verification_id?: string;
    };

    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      return {
        success: false,
        error: data.message || data.error || "Failed to complete OTP request. Please try again.",
      };
    }

    const verificationId =
      data.data?.verificationId ||
      data.data?.verification_id ||
      data.verificationId ||
      data.verification_id ||
      "";

    return { success: true, verificationId, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete OTP request. Please try again.",
    };
  }
}

export function validatePhoneNumber(phone: string) {
  return /^[0-9]{7,15}$/.test(phone);
}

export function sendMobileOtp(mobile: string, countryCode: string, type: string) {
  return postOtp("/api/otp/v3/send-mobile-otp", { mobile, countryCode, type });
}

export function verifyMobileOtp(mobile: string, countryCode: string, otp: string, verificationId: string) {
  if (!verificationId) {
    return Promise.resolve<OtpResult>({
      success: false,
      error: "Something went wrong. Please request a new OTP.",
    });
  }

  return postOtp("/api/otp/v3/verify-mobile-otp", { mobile, countryCode, otp, verificationId });
}
