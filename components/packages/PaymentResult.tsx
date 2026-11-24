import type { ReactNode } from "react";

function SuccessMark() {
  return (
    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#A4911B] md:h-20 md:w-20">
      <svg viewBox="0 0 41 38" className="h-7 w-8 md:h-8 md:w-9" aria-hidden="true">
        <path
          d="M0.7 21.83C-0.23 20.88-0.25 19.61 0.75 18.61C1.57 17.77 2.89 18.3 3.91 19.01C4.94 19.73 5.89 20.48 6.77 21.36L7.57 22.15L8.82 23.51C10.37 25.2 11.62 27.06 13 29.01C17.89 22.07 23.13 15.67 28.87 9.57L30.02 8.36L34.25 4.05L35.05 3.25L37.05 1.35C37.55 0.87 38.16 0.5 38.77 0.19C39.38-0.13 40.03-0.04 40.51 0.37C41.62 1.33 40.63 3.15 39.62 4.27L34.24 10.24C30.23 14.68 26.55 19.33 23.22 24.28L22.52 25.31C20.13 28.86 17.92 32.48 15.79 36.2C15.48 36.74 15.09 37.1 14.59 37.44C13.29 38.33 11.51 38.17 10.51 36.93C10.05 36.35 9.78 35.73 9.49 35.05C7.81 31.11 5.48 27.02 2.63 23.8L0.7 21.83Z"
          fill="#FFFDF7"
        />
      </svg>
    </span>
  );
}

function FailureMark() {
  return (
    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#762323] md:h-20 md:w-20">
      <svg viewBox="0 0 24 24" className="h-7 w-7 text-[#762323] md:h-8 md:w-8" fill="none" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function PaymentResult({
  title,
  message,
  tone,
  children,
}: {
  title: string;
  message: string;
  tone: "success" | "failure";
  children?: ReactNode;
}) {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-cream px-5 py-20 text-center sm:px-8">
      <span className="pointer-events-none absolute top-16 left-0 hidden h-16 w-16 border-t border-l border-[#C6B48A] lg:block" />
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        {tone === "success" ? <SuccessMark /> : <FailureMark />}
        <h1 className="mt-8 font-serif text-[36px] font-normal text-[#762323] md:text-[52px]">{title}</h1>
        <span className="mt-6 h-px w-24 bg-[#C6B48A]" />
        <p className="mt-8 font-serif text-[20px] leading-relaxed text-[#8B7E2A] md:text-[26px] md:leading-10">{message}</p>
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </section>
  );
}
