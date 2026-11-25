"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { MEMBERSHIP_STORAGE_KEY } from "@/components/contact/leadForm";
import { PackageAction, PackageHeading, PackageMessage, PackageSpinner } from "@/components/packages/PackageChrome";
import {
  SELECTED_PACKAGE_KEY,
  fetchWebsitePackages,
  formatPackagePriceDetailed,
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

export default function PackagesList() {
  const router = useRouter();
  const [packages, setPackages] = useState<WebsitePackage[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [userData, setUserData] = useState<MembershipApplication | null>(null);

  useEffect(() => {
    const storedUser = readStored<MembershipApplication>(MEMBERSHIP_STORAGE_KEY);
    const storedPackage = readStored<WebsitePackage>(SELECTED_PACKAGE_KEY);
    setUserData(storedUser);
    if (storedPackage?.id) {
      setSelectedPackageId(storedPackage.id);
      setOpenId(storedPackage.id);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!userData) {
      setLoading(false);
      return;
    }

    let active = true;

    fetchWebsitePackages()
      .then((activePackages) => {
        if (!active) return;
        setPackages(activePackages);
        setOpenId((current) => current ?? activePackages[0]?.id ?? null);
      })
      .catch((error) => {
        console.error("Failed to fetch packages", error);
        if (active) toast.error("Unable to load packages. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [hydrated, userData]);

  const confirmPackage = () => {
    const selectedPackage = packages.find((pkg) => pkg.id === selectedPackageId);
    if (!selectedPackage) {
      toast.error("Please select a package before proceeding.");
      return;
    }

    localStorage.setItem(SELECTED_PACKAGE_KEY, JSON.stringify(selectedPackage));
    router.push("/packages/index");
  };

  if (loading) return <PackageSpinner />;

  if (!userData) {
    return <PackageMessage>Thank you for your interest. We will get in touch with you shortly.</PackageMessage>;
  }

  if (packages.length === 0) {
    return <PackageMessage>No active packages available at this time.</PackageMessage>;
  }

  return (
    <section className="bg-cream px-5 py-16 sm:px-8 sm:py-20">
      <PackageHeading />

      <div className="mx-auto mt-12 w-full max-w-3xl md:mt-16">
        {packages.map((pkg) => {
          const open = openId === pkg.id;
          return (
            <div key={pkg.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : pkg.id)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 py-3 text-left"
                aria-expanded={open}
              >
                <span className="type-footer uppercase text-[#762323]">{pkg.name.trim()}</span>
                <svg
                  className={`h-6 w-5 shrink-0 text-[#762323] transition-transform ${open ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {open ? (
                <div className="mx-2 mt-6 border border-[#762323] bg-[#F3EAD6] px-4 py-5 md:mx-4">
                  <label className="flex items-center gap-3">
                    <input
                      name="privilegeRadios"
                      type="radio"
                      value={pkg.id}
                      checked={selectedPackageId === pkg.id}
                      onChange={() => setSelectedPackageId(pkg.id)}
                      className="size-5 shrink-0 accent-[#762323]"
                    />
                    <span className="type-body w-full text-center uppercase tracking-wide text-[#8B7E2A]">
                      {formatPackagePriceDetailed(
                        pkg.membershipFees,
                        userData.country,
                        userData.state,
                        pkg.duration,
                      )}
                    </span>
                  </label>
                </div>
              ) : null}

              <div className="my-8 h-px w-full bg-[#C6B48A]" />
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <PackageAction onClick={confirmPackage}>Confirm</PackageAction>
      </div>
    </section>
  );
}
