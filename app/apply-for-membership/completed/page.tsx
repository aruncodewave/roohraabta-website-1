import type { Metadata } from "next";
import { Suspense } from "react";
import SigningReturn from "@/components/packages/SigningReturn";
import { PackageSpinner } from "@/components/packages/PackageChrome";

export const metadata: Metadata = {
  title: "Membership | Vows for Eternity",
  description: "Returning to your membership package.",
};

export default function MembershipCompletedPage() {
  return (
    <Suspense fallback={<PackageSpinner />}>
      <SigningReturn />
    </Suspense>
  );
}
