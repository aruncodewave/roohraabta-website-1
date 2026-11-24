import { toast } from "react-toastify";
import { ApiError } from "@/lib/vfe/api";
import { parseE164Mobile } from "@/lib/vfe/phone";
import type { CountryCodeOption } from "@/lib/vfe/types";

export const EXPLORATORY_STORAGE_KEY = "exploratoryCallLeadData";
export const EXPLORATORY_TRACKING_KEY = "exploratoryCallTrackingParams";
export const MEMBERSHIP_STORAGE_KEY = "applyMembershipData";
export const LEAD_STORAGE_KEY = "leadData";

export function firstQueryValue(...values: Array<string | null>) {
  return values.find((value) => typeof value === "string" && value.trim() !== "") ?? "";
}

export function restoreExpiredMobile(
  error: unknown,
  countryCodes: CountryCodeOption[],
  // react-hook-form's setter is generic per form; this helper is shared by both forms.
  setValue: any,
) {
  if (!(error instanceof ApiError) || error.status !== 403) return null;
  const mobile = error.body.data?.mobile;
  if (!error.body.data?.requiresOTPVerification || !mobile) return null;

  const parsed = parseE164Mobile(mobile, countryCodes);
  if (!parsed) return null;

  setValue("countryCode", parsed.countryCode, { shouldValidate: true });
  setValue("phone", parsed.phone, { shouldValidate: true });
  setValue("phoneOtpVerified", false, { shouldValidate: true });
  return {
    countryCode: parsed.countryCode,
    message: error.body.message || "Mobile verification has expired. Please verify your mobile number again and resubmit.",
  };
}

export function showLeadErrorToast(error: unknown) {
  if (error instanceof ApiError && Array.isArray(error.body.details) && error.body.details.length > 0) {
    error.body.details.forEach((detail) => {
      toast.error(detail);
    });
    return;
  }

  const message =
    error instanceof ApiError
      ? error.body.message || error.message
      : error instanceof Error
        ? error.message
        : "";

  toast.error(message || "An error occurred. Please try again.");
}
