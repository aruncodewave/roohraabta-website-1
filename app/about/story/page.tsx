import type { Metadata } from "next";
import FounderTeamPage from "@/components/about/FounderTeamPage";

export const metadata: Metadata = {
  title: "Founder's Note | Vows for Eternity",
  description: "A note from Anuradda Gupta, Founder and CEO of Vows for Eternity.",
};

export default function StoryPage() {
  return <FounderTeamPage />;
}
