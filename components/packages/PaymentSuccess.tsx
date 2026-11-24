"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PackageAction } from "@/components/packages/PackageChrome";
import { PaymentResult } from "@/components/packages/PaymentResult";
import { MEMBERSHIP_STORAGE_KEY } from "@/components/contact/leadForm";
import { getWebAppUrl } from "@/lib/vfe/config";
import { SELECTED_PACKAGE_KEY } from "@/lib/vfe/packages";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const isClassified = searchParams.get("membershipType") === "CLASSIFIED";
  const token = searchParams.get("token");
  const webAppUrl = getWebAppUrl();

  useEffect(() => {
    localStorage.removeItem(MEMBERSHIP_STORAGE_KEY);
    localStorage.removeItem(SELECTED_PACKAGE_KEY);
    localStorage.removeItem("envelopeId");
  }, []);

  const createPassword = () => {
    window.location.href = token ? `${webAppUrl}/reset-password?token=${token}` : webAppUrl;
  };

  return (
    <PaymentResult
      tone="success"
      title="Payment successful"
      message={
        isClassified
          ? "Thank you for choosing Classifieds. Your membership details will be sent to your email shortly."
          : "Thank you for choosing Vows for Eternity. Your membership details will be sent to your email shortly."
      }
    >
      {token ? <PackageAction onClick={createPassword}>Create Password</PackageAction> : null}
    </PaymentResult>
  );
}
