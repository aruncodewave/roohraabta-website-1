import type { MembershipFee } from "@/lib/vfe/types";

const CODE = "[A-Z]{3}";

type Amount = {
  code: string;
  amount: string;
};

function chooseAmount(amounts: Amount[], currency: string) {
  const code = currency === "INR" ? "INR" : "USD";
  return amounts.find((item) => item.code === code) ?? amounts.find((item) => item.code === "USD") ?? amounts[0];
}

function formatAmount(amount: Amount) {
  return `${amount.code} ${amount.amount}`;
}

function formatFeeNumber(value: number, currency: string) {
  const whole = Number.isInteger(value);
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(value);
}

export function membershipPrice(fees: MembershipFee[], currency: string) {
  const code = currency === "INR" ? "INR" : "USD";
  const fee = fees.find((item) => item.currency === code) ?? fees.find((item) => item.currency === "USD") ?? fees[0];
  if (!fee) return "";

  const amount = formatFeeNumber(fee.membershipFee, fee.currency);
  const gst = fee.currency === "INR" && fee.tax > 0 ? " + GST" : "";
  return `${fee.currency} ${amount}${gst}`;
}

export function textForCurrency(value: string, currency: string) {
  const piped = value.split(/\s*\|\s*/).map((part) => part.trim()).filter(Boolean);
  if (piped.length > 1) {
    const amounts = piped.flatMap((part) => {
      const match = part.match(new RegExp(`^(${CODE})\\s+(.+)$`));
      if (!match) return [];
      return [{ code: match[1], amount: match[2].trim() }];
    });

    if (amounts.length === piped.length) {
      return formatAmount(chooseAmount(amounts, currency));
    }
  }

  const prose = new RegExp(`(${CODE})\\s+(.+?)(?=\\s+or\\s+${CODE}\\b|\\s+and\\b|[.,;]|$)`, "g");
  const matches = [...value.matchAll(prose)];
  if (matches.length > 1) {
    const amounts = matches.map((match) => ({ code: match[1], amount: match[2].trim() }));
    const chosen = chooseAmount(amounts, currency);
    const start = matches[0].index ?? 0;
    const last = matches[matches.length - 1];
    const end = (last.index ?? 0) + last[0].length;
    return `${value.slice(0, start)}${formatAmount(chosen)}${value.slice(end)}`.replace(/\s{2,}/g, " ").trim();
  }

  return value;
}
