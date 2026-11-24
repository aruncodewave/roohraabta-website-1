import Link from "next/link";

type MembershipHeroProps = {
  image: string;
  title: string;
  body: string;
  href?: string;
  imagePosition?: string;
  featured?: boolean;
};

export default function MembershipHero({
  image,
  title,
  body,
  href,
  imagePosition = "object-center",
  featured = false,
}: MembershipHeroProps) {
  return (
    <article className={`relative w-full overflow-hidden bg-[#2a2118] ${featured ? "h-[953px]" : "aspect-[865/953] lg:aspect-auto lg:h-full"}`}>
      <img
        src={encodeURI(image)}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover ${featured ? "object-center" : imagePosition}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/15" />
      <div className="relative flex h-full flex-col items-end justify-end px-6 py-8 text-right sm:px-12 sm:py-12 lg:px-16 lg:py-14">
        <h2 className="max-w-2xl font-sans text-[36px] font-semibold leading-none tracking-[-0.02em] text-white sm:text-[48px] lg:text-[60px]">
          {title}
        </h2>
        <p className={`mt-3 max-w-xl font-serif font-normal leading-[1.6] tracking-[-0.02em] text-white ${featured ? "text-[16px] lg:text-[20px]" : "text-[15px]"}`}>
          {body}
        </p>
        {href ? (
          <Link
            href={href}
            className="mt-5 inline-flex h-10 w-[132px] items-center justify-center self-end rounded-[5px] bg-[#B3A028] font-serif text-[18px] font-semibold leading-[1.6] tracking-[-0.02em] text-[#FFFFF0] transition-opacity hover:opacity-85"
          >
            Know More
          </Link>
        ) : null}
      </div>
    </article>
  );
}
