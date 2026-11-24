import { headers } from "next/headers";
import { currencyFromCountry, lookupCurrency } from "@/lib/vfe/visitorCurrency";

const LOCAL_IPS = new Set(["127.0.0.1", "::1", "0.0.0.0"]);

function normalizeIp(value: string) {
  let ip = value.trim().replace(/^"|"$/g, "");
  if (!ip || ip.toLowerCase() === "unknown") return "";

  if (ip.startsWith("[")) {
    const end = ip.indexOf("]");
    ip = end > 1 ? ip.slice(1, end) : ip;
  } else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(ip)) {
    ip = ip.slice(0, ip.lastIndexOf(":"));
  }

  if (ip.toLowerCase().startsWith("::ffff:")) ip = ip.slice("::ffff:".length);
  return ip;
}

function isLocalIp(ip: string) {
  const value = ip.toLowerCase();
  if (!value || LOCAL_IPS.has(value) || value.startsWith("192.168.") || value.startsWith("10.")) return true;
  if (value.startsWith("169.254.") || value.startsWith("127.")) return true;
  if (value.startsWith("fc") || value.startsWith("fd") || value.startsWith("fe80:")) return true;

  const privateRange = value.match(/^172\.(\d+)\./);
  if (!privateRange) return false;
  const second = Number(privateRange[1]);
  return second >= 16 && second <= 31;
}

function headerIp(headerStore: { get(name: string): string | null }, name: string) {
  const raw = headerStore.get(name);
  if (!raw) return "";

  for (const part of raw.split(",")) {
    const ip = normalizeIp(part);
    if (ip && !isLocalIp(ip)) return ip;
  }

  return "";
}

function clientIp(headerStore: { get(name: string): string | null }) {
  return (
    headerIp(headerStore, "cf-connecting-ip") ||
    headerIp(headerStore, "true-client-ip") ||
    headerIp(headerStore, "x-real-ip") ||
    headerIp(headerStore, "x-vercel-forwarded-for") ||
    headerIp(headerStore, "x-forwarded-for")
  );
}

export async function detectCurrencyFromIp() {
  try {
    const headerStore = await headers();
    const headerCountry =
      headerStore.get("x-vercel-ip-country") ||
      headerStore.get("cf-ipcountry") ||
      headerStore.get("cloudfront-viewer-country") ||
      headerStore.get("x-country-code");
    const fromHeader = currencyFromCountry(headerCountry);
    if (fromHeader) return fromHeader;

    const detected = await lookupCurrency(clientIp(headerStore) || undefined);
    if (detected) return detected;
  } catch {
    return "USD";
  }

  return "USD";
}
