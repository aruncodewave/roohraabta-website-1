"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { LEAD_STORAGE_KEY, MEMBERSHIP_STORAGE_KEY } from "@/components/contact/leadForm";
import { PackageAction, PackageHeading, PackageMessage, PackageSpinner } from "@/components/packages/PackageChrome";
import { leadErrorMessage } from "@/lib/vfe/api";
import {
  SELECTED_PACKAGE_KEY,
  formatPackagePriceDetailed,
  purchaseLeadPackage,
  startMembershipAgreement,
  type LeadRecord,
  type MembershipApplication,
  type WebsitePackage,
} from "@/lib/vfe/packages";

function readStored<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export default function PackageCheckout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventParam = searchParams.get("event");
  const requiresAgreementSignature = eventParam === "cancel" && searchParams.get("status") === "not_signed";
  const [selectedPackage, setSelectedPackage] = useState<WebsitePackage | null>(null);
  const [userData, setUserData] = useState<MembershipApplication | null>(null);
  const [leadData, setLeadData] = useState<LeadRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(eventParam === "signing_complete");
  const purchaseStarted = useRef(false);

  useEffect(() => {
    setSelectedPackage(readStored<WebsitePackage>(SELECTED_PACKAGE_KEY));
    setUserData(readStored<MembershipApplication>(MEMBERSHIP_STORAGE_KEY));
    setLeadData(readStored<LeadRecord>(LEAD_STORAGE_KEY));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || eventParam !== "signing_complete" || purchaseStarted.current) return;
    if (!userData || !selectedPackage) {
      setIsPaymentLoading(false);
      return;
    }

    purchaseStarted.current = true;

    const startPayment = async () => {
      setIsPaymentLoading(true);
      try {
        const result = await purchaseLeadPackage({
          packageId: selectedPackage.id,
          leadId: leadData?.leadId,
          state: userData.state,
          returnUrl: `${window.location.origin}/payment/success`,
          failureUrl: `${window.location.origin}/payment/failed`,
          userDetails: {
            email: userData.email_id,
            firstName: userData.first_name,
            lastName: userData.last_name,
            mobile: userData.mobile || userData.phone_number,
            country: userData.country,
            dateOfBirth: userData.dateOfBirth || userData.date_of_birth,
            genderId: userData.gender,
          },
        });

        if (result.data?.paymentUrl) {
          window.location.href = result.data.paymentUrl;
          return;
        }

        purchaseStarted.current = false;
        setIsPaymentLoading(false);
        toast.error(result.message || "Failed to initiate payment.");
      } catch (error) {
        console.error("Error during payment API:", error);
        purchaseStarted.current = false;
        setIsPaymentLoading(false);
        toast.error(leadErrorMessage(error));
      }
    };

    startPayment();
  }, [ready, eventParam, leadData, selectedPackage, userData]);

  const payNow = async () => {
    if (!userData || !selectedPackage) {
      toast.error("Missing user or package data.");
      return;
    }

    setIsSigning(true);
    try {
      const data = await startMembershipAgreement({
        name: `${userData.first_name ?? ""} ${userData.last_name ?? ""}`.trim(),
        email: userData.email_id ?? "",
        clientId: leadData?.leadId,
        membershipId: selectedPackage.id,
        currency: userData.country && !/india/i.test(userData.country) ? "USD" : "INR",
        returnUrl: `${window.location.origin}/apply-for-membership/completed`,
        failureUrl: `${window.location.origin}/apply-for-membership/completed`,
      });

      if (data.data) {
        window.location.href = data.data;
        return;
      }

      toast.error(data.message || "Failed to get signing URL. Please try again.");
    } catch (error) {
      console.error("Error during API call:", error);
      toast.error(leadErrorMessage(error));
    } finally {
      setIsSigning(false);
    }
  };

  if (!ready || isPaymentLoading) return <PackageSpinner />;

  if (!selectedPackage || !userData) {
    return <PackageMessage>Thank you for your interest. We will get in touch with you shortly.</PackageMessage>;
  }

  const price = formatPackagePriceDetailed(
    selectedPackage.membershipFees,
    userData.country,
    userData.state,
    selectedPackage.duration,
  );

  return (
    <section className="min-h-[70vh] bg-cream px-5 py-16 sm:px-8 sm:py-20">
      <PackageHeading />

      <div className="mx-auto mt-12 w-full max-w-[715px]">
        <div className="type-body bg-[#F3EAD6] px-4 py-4 text-center uppercase tracking-wide text-[#762323]">
          {selectedPackage.name} {price}
        </div>

        <div className="mt-10 flex justify-center">
          <PackageAction onClick={() => router.push("/packages")}>Choose another plan</PackageAction>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-[715px] text-center">
        <h2 className="type-footer tracking-wide text-[#762323]">Grand Total</h2>
        <p className="type-body mt-4 uppercase text-[#8B7E2A]">{price}</p>

        <div className="mt-8 mb-6 flex flex-col items-center">
          {requiresAgreementSignature ? (
            <p className="type-label mb-4 text-[#762323]">
              Please sign the agreement before proceeding to payment.
            </p>
          ) : null}
          <PackageAction onClick={payNow} disabled={isSigning || !userData || !selectedPackage}>
            {isSigning ? "..." : "Pay Now"}
          </PackageAction>
        </div>
      </div>
    </section>
  );
}
