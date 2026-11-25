import type { MouseEventHandler, ReactNode } from "react";

type BeginJourneyButtonProps = {
  text?: ReactNode;
  lines?: ReactNode[];
  buttonName?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  href?: string;
  id?: string;
  className?: string;
  buttonTextClass?: string;
  buttonWidthClass?: string;
  buttonPaddingClass?: string;
  sentenceTextClass?: string;
};

const frameClass =
  "type-h4 inline-flex aspect-[811/329] cursor-pointer items-center justify-center whitespace-nowrap border-0 bg-transparent bg-[url('/images/buttonFrame.svg')] bg-contain bg-center bg-no-repeat text-center leading-none text-[#79211E] transition-opacity hover:opacity-90";

const sentenceClass = "type-h3 max-w-6xl text-center text-[#FFFFF0]";

export default function BeginJourneyButton({
  text = "We make the introduction. You write what comes next.",
  lines,
  buttonName = "Begin Your Journey",
  onClick,
  href,
  id,
  className = "",
  buttonTextClass = "",
  buttonWidthClass = "w-[min(96vw,600px)]",
  buttonPaddingClass = "px-[18%]",
  sentenceTextClass = "",
}: BeginJourneyButtonProps) {
  const copy = lines?.length ? lines : text ? [text] : [];
  const controlClass = `${frameClass} ${buttonWidthClass} ${buttonPaddingClass} ${buttonTextClass}`;
  const control = href ? (
    <a href={href} onClick={onClick} className={controlClass}>
      {buttonName}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={controlClass}>
      {buttonName}
    </button>
  );

  return (
    <section id={id} className={`scroll-mt-24 bg-[#A4911B] px-5 py-16 text-center sm:px-8 sm:py-20 ${className}`}>
      <div className="flex flex-col items-center gap-3">
        {copy.map((line, index) => (
          <p key={index} className={`${sentenceClass} ${sentenceTextClass}`}>
            {line}
          </p>
        ))}
      </div>
      {control}
    </section>
  );
}
