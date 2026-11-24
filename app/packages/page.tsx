import type { Metadata } from "next";
import PackagesList from "@/components/packages/PackagesList";

export const metadata: Metadata = {
  title: "Packages | Vows for Eternity",
  description: "Choose a Vows for Eternity membership package.",
};

export default function PackagesPage() {
  return <PackagesList />;
}
