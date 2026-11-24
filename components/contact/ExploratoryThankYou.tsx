"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { EXPLORATORY_STORAGE_KEY } from "@/components/contact/leadForm";
import { fetchExploratoryCalendlyUrl } from "@/lib/vfe/api";

type StoredLead = {
  leadId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  membershipType?: string;
};

export default function ExploratoryThankYou() {
  const router = useRouter();
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const stored = localStorage.getItem(EXPLORATORY_STORAGE_KEY);
    let lead: StoredLead | null = null;

    if (stored) {
      try {
        lead = JSON.parse(stored) as StoredLead;
      } catch {
        lead = null;
      }
    }

    if (!lead?.email || !lead.firstName || !lead.lastName) {
      setFailed(true);
      setLoading(false);
      return;
    }

    // A successful capture can omit leadId. Details are already saved; scheduling needs that id.
    if (!lead.leadId) {
      setLoading(false);
      return;
    }

    const loadCalendly = async () => {
      try {
        const url = await fetchExploratoryCalendlyUrl({
          email: lead.email || "",
          name: `${lead.firstName} ${lead.lastName}`,
          userId: lead.leadId || "",
          country: lead.country || "",
          membershipType: lead.membershipType || undefined,
        });
        if (cancelled) return;
        if (url) setCalendlyUrl(url);
        else {
          setFailed(true);
          toast.error("Could not load the calendar. You can still ask us to follow up.");
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
          toast.error("Could not load the calendar. You can still ask us to follow up.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadCalendly();
    return () => {
      cancelled = true;
    };
  }, []);

  const finishLater = () => {
    localStorage.removeItem(EXPLORATORY_STORAGE_KEY);
    router.push("/contact?path=exploratory");
    toast.success("Thank you! We will reach out to you within the next 48 hours.");
  };

  return (
    <section className="bg-cream px-5 py-16 text-center sm:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-[36px] text-[#762323] md:text-[46px]">Thank you for your interest</h1>
        <p className="mt-4 font-sans text-[22px] leading-relaxed text-[#8B7E2A] md:text-[28px]">
          {!loading && !failed && !calendlyUrl
            ? "Your information has been submitted. We will contact you soon."
            : "Your information has been submitted. Choose a time for your exploratory call, or ask us to reach out."}
        </p>

        <div className="mt-10">
          {loading ? (
            <p className="font-sans text-[18px] text-[#8B7E2A]">Loading available times...</p>
          ) : calendlyUrl ? (
            <a
              href={calendlyUrl}
              className="inline-flex aspect-[811/329] w-[min(86vw,420px)] items-center justify-center bg-[url('/images/buttonFrame.svg')] bg-contain bg-center bg-no-repeat font-serif text-[28px] text-[#79211E] md:text-[34px]"
            >
              Schedule a Call
            </a>
          ) : failed ? (
            <button
              type="button"
              onClick={() => router.push("/contact?path=exploratory")}
              className="cursor-pointer border border-[#762323] px-6 py-3 font-sans text-[18px] text-[#762323]"
            >
              Return to the form
            </button>
          ) : null}
          {failed && !loading && !calendlyUrl ? (
            <p className="mt-4 font-sans text-[16px] text-[#762323]">
              We could not load the scheduling link. You can still ask us to follow up below.
            </p>
          ) : null}
        </div>

        <div className="mx-auto mt-12 max-w-md border-t border-[#762323] pt-8">
          <h2 className="font-serif text-[26px] text-[#762323]">Not ready to schedule a time yet?</h2>
          <p className="mt-3 font-sans text-[20px] text-[#8B7E2A] md:text-[24px]">
            Leave it with us and we will reach out within the next 48 hours.
          </p>
          <button
            type="button"
            onClick={finishLater}
            className="mt-6 cursor-pointer border border-[#A4911B] px-8 py-3 font-sans text-[18px] text-[#8B7E2A]"
          >
            Submit
          </button>
        </div>
      </div>
    </section>
  );
}
