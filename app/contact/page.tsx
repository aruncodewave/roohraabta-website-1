import type { Metadata } from "next";
import { Suspense } from "react";
import ContactPage from "@/components/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contact us | Vows for Eternity",
  description: "Begin the conversation. Schedule an exploratory call or start your membership application.",
};

export default function Contact() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] bg-cream" />}>
      <ContactPage />
    </Suspense>
  );
}
