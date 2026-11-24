import type { Metadata } from "next";
import FaqPage from "@/components/faqs/FaqPage";

export const metadata: Metadata = {
  title: "FAQs | Vows for Eternity",
  description: "Answers about Vows for Eternity, the matchmaking process, privacy and membership.",
};

export default function Faqs() {
  return <FaqPage />;
}
