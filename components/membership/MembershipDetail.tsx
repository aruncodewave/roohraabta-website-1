"use client";

import { useEffect, useState } from "react";
import BeginJourneyButton from "@/components/common/BeginJourneyButton";
import ExperienceIcon from "@/components/membership/ExperienceIcon";
import MembershipHero from "@/components/membership/MembershipHero";
import MembershipIntro from "@/components/membership/MembershipIntro";
import type { MembershipPageCopy } from "@/data/membership";
import { fetchPackageWebsiteContents } from "@/lib/vfe/api";
import { membershipPrice, textForCurrency } from "@/lib/vfe/currency";
import type { PackageCategory, PackageKeyValue, PackageWebsiteContent } from "@/lib/vfe/types";
import { detectVisitorCurrency } from "@/lib/vfe/visitorCurrency";

const highlightKeys = new Set(["duration", "investment", "membership"]);

type MembershipDetailProps = {
  page: MembershipPageCopy;
  category: PackageCategory;
  currency: string;
};

function packageSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function MembershipDetail({ page, category, currency: fallbackCurrency }: MembershipDetailProps) {
  const [packages, setPackages] = useState<PackageWebsiteContent[] | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchPackageWebsiteContents(category)
      .then((data) => {
        if (active) setPackages(data);
      })
      .catch(() => {
        if (active) setPackages([]);
      });

    detectVisitorCurrency()
      .then((detected) => {
        if (active) setCurrency(detected ?? fallbackCurrency);
      })
      .catch(() => {
        if (active) setCurrency(fallbackCurrency);
      });

    return () => {
      active = false;
    };
  }, [category, fallbackCurrency]);

  return (
    <>
      <MembershipIntro />
      <MembershipHero image={page.heroImage} title={page.heroTitle} body={page.heroBody} featured />

      <section className="bg-cream px-5 py-14 text-center sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-sans text-[40px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#762323] sm:text-[52px] lg:text-[70px]">
            {page.sectionTitle}
          </h2>
          <p className="mt-3 font-serif text-[24px] font-medium italic leading-[1.1] text-[#762323] sm:text-[30px] lg:text-[36px]">
            {page.sectionSubtitle}
          </p>
          {page.sectionParagraphs.length ? (
            <div className="mt-8 space-y-5 font-serif text-[18px] font-normal leading-[1.6] tracking-[-0.02em] text-[#7a3030] lg:text-[24px]">
              {page.sectionParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {packages === null || (packages.length > 0 && currency === null) ? (
        <p className="bg-cream px-5 pb-16 text-center font-serif text-[18px] text-[#762323]">Loading memberships…</p>
      ) : packages.length && currency ? (
        packages.map((item) => <PackageBlock key={item.id} item={item} currency={currency} />)
      ) : (
        <p className="bg-cream px-5 pb-16 text-center font-serif text-[18px] text-[#762323]">
          Membership details are being updated. Please check back shortly.
        </p>
      )}

      <BeginJourneyButton
        href={page.consultHref}
        buttonName="Apply for Membership"
        lines={[page.ctaTitle, page.ctaBody]}
      />
    </>
  );
}

function formatDuration(duration: string) {
  const value = duration.trim();
  if (!value) return "";

  const monthsMatch = value.match(/^(\d+)(?:\s*months?)?$/i);
  const yearsMatch = value.match(/^(\d+)\s*years?$/i);
  const months = monthsMatch ? Number(monthsMatch[1]) : yearsMatch ? Number(yearsMatch[1]) * 12 : null;

  if (months === 12) return "One Year";
  if (months != null && monthsMatch) {
    return `${months} ${months === 1 ? "month" : "months"}`;
  }
  return value;
}

function pricedEntries(item: PackageWebsiteContent, currency: string): PackageKeyValue[] {
  const price = membershipPrice(item.membershipFees, currency);
  const entries = item.additionalKeyValues.map((entry) => ({
    ...entry,
    value: textForCurrency(entry.value, currency),
  }));

  const hasInvestment = entries.some((entry) => entry.key.trim().toLowerCase() === "investment");
  const base = price
    ? [
        { key: "Investment", value: price },
        ...entries.filter((entry) => {
          const key = entry.key.trim().toLowerCase();
          return key !== "membership" && key !== "investment";
        }),
      ]
    : entries.map((entry) =>
        entry.key.trim().toLowerCase() === "membership" && !hasInvestment ? { ...entry, key: "Investment" } : entry,
      );

  const formatted = base.map((entry) =>
    entry.key.trim().toLowerCase() === "duration" ? { ...entry, value: formatDuration(entry.value) } : entry,
  );

  const duration = formatDuration(item.duration);
  if (duration && !formatted.some((entry) => entry.key.trim().toLowerCase() === "duration")) {
    return [{ key: "Duration", value: duration }, ...formatted];
  }

  return formatted;
}

function PackageBlock({ item, currency }: { item: PackageWebsiteContent; currency: string }) {
  const entries = pricedEntries(item, currency);
  const highlightOrder = ["duration", "investment", "membership"];
  const highlight = entries
    .filter((entry) => highlightKeys.has(entry.key.trim().toLowerCase()))
    .sort(
      (a, b) =>
        highlightOrder.indexOf(a.key.trim().toLowerCase()) - highlightOrder.indexOf(b.key.trim().toLowerCase()),
    );
  const secondary = entries.filter((entry) => !highlightKeys.has(entry.key.trim().toLowerCase()));
  const experienceWidth = item.experienceLines.length === 4 ? "lg:w-1/4" : "lg:w-1/3";

  return (
    <section id={packageSlug(item.packageName)} className="bg-cream px-5 py-8 text-center sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <h3 className="font-sans text-[40px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#762323] sm:text-[52px] lg:text-[70px]">
          {item.packageName}
        </h3>
        {item.subheading ? (
          <p className="mt-3 font-serif text-[24px] font-medium italic leading-[1.1] text-[#762323] sm:text-[30px] lg:text-[36px]">
            {item.subheading}
          </p>
        ) : null}
        {item.contentLines.length ? (
          <div className="mt-6 space-y-5 font-serif text-[18px] font-normal leading-[1.6] tracking-[-0.02em] text-[#7a3030] lg:text-[24px]">
            {item.contentLines.map((line) => {
              const emphasis = /^(eligibility|reserved)\b/i.test(line);
              return (
                <p key={line} className={emphasis ? "font-medium" : undefined}>
                  {textForCurrency(line, currency)}
                </p>
              );
            })}
          </div>
        ) : null}
      </div>

      {item.experienceLines.length ? (
        <div className="mx-auto mt-12 max-w-5xl">
          <h4 className="font-serif text-[24px] font-medium italic leading-[1.1] text-[#762323] sm:text-[30px] lg:text-[36px]">
            The Experience
          </h4>
          <ul className="mt-8 flex flex-wrap justify-center gap-y-10">
            {item.experienceLines.map((line, index) => (
              <li key={line} className={`w-full px-4 sm:w-1/2 ${experienceWidth}`}>
                <ExperienceIcon index={index} />
                <p className="mx-auto mt-3 max-w-[220px] font-serif text-[15px] font-normal leading-[1.35] tracking-[0.02em] text-[#7a3030]">
                  {line}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {highlight.length ? (
        <dl className="mx-auto mt-12 flex max-w-6xl flex-wrap items-start justify-center gap-x-16 gap-y-8">
          {highlight.map((entry) => (
            <div key={entry.key} className="min-w-36 text-center text-[#8B7E2A]">
              <dt className="font-infant text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] lg:text-[40px]">{entry.key}</dt>
              <dd className="mt-1 font-serif text-[36px] font-medium leading-[1.1] tracking-[-0.03em] lg:text-[50px]">
                {entry.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {secondary.length ? (
        <ul className="mx-auto mt-6 max-w-3xl space-y-1 font-serif text-[18px] font-medium leading-[1.2] tracking-[0.02em] text-[#762323] lg:text-[25px]">
          {secondary.map((entry) => (
            <li key={entry.key}>
              {entry.key}: {entry.value}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
