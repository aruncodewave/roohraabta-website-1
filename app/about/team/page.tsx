import type { Metadata } from "next";
import PeopleBehind from "@/components/common/PeopleBehind";

export const metadata: Metadata = {
  title: "Our Team | Vows for Eternity",
  description: "The team behind Vows for Eternity.",
};

export default function TeamPage() {
  return (
    <>
      <section className="bg-[#A4911B] px-5 py-16 text-center text-[#FFFFF0] sm:px-8 sm:py-24">
        <h1 className="type-hero text-[70px] text-[#FFFFF0]">
          Our Team
        </h1>
        <div className="type-body-lg mx-auto mt-8 max-w-5xl space-y-6">
          <p>
            Our team spans three continents, different cultures and decades of life experience. Some
            of us are married, some have divorced, and some remarried. We have stumbled around
            arranged introductions, love marriages and everything in between. Some of us found our
            partners early. Others took a tad bit longer.
          </p>
          <p>
            We come from different faiths, family structures and ways of seeing marriage. We
            understand the pull of tradition, the heft of family expectations and what it means to
            reconcile where you come from with the life you want to build. Many of us have had the
            same difficult conversations our members are having now.
          </p>
          <p>
            What unites us is a shared belief: choosing a life partner is one of the most
            consequential decisions we make. It deserves time, understanding and thoughtful
            consideration.
          </p>
        </div>
      </section>
      <PeopleBehind />
    </>
  );
}
