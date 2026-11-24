const letter =
  "mx-auto max-w-4xl text-center font-serif text-[18px] font-normal leading-[1.5] tracking-normal text-[#762323] sm:text-[22px] lg:text-[25px]";

export default function FounderTeamPage() {
  return (
    <section className="bg-cream px-5 py-14 text-center sm:px-8 sm:py-20">
      <h1 className="font-sans text-[32px] font-semibold italic leading-[1.1] tracking-[-0.02em] text-[#8B7E2A] sm:text-[44px] lg:text-[60px]">
        A Note from Our Founder
      </h1>
      <p className="mt-4 font-sans text-[28px] font-bold leading-[1.2] tracking-[-0.01em] text-[#762323] sm:mt-6 sm:text-[40px] lg:text-[52px]">
        Anuradda Gupta
      </p>

      <img
        src="/images/anuradha.webp"
        alt="Anuradda Gupta"
        className="mx-auto mt-8 h-auto w-[min(72vw,280px)] sm:mt-10"
      />

      <div className={`mt-10 space-y-6 sm:mt-12 ${letter}`}>
        <p>As a little girl, I dreamed of being a mother.</p>
        <p>
          I was also ambitious. Driven. Independent. I wanted to see the world and have the
          experiences my mother never had.
        </p>
        <p>
          And I did. I lived on different continents, built a career and experienced life on my own
          terms.
        </p>
        <p>Life was full. Until it felt empty.</p>
        <p>
          I had so much of what I had wanted. But I hadn&apos;t found the person I wanted to share
          it with.
        </p>
        <p>
          Finding that person wasn&apos;t easy. The websites offered endless options and very little
          intention. Conventional matchmaking reduced two human beings to a page of biodata. Their
          education, careers, interests and family backgrounds.
        </p>
        <p>
          But what about the lives they had lived? The experiences that altered them? Their dreams,
          their fears and everything they still hope for?
        </p>
        <p>
          I wanted to know the person, not just know about them. And I wanted the same in return.
        </p>
        <p>That belief became the foundation of Vows for Eternity.</p>
        <p>
          I eventually found my person. Years later, I still believe that finding someone to share
          your life with is one of the most meaningful things we can hope for.
        </p>
        <p>
          For some, it leads to marriage. For others, a committed life together. There is no single
          definition of what that relationship should look like. But the longing is universal.
        </p>
        <p>To find your person. The one who feels like home.</p>
      </div>

      <p className="mt-8 font-serif text-[18px] font-normal italic text-[#8B7E2A] sm:text-[20px]">
        Warmly,
      </p>
      <p className="mt-2 font-sacramento text-[48px] leading-none text-[#79211E] sm:text-[56px]">Anuradda Gupta</p>
      <p className="mt-2 font-serif text-[18px] font-normal italic text-[#8B7E2A] sm:text-[20px]">
        Founder
      </p>
    </section>
  );
}
