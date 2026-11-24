"use client";

import { useRef, useState } from "react";
import { animate, LayoutGroup, motion, useMotionValue, useReducedMotion } from "motion/react";
import { councilIntro, councilMembers, type CouncilMember } from "@/data/advisoryCouncil";

const ease = [0.22, 1, 0.36, 1] as const;
const dragThreshold = 72;

export default function AdvisoryCouncilPage() {
  const [index, setIndex] = useState(2);
  const [fromUser, setFromUser] = useState(false);
  const [behindId, setBehindId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const count = councilMembers.length;
  const member = councilMembers[index];
  const at = (offset: number) => councilMembers[(index + offset + count * 8) % count];
  const left = at(-1);
  const right = [1, 2, 3].map((step) => at(step));
  const dragX = useMotionValue(0);
  const drag = useRef({ active: false, startX: 0, moved: false });
  const indexRef = useRef(index);
  indexRef.current = index;

  const go = (nextIndex: number, fromUserMove: boolean) => {
    const wrapped = (nextIndex + count) % count;
    const current = indexRef.current;
    if (wrapped === current) return;
    const step = (wrapped - current + count) % count;
    setBehindId(step === 1 ? councilMembers[(current - 1 + count) % count].id : null);
    setFromUser(fromUserMove);
    setIndex(wrapped);
  };
  const select = (nextIndex: number) => go(nextIndex, true);
  const selectRef = useRef(select);
  selectRef.current = select;

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    drag.current = { active: true, startX: event.clientX, moved: false };
    const move = (pointer: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = pointer.clientX - drag.current.startX;
      if (Math.abs(dx) > 6) drag.current.moved = true;
      dragX.set(Math.max(-160, Math.min(160, dx)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (!drag.current.active) return;
      const dx = dragX.get();
      drag.current.active = false;
      const current = indexRef.current;
      const step = dx <= -dragThreshold ? 1 : dx >= dragThreshold ? -1 : 0;
      dragX.set(0);
      if (step !== 0) selectRef.current(current + step);
      else animate(dragX, 0, { duration: reduceMotion ? 0 : 0.35, ease });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const choose = (person: CouncilMember) => {
    if (drag.current.moved) return;
    const target = councilMembers.findIndex((item) => item.id === person.id);
    select(target);
  };

  return (
    <>
      <section className="bg-[#A4911B] px-5 py-12 text-center text-[#FFFFF0] sm:px-8 sm:py-16">
        <h1 className="font-sans text-[40px] font-bold leading-none tracking-[-0.01em] text-[#FFFFF0] sm:text-[60px]">
          The Advisory Council
        </h1>
        <div className="mx-auto mt-6 max-w-5xl space-y-4 text-center font-serif text-[18px] font-normal leading-[1.4] tracking-[-0.01em] sm:text-[28px]">
          {councilIntro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section
        className="overflow-hidden bg-cream py-10 sm:py-14 lg:py-16"
        aria-roledescription="carousel"
        aria-label="Advisory Council"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            select(index + 1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            select(index - 1);
          }
        }}
      >
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 xl:max-w-[1280px]">
          <div className="relative">
            <LayoutGroup>
              <motion.div
                style={{ x: dragX, touchAction: "pan-y" }}
                className="relative flex items-end gap-2 sm:gap-4"
              >
                {[left, member, ...right].map((person, slot) => (
                  <Portrait
                    key={person.id}
                    person={person}
                    main={slot === 1}
                    traveling={slot === 0 || slot === 4}
                    behind={person.id === behindId}
                    className={slot === 1 ? "" : "w-[18%] flex-none sm:w-[13%]"}
                    onSelect={slot === 1 ? undefined : () => choose(person)}
                    onPointerDown={slot === 1 ? onPointerDown : undefined}
                  />
                ))}
                <motion.p
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: reduceMotion ? 0 : 0.35, delay: reduceMotion ? 0 : 0.4 }}
                  className="pointer-events-none absolute top-1/2 right-0 z-20 hidden -translate-y-1/2 pr-2 font-infant text-[40px] font-bold leading-[1.1] tracking-[-0.01em] text-[#762323] sm:left-[calc(13%+1rem+40%+1rem)] sm:block lg:text-[55px] xl:left-[calc(13%+1rem+513px+1rem)]"
                >
                  {member.name}
                </motion.p>
              </motion.div>
            </LayoutGroup>
            <motion.p
              key={member.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.35 }}
              className="mt-6 text-center font-infant text-[32px] font-bold leading-[1.1] tracking-[-0.01em] text-[#762323] sm:hidden"
            >
              {member.name}
            </motion.p>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-5xl px-5 text-left sm:mt-12" aria-live={fromUser ? "polite" : "off"}>
          <div className="space-y-5 font-serif text-[18px] font-medium leading-[1.5] tracking-[-0.01em] text-[#762323] sm:text-[25px]">
            {member.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Portrait({
  person,
  main = false,
  traveling = false,
  behind = false,
  className = "",
  onSelect,
  onPointerDown,
}: {
  person: CouncilMember;
  main?: boolean;
  traveling?: boolean;
  behind?: boolean;
  className?: string;
  onSelect?: () => void;
  onPointerDown?: (event: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      layout
      type="button"
      aria-label={`Show ${person.name}`}
      aria-current={main ? "true" : undefined}
      onClick={onSelect}
      onPointerDown={onPointerDown}
      transition={{ layout: { duration: reduceMotion ? 0 : 0.9, ease } }}
      style={{ zIndex: behind ? 0 : main ? 30 : traveling ? 40 : 10 }}
      className={`relative overflow-hidden bg-[#f3efe4] opacity-100 ${
        main
          ? "aspect-[513/715] w-[46%] shrink-0 cursor-grab touch-pan-y select-none active:cursor-grabbing sm:w-[40%] xl:aspect-auto xl:h-[715px] xl:w-[513px]"
          : `aspect-[513/715] min-w-0 flex-1 cursor-pointer ${className}`
      }`}
    >
      <img src={person.src} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top" />
    </motion.button>
  );
}
