import type { Metadata } from "next";
import { Suspense } from "react";
import { PackageSpinner } from "@/components/packages/PackageChrome";
import PaymentSuccess from "@/components/packages/PaymentSuccess";

export const metadata: Metadata = {
  title: "Payment successful | Vows for Eternity",
  description: "Your membership payment was successful.",
};

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PackageSpinner />}>
      <PaymentSuccess />
    </Suspense>
  );
}
