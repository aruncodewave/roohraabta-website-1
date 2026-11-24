import type { Metadata } from "next";
import ExploratoryThankYou from "@/components/contact/ExploratoryThankYou";

export const metadata: Metadata = {
  title: "Thank you | Vows for Eternity",
  description: "Your exploratory call request has been received.",
};

export default function ThankYou() {
  return <ExploratoryThankYou />;
}
