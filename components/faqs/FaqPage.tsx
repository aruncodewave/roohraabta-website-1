"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import BeginJourneyButton from "@/components/common/BeginJourneyButton";
import { faqSections } from "@/data/faqs";

const accordionEase = [0.4, 0, 0.2, 1] as const;
const accordionMs = 700;
const firstSectionId = faqSections[0]?.id ?? "";

export default function FaqPage() {
  const [openId, setOpenId] = useState(firstSectionId);
  const [pill, setPill] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(faqSections.map((section) => [section.id, section.id !== firstSectionId])),
  );
  const openIdRef = useRef(openId);
  openIdRef.current = openId;
  const pillToken = useRef(0);
  const pinToken = useRef(0);
  const userToggled = useRef(false);

  const alignOpenSection = () => {
    if (!userToggled.current) return;
    const id = openIdRef.current;
    if (!id) return;
    const element = document.getElementById(`faq-section-${id}`);
    if (!element) return;
    const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
    const top = element.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    window.scrollTo(0, Math.max(0, top));
  };

  const pinOpenSection = () => {
    const token = ++pinToken.current;
    const started = performance.now();
    const step = () => {
      if (token !== pinToken.current) return;
      alignOpenSection();
      if (performance.now() - started < accordionMs) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const toggleSection = (id: string) => {
    const previous = openId;
    const next = previous === id ? "" : id;
    setPill((current) => {
      const updated = { ...current };
      if (next) updated[next] = false;
      if (previous && previous !== next) updated[previous] = false;
      return updated;
    });
    openIdRef.current = next;
    setOpenId(next);
    if (next) {
      userToggled.current = true;
      pinOpenSection();
    }

    if (previous && previous !== next) {
      const token = ++pillToken.current;
      window.setTimeout(() => {
        if (pillToken.current !== token) return;
        if (openIdRef.current === previous) return;
        setPill((current) => ({ ...current, [previous]: true }));
      }, accordionMs);
    }
  };

  return (
    <>
      <section className="w-full bg-cream">
        <img
          src="/images/hand.webp"
          alt="A couple's hands at a wedding, with rings, a watch and a bouquet"
          className="block h-[220px] w-full object-cover object-center sm:h-[340px] md:h-[440px] lg:h-[520px]"
        />
      </section>

      <section className="bg-cream px-4 py-10 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 sm:gap-8 lg:flex-row lg:items-start lg:gap-10 xl:gap-16">
          <h1 className="type-h1 shrink-0 text-[70px] text-[#762323] lg:pt-4">
            FAQ&apos;s
          </h1>

          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-5">
            {faqSections.map((section) => {
              const open = openId === section.id;
              const panelId = `faq-panel-${section.id}`;

              return (
                <div
                  key={section.id}
                  id={`faq-section-${section.id}`}
                  className={`bg-[#F6F1E4] ${pill[section.id] ? "rounded-full" : "rounded-[22px] sm:rounded-[28px] lg:rounded-[36px]"}`}
                >
                  <h2>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={(event) => {
                        toggleSection(section.id);
                        event.currentTarget.focus({ preventScroll: true });
                      }}
                      className="relative flex w-full cursor-pointer items-center justify-start px-11 py-4 text-left sm:px-16 sm:py-6 lg:px-20 lg:py-7"
                    >
                      <span className="type-h4 block w-full min-w-0 text-[40px] text-[#762323]">
                        {section.title}
                      </span>
                      <span className="absolute right-3 top-1/2 h-4 w-7 -translate-y-1/2 sm:right-6 sm:h-[22px] sm:w-[38px] lg:right-8 lg:h-[26px] lg:w-[45px]">
                        <img
                          src="/icons/arrowDown.svg"
                          alt=""
                          width={45}
                          height={26}
                          className={`absolute inset-0 h-full w-full transition-opacity duration-500 ease-in-out ${open ? "opacity-0" : "opacity-100"}`}
                        />
                        <img
                          src="/icons/arrowUp.svg"
                          alt=""
                          width={45}
                          height={26}
                          className={`absolute inset-0 h-full w-full transition-opacity duration-500 ease-in-out ${open ? "opacity-100" : "opacity-0"}`}
                        />
                      </span>
                    </button>
                  </h2>

                  <motion.div
                    id={panelId}
                    role="region"
                    aria-hidden={!open}
                    inert={!open}
                    initial={false}
                    animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
                    transition={{
                      height: { duration: 0.65, ease: accordionEase },
                      opacity: { duration: 0.4, ease: accordionEase },
                    }}
                    className="overflow-hidden"
                    onUpdate={alignOpenSection}
                  >
                    <div>
                      <ul className="space-y-6 px-11 pb-8 pt-2 sm:space-y-8 sm:px-16 sm:pb-10 lg:space-y-10 lg:px-20 lg:pb-12 lg:pt-4">
                        {section.items.map((item) => (
                          <li key={item.question} className="flex gap-3 sm:gap-4">
                            <span
                              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#762323] sm:mt-[10px] sm:h-2.5 sm:w-2.5 lg:mt-[14px]"
                              aria-hidden="true"
                            />
                            <div className="min-w-0">
                              <h3 className="type-h4 text-[40px] text-[#8B7E2A]">
                                {item.question}
                              </h3>
                              <div className="type-body mt-3 space-y-3 text-[22px] text-[#762323] sm:mt-4 sm:space-y-4">
                                {item.paragraphs.map((paragraph) => (
                                  <p key={paragraph}>{paragraph}</p>
                                ))}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <BeginJourneyButton href="/contact" />
    </>
  );
}
