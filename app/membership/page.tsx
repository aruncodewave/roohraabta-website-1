import type { Metadata } from "next";
import MembershipOverview from "@/components/membership/MembershipOverview";

export const metadata: Metadata = {
  title: "Our Memberships | Vows for Eternity",
  description:
    "Vows for Eternity Privé and Select. Every search is different, and so is the level of access, guidance and personal involvement it may require.",
};

export default function MembershipPage() {
  return <MembershipOverview />;
}
