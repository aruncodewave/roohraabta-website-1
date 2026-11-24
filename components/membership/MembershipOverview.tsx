import MembershipHero from "@/components/membership/MembershipHero";
import MembershipIntro from "@/components/membership/MembershipIntro";
import { membershipChoices } from "@/data/membership";

export default function MembershipOverview() {
  return (
    <>
      <MembershipIntro />
      <section className="-ml-[5px] w-[min(1731px,calc(100%+5px))]">
        <div className="grid w-full gap-0 lg:h-[953px] lg:grid-cols-2">
          {membershipChoices.map((choice) => (
            <MembershipHero
              key={choice.href}
              image={choice.image}
              title={choice.title}
              body={choice.body}
              href={choice.href}
              imagePosition={choice.imagePosition}
            />
          ))}
        </div>
      </section>
    </>
  );
}
