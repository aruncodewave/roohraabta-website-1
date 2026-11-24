import type { Metadata } from "next";
import MembershipDetail from "@/components/membership/MembershipDetail";
import { privePage } from "@/data/membership";
import { detectCurrencyFromIp } from "@/lib/vfe/detectCurrency";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vows for Eternity Privé | Vows for Eternity",
  description: privePage.heroBody,
};

export default async function PriveMembershipPage() {
  const currency = await detectCurrencyFromIp();

  return <MembershipDetail page={privePage} category="VFE_PRIVE" currency={currency} />;
}
