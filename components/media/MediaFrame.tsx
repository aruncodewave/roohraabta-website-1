import type { ReactNode } from "react";

export function MediaFrame({ children }: { children: ReactNode }) {
  return (
    <section className="bg-cream px-4 pb-16 pt-8 sm:px-5 sm:pt-10 lg:px-6 lg:pb-20">
      <div className="mx-auto w-full max-w-[1240px]">{children}</div>
    </section>
  );
}
