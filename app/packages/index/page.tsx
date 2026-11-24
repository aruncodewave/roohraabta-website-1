import type { Metadata } from "next";
import { Suspense } from "react";
import PackageCheckout from "@/components/packages/PackageCheckout";
import { PackageSpinner } from "@/components/packages/PackageChrome";

export const metadata: Metadata = {
  title: "Packages | Vows for Eternity",
  description: "Review your membership package and continue to payment.",
};

export default function PackageCheckoutPage() {
  return (
    <Suspense fallback={<PackageSpinner />}>
      <PackageCheckout />
    </Suspense>
  );
}
