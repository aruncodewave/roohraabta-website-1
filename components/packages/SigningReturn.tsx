"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PackageSpinner } from "@/components/packages/PackageChrome";

export default function SigningReturn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirected = useRef(false);

  useEffect(() => {
    const event = searchParams.get("event");
    if (!event || redirected.current) return;
    redirected.current = true;

    const params = new URLSearchParams();
    for (const key of ["event", "status", "envelopeId"]) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }

    router.push(`/packages/index?${params.toString()}`);
  }, [router, searchParams]);

  return <PackageSpinner />;
}
