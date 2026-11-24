import type { Metadata } from "next";
import AboutPage from "@/components/about/AboutPage";

export const metadata: Metadata = {
  title: "About Us | Vows for Eternity",
  description: "Our members, and how we work.",
};

export default function About() {
  return <AboutPage />;
}
