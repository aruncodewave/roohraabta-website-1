import type { Metadata } from "next";
import AdvisoryCouncilPage from "@/components/advisory/AdvisoryCouncilPage";

export const metadata: Metadata = {
  title: "The Advisory Council | Vows for Eternity",
  description:
    "Leaders from business, education, philanthropy and community life who inform how Vows for Eternity understands relationships, family and partnership.",
};

export default function AdvisoryCouncil() {
  return <AdvisoryCouncilPage />;
}
