import type { Metadata } from "next";
import MembershipDetail from "@/components/membership/MembershipDetail";
import { selectPage } from "@/data/membership";
import { detectCurrencyFromIp } from "@/lib/vfe/detectCurrency";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vows for Eternity Select | Vows for Eternity",
  description: selectPage.heroBody,
};

export default async function SelectMembershipPage() {
  const currency = await detectCurrencyFromIp();

  return <MembershipDetail page={selectPage} category="VFE_SELECT" currency={currency} />;
}
