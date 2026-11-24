import type { ReactNode } from "react";

export function MediaFrame({ children }: { children: ReactNode }) {
  return (
    <section className="bg-cream px-5 pb-16 pt-8 sm:px-8 sm:pt-10 lg:px-12 lg:pb-20">
      <div className="mx-auto w-full max-w-[1120px]">{children}</div>
    </section>
  );
}
