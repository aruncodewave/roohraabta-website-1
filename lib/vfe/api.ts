import { getMatchMakingApiUrl, getPackageContentsApiUrl, getVfeApiUrl } from "@/lib/vfe/config";
import type {
  ApiErrorBody,
  CountryCodeOption,
  DropdownOption,
  LeadDropdowns,
  PackageCategory,
  MembershipFee,
  PackageKeyValue,
  PackageWebsiteContent,
  RawDropdownOption,
} from "@/lib/vfe/types";

export class ApiError extends Error {
  status: number;
  body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type NextRequestInit = RequestInit & {
  next?: { revalidate?: number };
};

async function request<T>(url: string, init?: NextRequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const body = (await response.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!response.ok) {
    throw new ApiError(response.status, body, body.message || "An error occurred. Please try again.");
  }

  return body;
}

function formatOptions(options: RawDropdownOption[] | undefined): DropdownOption[] {
  if (!Array.isArray(options)) return [];
  return options.map((option) => ({
    id: option.id,
    label: option.label,
    value: option.id,
  }));
}

function textLines(lines: unknown, fallback: unknown) {
  if (Array.isArray(lines)) {
    const cleaned = lines.map((line) => String(line).trim()).filter(Boolean);
    if (cleaned.length) return cleaned;
  }

  if (typeof fallback === "string" && fallback.trim()) {
    return fallback
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}

function membershipFees(value: unknown): MembershipFee[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const entry = item as { currency?: unknown; membershipFee?: unknown; tax?: unknown };
    const currency = typeof entry.currency === "string" ? entry.currency.trim().toUpperCase() : "";
    const membershipFee = Number(entry.membershipFee);
    if (!currency || !Number.isFinite(membershipFee)) return [];
    const tax = Number(entry.tax);
    return [{ currency, membershipFee, tax: Number.isFinite(tax) ? tax : 0 }];
  });
}

function keyValues(value: unknown): PackageKeyValue[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const entry = item as { key?: unknown; value?: unknown };
    const key = typeof entry.key === "string" ? entry.key.trim() : "";
    const amount = typeof entry.value === "string" ? entry.value.trim() : "";
    if (!key || !amount) return [];
    return [{ key, value: amount }];
  });
}

const packageRequests = new Map<PackageCategory, Promise<PackageWebsiteContent[]>>();

export function fetchPackageWebsiteContents(category: PackageCategory) {
  const current = packageRequests.get(category);
  if (current) return current;

  const request = loadPackageWebsiteContents(category).finally(() => {
    packageRequests.delete(category);
  });
  packageRequests.set(category, request);
  return request;
}

async function loadPackageWebsiteContents(category: PackageCategory): Promise<PackageWebsiteContent[]> {
  const search = new URLSearchParams({
    category,
    includeInactive: "false",
  });

  const response = await fetch(
    `${getPackageContentsApiUrl()}/api/package-website-contents?${search.toString()}`,
    {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store",
    },
  );

  const body = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    data?: Array<Record<string, unknown>>;
    message?: string;
  };

  if (!response.ok) {
    throw new ApiError(
      response.status,
      { message: body.message },
      body.message || "An error occurred. Please try again.",
    );
  }

  if (!body.success || !Array.isArray(body.data)) return [];

  return body.data
    .map((item) => ({
      id: String(item.id ?? ""),
      packageId: String(item.packageId ?? ""),
      packageName: String(item.packageName ?? ""),
      category: String(item.category ?? category),
      subheading: String(item.subheading ?? ""),
      contentLines: textLines(item.contentLines, item.contentText),
      experienceLines: textLines(item.experienceLines, item.experienceText),
      additionalKeyValues: keyValues(item.additionalKeyValues),
      membershipFees: membershipFees(item.membershipFees),
      duration: String(item.duration ?? "").trim(),
      sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : 0,
      isActive: item.isActive !== false,
    }))
    .filter((item) => item.isActive && item.packageName)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function fetchCountryCodes(): Promise<CountryCodeOption[]> {
  const body = await request<{ data?: CountryCodeOption[] }>(`${getVfeApiUrl()}/api/filter/COUNTRIES`);
  return body.data ?? [];
}

export async function fetchLeadDropdowns(): Promise<LeadDropdowns> {
  const body = await request<{ success?: boolean; data?: Record<string, RawDropdownOption[]> }>(
    `${getVfeApiUrl()}/api/lead-capture/lead-dropdowns`,
  );
  const data = body.success ? (body.data ?? {}) : {};

  return {
    heardAboutUs: formatOptions(data.heard_about_us),
    relationshipStatus: formatOptions(data.relationship_status),
    gender: formatOptions(data.gender),
    hasChildren: formatOptions(data.has_children),
    lookingForSelf: formatOptions(data.looking_for_self),
    valueCuratedServices: formatOptions(data.value_curated_services),
    previousMatchmaking: formatOptions(data.previous_matchmaking_experience),
  };
}

export async function verifyCaptcha(token: string) {
  const body = await request<{ success?: boolean }>(`${getVfeApiUrl()}/api/verify-captcha`, {
    method: "POST",
    body: JSON.stringify({ token, remoteip: "" }),
  });

  if (!body.success) {
    throw new ApiError(400, body as ApiErrorBody, "Captcha verification failed. Please try again.");
  }
}

export type LeadCaptureResponse = {
  success?: boolean;
  status?: number;
  message?: string;
  data?: {
    leadId?: string;
    existingLead?: boolean;
    submittedAt?: string;
    isCompletedChatBot?: boolean;
    isChatBotInitiated?: boolean;
  };
};

export async function captureLead(payload: Record<string, unknown>) {
  return request<LeadCaptureResponse>(`${getVfeApiUrl()}/api/lead-capture`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchExploratoryCalendlyUrl(params: {
  email: string;
  name: string;
  userId: string;
  country: string;
  membershipType?: string;
}) {
  const search = new URLSearchParams({
    email: params.email,
    name: params.name,
    userId: params.userId,
    country: params.country,
  });

  if (params.membershipType) {
    search.set("membershipType", params.membershipType);
  }

  const body = await request<{ data?: { schedulingUrl?: string } }>(
    `${getMatchMakingApiUrl()}/api/calendly-users/exploratory-call-url?${search.toString()}`,
  );

  return body.data?.schedulingUrl ?? "";
}

export function findIdFromRadioValue(options: DropdownOption[], radioValue: string) {
  if (!options.length || !radioValue) return "";

  const valueToLabelMap: Record<string, string> = {
    YES: "Yes",
    NO: "No",
    MALE: "Male",
    FEMALE: "Female",
  };

  const expectedLabel = valueToLabelMap[radioValue] || radioValue;
  const option = options.find((item) => item.label.toLowerCase() === expectedLabel.toLowerCase());
  return option ? option.value : "";
}

export function resolveSelectWithOther(options: DropdownOption[], selectedValue: string, otherText: string) {
  const otherOption = options.find((option) => option.label.trim().toLowerCase() === "other");
  if (otherOption && String(selectedValue) === String(otherOption.value)) {
    return otherText || "";
  }
  return selectedValue || "";
}

export function leadErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (Array.isArray(error.body.details) && error.body.details.length > 0) {
      return error.body.details.join(" ");
    }
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "An error occurred. Please try again.";
}
