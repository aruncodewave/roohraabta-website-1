import { membershipIntro } from "@/data/membership";

export default function MembershipIntro() {
  return (
    <section className="bg-cream px-5 pb-10 pt-12 text-center sm:px-8 sm:pb-14 sm:pt-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-newsreader text-[36px] font-medium leading-none tracking-[-0.01em] text-[#762323] sm:text-[44px] lg:text-[53px]">
          {membershipIntro.title}
        </h1>
        <div className="mt-6 space-y-4 font-newsreader text-[22px] font-normal leading-[1.3] tracking-[-0.01em] text-[#7a3030] sm:text-[26px] lg:text-[32px]">
          {membershipIntro.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
