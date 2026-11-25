import { membershipIntro } from "@/data/membership";

export default function MembershipIntro() {
  return (
    <section className="bg-cream px-5 pb-10 pt-12 text-center sm:px-8 sm:pb-14 sm:pt-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="type-h2 text-[70px] text-[#762323]">
          {membershipIntro.title}
        </h1>
        <div className="type-body-lg mt-6 space-y-4 text-[#7a3030]">
          {membershipIntro.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
