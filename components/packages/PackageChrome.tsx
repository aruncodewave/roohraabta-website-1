import type { ReactNode } from "react";

export function PackageSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-cream">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 animate-spin rounded-full border-t-4 border-[#762323]" />
      </div>
    </div>
  );
}

export function PackageMessage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-cream px-5 py-24 text-center">
      <div className="max-w-3xl font-serif text-[22px] leading-relaxed text-[#762323] md:text-[28px]">{children}</div>
    </div>
  );
}

export function PackageAction({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex aspect-[619/265] w-[min(88vw,420px)] cursor-pointer items-center justify-center border-0 bg-transparent bg-[url('/images/buttonFrame2.svg')] bg-contain bg-center bg-no-repeat px-[16%] text-center font-serif text-[22px] leading-tight text-[#FFFDF7] transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60 md:text-[28px]"
    >
      {children}
    </button>
  );
}

export function PackageHeading() {
  return (
    <h1 className="text-center font-serif text-[34px] font-normal uppercase tracking-wide text-[#762323] md:text-[48px]">
      Packages
    </h1>
  );
}
