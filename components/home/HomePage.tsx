import BeginJourneyButton from "@/components/common/BeginJourneyButton";
import TestimonialSection from "@/components/common/TestimonialSection";
import HeroVideo from "@/components/home/HeroVideo";

const storyHeading =
  "text-center font-serif text-[36px] font-normal italic leading-[1.25] tracking-[-0.02em]";
const storySubtitle =
  "text-center font-sans text-[24px] font-bold leading-[1.4] tracking-[-0.02em]";
const storyBody =
  "text-center font-sans text-[18px] font-bold leading-[1.4] tracking-normal";

export default function HomePage() {
  return (
    <>
      <section className="relative w-full overflow-hidden bg-burgundy">
        <HeroVideo />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-4 pb-5 pt-16 text-center text-white sm:px-8 sm:pb-8 md:pb-12">
          <p className="font-infant text-[36px] italic leading-tight">
            “What you seek is seeking you.”
          </p>
          <p className="mt-2 font-infant text-[24px] italic">
            -Rumi
          </p>
        </div>
      </section>

      <section className="bg-cream px-5 py-12 text-center sm:px-8 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <h1 className={`${storyHeading} text-[#762323]`}>Home is a person.</h1>
          <p className={`mt-8 ${storySubtitle} text-[#762323]`}>Since 2012. Thousands of stories.</p>
          <div className={`mt-8 space-y-8 ${storyBody} text-[#762323]`}>
            <p>
              Across countries, cultures and continents, people have trusted Vows
              for Eternity with something deeply personal: the search for the
              person they want to share their life with.
            </p>
            <p>
              With that trust have come their stories. The lives they have built.
              The relationships that shaped them. The hurt they carry. The hopes
              they still hold.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#A4911B] px-5 py-12 text-center sm:px-8 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <h2 className={`${storyHeading} text-[#FFFFF0]`}>
            More than a decade of matchmaking has taught us to begin with the person, not the profile.
          </h2>
          <div className={`mt-8 space-y-8 ${storyBody} text-[#FFFFF0]`}>
            <p>
              We take the time to understand who you are, the life you have lived
              and the life you want to build.
            </p>
            <p>
              We have not always gotten it right. We have sat with people in their
              joy, their hope and their heartbreak. Those moments have taught us to
              listen more closely, judge less quickly and never lose sight of the
              person behind the search.
            </p>
            <p>
              Choosing a life partner is one of the most significant decisions we
              make. It shapes not just two lives, but the home they create, the
              family they build and the generations that follow.
            </p>
          </div>
        </div>
      </section>

      <TestimonialSection
        src="/images/image1.webp"
        title="The Love That Met Me Where I Was"
        backgroundColor="#FFFDF7"
        textColor="#762323"
        bodyAlign="left"
        titleSizeClass="text-[36px]"
        bodySizeClass="text-[18px]"
        creditSizeClass="text-[24px]"
        paragraph={`“I’m in my third year of residency. I work 70 hour weeks and eat most meals standing up. I love what I do, but it doesn’t leave much room for dating.

I was tired of apologising for my life.

Vows for Eternity didn’t ask me to make more time. They looked for someone who wouldn’t need me to.

He’s an engineer. Calm, independent, completely comfortable doing his own thing. On our second call, I told him I might have to hang up mid sentence if I got paged. He said, ‘I’d be worried if you didn’t.’

We’ve been together eight months. He sends me voice notes between rounds. I send him terrible cafeteria food photos.

It’s not glamorous. But it’s the first relationship where I’ve never felt like I was too much or not enough.”`}
        credit="Physician, Medical Resident | Boston | 27"
      />

      <BeginJourneyButton
        id="begin"
        href="/contact"
        buttonName="Start a Conversation"
        buttonTextClass="text-[14px]"
        buttonWidthClass="w-[min(64vw,200px)]"
        buttonPaddingClass="px-[10%]"
        sentenceTextClass="text-[36px]"
        text="We make the introduction. You write what comes next."
      />
    </>
  );
}
