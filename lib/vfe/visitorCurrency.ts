const REQUEST_TIMEOUT_MS = 2500;

function currencySignal() {
  return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
}

export function currencyFromCountry(countryCode: string | null | undefined) {
  const code = countryCode?.trim().toUpperCase();
  if (!code) return null;
  return code === "IN" ? "INR" : "USD";
}

function isPublicIpv4(ip: string) {
  const match = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;

  const parts = match.slice(1).map(Number);
  if (parts.some((part) => part > 255)) return false;

  const [first, second] = parts;
  if (first === 0 || first === 10 || first === 127 || first >= 224) return false;
  if (first === 169 && second === 254) return false;
  if (first === 172 && second >= 16 && second <= 31) return false;
  if (first === 192 && second === 168) return false;
  return true;
}

async function firstMatch(tasks: Array<() => Promise<string | null>>) {
  return new Promise<string | null>((resolve) => {
    if (!tasks.length) {
      resolve(null);
      return;
    }

    let remaining = tasks.length;
    let settled = false;

    const finish = (value: string | null) => {
      if (settled) return;
      if (value) {
        settled = true;
        resolve(value);
        return;
      }
      remaining -= 1;
      if (remaining === 0) {
        settled = true;
        resolve(null);
      }
    };

    for (const task of tasks) {
      task().then(finish).catch(() => finish(null));
    }
  });
}

async function readIpv4() {
  return firstMatch([
    async () => {
      const response = await fetch("https://api.ipify.org?format=json", {
        cache: "no-store",
        signal: currencySignal(),
      });
      if (!response.ok) return null;
      const data = (await response.json()) as { ip?: string };
      const ip = data.ip?.trim() ?? "";
      return isPublicIpv4(ip) ? ip : null;
    },
    async () => {
      const response = await fetch("https://ipv4.icanhazip.com", {
        cache: "no-store",
        signal: currencySignal(),
      });
      if (!response.ok) return null;
      const ip = (await response.text()).trim();
      return isPublicIpv4(ip) ? ip : null;
    },
  ]);
}

async function readCountry(ip?: string) {
  const encoded = ip ? encodeURIComponent(ip) : "";

  return firstMatch([
    async () => {
      const response = await fetch(ip ? `https://ipwho.is/${encoded}` : "https://ipwho.is/", {
        cache: "no-store",
        signal: currencySignal(),
      });
      if (!response.ok) return null;
      const data = (await response.json()) as { success?: boolean; country_code?: string };
      if (data.success === false) return null;
      return data.country_code?.trim() || null;
    },
    async () => {
      const response = await fetch(
        ip ? `https://get.geojs.io/v1/ip/country/${encoded}.json` : "https://get.geojs.io/v1/ip/country.json",
        { cache: "no-store", signal: currencySignal() },
      );
      if (!response.ok) return null;
      const data = (await response.json()) as { country?: string };
      return data.country?.trim() || null;
    },
  ]);
}

export async function lookupCurrency(ip?: string) {
  try {
    const country = await readCountry(ip);
    return currencyFromCountry(country);
  } catch {
    return null;
  }
}

// Browser lookup. IPv4 is resolved first because many VPNs only tunnel IPv4, while
// ipwho.is and geojs also have IPv6 and would otherwise still see the home country.
export async function detectVisitorCurrency() {
  try {
    const ipv4 = await readIpv4();
    if (ipv4) {
      const currency = await lookupCurrency(ipv4);
      if (currency) return currency;
    }

    return lookupCurrency();
  } catch {
    return null;
  }
}
