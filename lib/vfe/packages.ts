import { ApiError } from "@/lib/vfe/api";
import { PLATFORM_ID, getVfeApiUrl } from "@/lib/vfe/config";

export const SELECTED_PACKAGE_KEY = "selectedPackage";

export type PackageFee = {
  currency?: string;
  membershipFee?: number;
  tax?: number;
  successFee?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
};

export type WebsitePackage = {
  id: string;
  name: string;
  isActive?: boolean;
  showOnWebsite?: boolean;
  duration?: string;
  membershipFees?: PackageFee[];
  additionalInfo?: {
    profileVolume?: string;
  };
};

export type MembershipApplication = {
  first_name?: string;
  last_name?: string;
  email_id?: string;
  country?: string;
  state?: string;
  gender?: string;
  mobile?: string;
  phone_number?: string;
  dateOfBirth?: string;
  date_of_birth?: string;
};

export type LeadRecord = {
  leadId?: string;
};

type PackageListResponse = {
  success?: boolean;
  message?: string;
  data?: {
    data?: WebsitePackage[];
  };
};

type DocuSignResponse = {
  message?: string;
  data?: string;
};

type PurchaseResponse = {
  message?: string;
  data?: {
    paymentUrl?: string;
  };
};

async function readBody(response: Response) {
  return (await response.json().catch(() => ({}))) as {
    message?: string;
    details?: string[];
    data?: unknown;
  };
}

export function formatPackagePriceDetailed(
  membershipFees: PackageFee[] = [],
  country = "",
  userState = "",
  duration = "",
) {
  const preferredCurrency = country && !/india/i.test(country) ? "USD" : "INR";
  const fee = membershipFees.find((item) => item.currency === preferredCurrency) || membershipFees[0];
  if (!fee) return "Price Not Available";

  const currency = fee.currency || "USD";
  const membershipFee = fee.membershipFee || 0;
  let taxAmount = 0;

  if (currency === "INR") {
    if (userState && userState.toLowerCase() === "delhi") {
      const splitTax = (fee.cgst || 0) + (fee.sgst || 0);
      taxAmount = splitTax || fee.tax || 0;
    } else {
      taxAmount = fee.igst || fee.tax || 0;
    }
  } else {
    taxAmount = fee.tax || 0;
  }

  const totalAmount = membershipFee + taxAmount;
  const isUntilAlliance = String(duration).toLowerCase() === "until alliance";
  const durationText = isUntilAlliance ? "Until alliance" : duration === "12" ? "1 year" : `${duration} months`;
  const formattedTotal = totalAmount.toLocaleString("en-IN");
  const gstNote = currency === "INR" ? "(Inclusive of GST)" : "";

  return `${durationText} @ ${currency} ${formattedTotal} ${gstNote}`.trim();
}

export async function fetchWebsitePackages() {
  const search = new URLSearchParams({
    includeSignature: "true",
    isMigrated: "false",
    showOnWebsite: "true",
    isPublished: "true",
    isActive: "true",
    sortByHierarchy: "true",
    platformId: PLATFORM_ID,
  });

  const response = await fetch(`${getVfeApiUrl()}/api/packages?${search.toString()}`, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  const body = (await readBody(response)) as PackageListResponse;

  if (!response.ok) {
    throw new ApiError(response.status, { message: body.message }, body.message || "Failed to fetch packages.");
  }

  const packages = Array.isArray(body.data?.data) ? body.data.data : [];
  return packages.filter((pkg) => pkg.isActive && pkg.showOnWebsite === true && pkg.id && pkg.name);
}

export async function startMembershipAgreement(payload: {
  name: string;
  email: string;
  clientId?: string;
  membershipId: string;
  currency: string;
  returnUrl?: string;
  failureUrl?: string;
}) {
  const response = await fetch(`${getVfeApiUrl()}/api/docusign/start`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      source: "VFE_WEBSITE",
    }),
  });
  const body = (await readBody(response)) as DocuSignResponse;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      { message: body.message },
      body.message || `Request failed (${response.status}). Please try again.`,
    );
  }

  return body;
}

export async function purchaseLeadPackage(payload: {
  packageId: string;
  leadId?: string;
  state?: string;
  returnUrl?: string;
  failureUrl?: string;
  userDetails: {
    email?: string;
    firstName?: string;
    lastName?: string;
    mobile?: string;
    country?: string;
    dateOfBirth?: string;
    genderId?: string;
  };
}) {
  const response = await fetch(`${getVfeApiUrl()}/api/lead-package-purchase`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = (await readBody(response)) as PurchaseResponse;

  if (!response.ok) {
    throw new ApiError(response.status, { message: body.message }, body.message || "Failed to initiate payment.");
  }

  return body;
}
