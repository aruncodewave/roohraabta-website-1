import type { CountryCodeOption } from "@/lib/vfe/types";

export function parseE164Mobile(e164Mobile: string, countryCodeOptions: CountryCodeOption[]) {
  if (!e164Mobile || !countryCodeOptions.length) return null;

  const normalized = e164Mobile.trim().replace(/\s/g, "");
  if (!normalized.startsWith("+")) return null;

  const sortedByLength = [...countryCodeOptions].sort((a, b) => (b.value?.length ?? 0) - (a.value?.length ?? 0));

  for (const option of sortedByLength) {
    const code = (option.value ?? "").trim();
    if (!code || !normalized.startsWith(code)) continue;
    const phone = normalized.slice(code.length).replace(/\D/g, "");
    if (phone.length >= 7) {
      return { countryCode: code, phone };
    }
  }

  return null;
}
