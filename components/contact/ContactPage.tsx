"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ExploratoryForm from "@/components/contact/ExploratoryForm";
import MembershipForm from "@/components/contact/MembershipForm";
import { fetchCountryCodes, fetchLeadDropdowns } from "@/lib/vfe/api";
import type { CountryCodeOption, LeadDropdowns } from "@/lib/vfe/types";

type Path = "exploratory" | "membership";

const offices = [
  {
    city: "New York",
    phone: "+1 212 653 0953",
    tel: "tel:+12126530953",
    address: "1330 Avenue of the Americas, Suite 23A, New York, NY 10019",
  },
  {
    city: "New Delhi",
    phone: "+91 11 6128 9047",
    tel: "tel:+911161289047",
    address: "Level 3B, DLF Centre, Sansad Marg, Connaught Place, New Delhi 110001",
  },
];

const emptyDropdowns: LeadDropdowns = {
  heardAboutUs: [],
  relationshipStatus: [],
  gender: [],
  hasChildren: [],
  lookingForSelf: [],
  valueCuratedServices: [],
  previousMatchmaking: [],
};

export default function ContactPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedPath = searchParams.get("path");
  const activePath: Path = requestedPath === "membership" ? "membership" : "exploratory";
  const [countryCodes, setCountryCodes] = useState<CountryCodeOption[]>([]);
  const [dropdowns, setDropdowns] = useState<LeadDropdowns>(emptyDropdowns);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading || window.location.hash !== "#offices") return;

    let cancelled = false;
    let attempts = 0;

    const scroll = () => {
      if (cancelled) return;
      if (document.body.style.overflow === "hidden" && attempts < 40) {
        attempts += 1;
        window.setTimeout(scroll, 50);
        return;
      }
      const offices = document.getElementById("offices");
      if (!offices) return;
      const header = document.querySelector("header");
      const offset = (header?.getBoundingClientRect().height ?? 0) + 24;
      const top = offices.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    };

    const timeout = window.setTimeout(scroll, 50);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [loading]);

  useEffect(() => {
    let active = true;

    Promise.all([fetchCountryCodes(), fetchLeadDropdowns()])
      .then(([codes, options]) => {
        if (!active) return;
        setCountryCodes(codes);
        setDropdowns(options);
      })
      .catch((error) => {
        console.error("Unable to load contact form options", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectPath = (path: Path) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("path", path);
    router.push(`/contact?${params.toString()}`, { scroll: false });
  };

  return (
    <section className="bg-cream py-16 text-center sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h1 className="type-h1 text-[#8B7E2A]">
          Begin the Conversation
        </h1>
        <p className="form-intro mx-auto mt-5 max-w-4xl text-[#8B7E2A]">
          Connect with our team to explore, or proceed directly with your membership application.
        </p>
      </div>

      <div className="mt-10 flex w-full items-stretch sm:mt-14 sm:items-center">
        <span className="h-px w-2 shrink-0 self-center bg-[#762323] md:w-4 lg:w-auto lg:min-w-6 lg:flex-1" />
        <PathButton active={activePath === "exploratory"} onClick={() => selectPath("exploratory")}>
          Exploratory Path
        </PathButton>
        <span className="w-2 shrink-0 md:w-6 lg:w-28" />
        <PathButton active={activePath === "membership"} onClick={() => selectPath("membership")}>
          Membership Path
        </PathButton>
        <span className="h-px w-2 shrink-0 self-center bg-[#762323] md:w-4 lg:w-auto lg:min-w-6 lg:flex-1" />
      </div>

      <div className="mx-auto mt-16 max-w-6xl px-5 text-left sm:px-8">
          {loading ? (
            <p className="type-body-sm text-center text-[#8B7E2A]">Loading the form...</p>
          ) : activePath === "exploratory" ? (
            <ExploratoryForm countryCodes={countryCodes} dropdowns={dropdowns} />
          ) : (
            <MembershipForm countryCodes={countryCodes} dropdowns={dropdowns} />
          )}
      </div>

      <div id="offices" className="mx-auto mt-20 max-w-4xl scroll-mt-32 px-5 text-center sm:px-8">
        <ul className="mx-auto flex max-w-3xl flex-col items-center gap-12 sm:flex-row sm:items-start sm:justify-center sm:gap-20">
          {offices.map((office) => (
            <li key={office.city} className="w-full max-w-xs sm:flex-1">
              <h3 className="type-h4 text-[#762323]">
                {office.city}
              </h3>
              {office.phone ? (
                <a
                  href={office.tel}
                  className="type-label mt-4 inline-block leading-none text-[#8B7E2A] underline underline-offset-4 hover:opacity-70"
                >
                  {office.phone}
                </a>
              ) : null}
              {office.address ? (
                <p className="type-body-sm mx-auto mt-4 max-w-xs text-[#762323]">
                  {office.address}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function PathButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`type-footer relative z-10 inline-flex min-h-16 min-w-0 flex-1 cursor-pointer items-center justify-center px-2 py-3 text-center min-[420px]:px-3 md:min-h-20 md:px-6 lg:min-h-[88px] lg:min-w-[280px] lg:flex-none lg:px-10 ${
        active
          ? "bg-[#A4911B] text-[#FFFDF7]"
          : "border border-[#A4911B] bg-cream text-[#8B7E2A]"
      }`}
    >
      {children}
    </button>
  );
}
