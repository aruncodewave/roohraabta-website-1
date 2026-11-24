import CrossedPaths from "@/components/about/CrossedPaths";
import TestimonialSection from "@/components/common/TestimonialSection";

const membersHeading =
  "text-center font-serif text-[28px] font-normal italic leading-[1.25] tracking-[-0.02em] text-[#762323] sm:text-[34px] lg:text-[40px]";

const membersBody =
  "text-center font-sans text-[18px] font-semibold leading-[1.4] tracking-[-0.02em] text-[#762323] sm:text-[22px] lg:text-[30px]";

const processSteps = [
  {
    title: "01 | Discovery & Alignment",
    paragraphs: [
      "We begin with a comprehensive questionnaire exploring your life, experiences, relationships, values, aspirations and what you seek in a partner.",
      "This is followed by an extended personal conversation, in person or virtually, where we delve into the experiences and perspectives that have made you who you are.",
      "Whether you lead your search independently or involve your family, we respect the approach that feels right for you.",
    ],
  },
  {
    title: "02 | Your Profile & Search",
    paragraphs: [
      "Your completed questionnaire forms the foundation of your private profile, allowing you to share who you are in your own words.",
      "Drawing on our understanding of you, we identify potential introductions within our established community. We represent you thoughtfully and discreetly, advocating for you where we believe it serves your best interests.",
      "Depending on your membership, we may also extend that representation through our global network of associate partners and trusted relationships, making discreet enquiries and opening doors beyond our existing community.",
    ],
  },
  {
    title: "03 | Introductions & Feedback",
    paragraphs: [
      "When we identify someone we believe could be a good match, we share the profile with you. An introduction takes place only when both individuals express interest.",
      "An introduction is only the beginning. We believe meaningful relationships take time, and encourage you to get to know each other, understand your compatibility and decide for yourselves what future, if any, you wish to build together.",
      "We listen to your feedback, learning from each introduction and refining the search along the way.",
    ],
  },
  {
    title: "Throughout Your Journey | Support & Guidance",
    paragraphs: [
      "We work alongside you throughout your search, offering perspective and guidance as questions and decisions arise.",
      "Depending on your membership, we can also offer relationship guidance or connect you with professionals from our advisory network when additional support may be helpful.",
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-[#A4911B] px-5 py-14 text-center text-[#FFFFF0] sm:px-8 sm:py-20">
        <p className="font-newsreader text-[32px] font-medium leading-none tracking-[-0.01em] text-[#FFFFF0] sm:text-[38px] lg:text-[45px]">
          About Us
        </p>
        <p className="mx-auto mt-4 max-w-4xl font-sans text-[26px] font-semibold leading-[1.2] tracking-[-0.01em] text-[#FFFFF0] sm:text-[34px] lg:text-[48px]">
          We work with people whose lives are full, and who want someone to share them with.
        </p>
      </section>

      <section className="bg-cream px-5 py-14 text-center sm:px-8 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-5xl">
          <h1 className={membersHeading}>Our Members</h1>
          <div className={`mt-8 space-y-8 ${membersBody}`}>
            <p>We work with individuals whose lives are full, and they want someone to share it with.</p>
            <p>
              What brings them together is the desire for a meaningful, committed relationship, often
              leading to marriage.
            </p>
            <p>
              Our members include accomplished professionals, entrepreneurs and individuals from
              established business and legacy families.
            </p>
            <p>
              Some are looking to marry for the first time. Others are seeking a new beginning after
              a previous marriage or relationship.
            </p>
            <p>
              They come from different countries, cultures and faiths. For some, shared faith and
              cultural traditions are fundamental. For others, shared values, experiences and outlook
              matter more. Often, it is a meld of both.
            </p>
            <p>
              Our members are present globally, with our strongest networks in India, the United Arab
              Emirates and the United States.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-cream pb-8 text-center">
        <h2 className={`${membersHeading} px-5 sm:px-8`}>A Collection of Crossed Paths</h2>
        <CrossedPaths />
      </section>

      <section className="bg-cream px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-infant text-[36px] font-bold leading-[1.1] tracking-[-0.02em] text-[#8B7E2A] sm:text-[48px] lg:text-[65px]">
            How We Work
          </h2>
        </div>

        <div className="relative mx-auto mt-14 max-w-3xl pl-8 sm:mt-16 sm:pl-10">
          <span
            className="absolute bottom-1 left-[5px] top-[0.55rem] w-px bg-[#762323] sm:left-[6px]"
            aria-hidden="true"
          />
          <span
            className="absolute left-0 top-1 h-3 w-3 rounded-full bg-[#762323] sm:h-3.5 sm:w-3.5"
            aria-hidden="true"
          />
          <ol className="space-y-12 sm:space-y-16">
            {processSteps.map((step) => (
              <li key={step.title}>
                <h3 className="font-infant text-[32px] font-bold leading-[1.1] tracking-[-0.02em] text-[#762323] sm:text-[42px] lg:text-[55px]">
                  {step.title}
                </h3>
                <div className="mt-4 space-y-4 font-serif text-[16px] font-normal leading-[1.3] tracking-[-0.02em] text-[#762323] sm:text-[18px] lg:text-[22px]">
                  {step.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <TestimonialSection
        src="/images/image2.webp"
        backgroundColor="#A4911B"
        textColor="#FFFFF0"
        iconColor="#FFFFF04D"
        title="Across the Distance, Towards Home"
        paragraph="“I was 29, on Wall Street, living in what’s supposedly the single capital of the world. And still couldn’t find the right person. After six years of looking, falling in love, and getting my heart broken, I contacted Vows for Eternity. They introduced me to someone in India. I resisted for three months but the trust kept building. They believed we were a good fit. Eventually, I called. We spoke once and never stopped. Two trips to India and ten months later, we were married. Today we live in the suburbs with two little ones. It feels right. My family.”"
        credit="Investment Banker | New York | 32"
      />

      <section className="bg-cream px-5 py-16 text-center sm:px-8 sm:py-24">
        <h2 className="text-center font-sans text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] text-[#762323] sm:text-[52px] lg:text-[75px]">
          Find what was meant for you
        </h2>
      </section>
    </>
  );
}
