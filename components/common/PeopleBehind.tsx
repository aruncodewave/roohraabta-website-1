"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { teamMembers, type TeamMember } from "@/data/team";

type PeopleBehindProps = {
  members?: TeamMember[];
  heading?: string;
  subtitle?: string;
  featuredId?: string;
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

const portraitEase = [0.22, 1, 0.36, 1] as const;
const portraitDragLimit = 160;
const portraitDragThreshold = 72;

function wrapOffset(value: number, loop: number) {
  if (loop <= 0) return value;
  let next = value % loop;
  if (next > 0) next -= loop;
  if (next <= -loop) next = 0;
  return next;
}

function splitName(name: string) {
  const suffix = name.match(/,\s*\S+$/)?.[0] ?? "";
  const base = suffix ? name.slice(0, -suffix.length).trim() : name.trim();
  const parts = base.split(/\s+/);
  if (parts.length < 2) return { first: name, last: "" };
  const last = parts.pop() ?? "";
  return { first: parts.join(" "), last: `${last}${suffix}` };
}

export default function PeopleBehind({
  members = teamMembers,
  heading = "The people behind every beginning.",
  subtitle = "The experiences and values that shape how we listen and bring two stories together.",
  featuredId,
}: PeopleBehindProps) {
  const router = useRouter();
  const headingId = useId();
  const stripClass = `people-strip-${useId().replaceAll(":", "")}`;
  const reducedMotion = usePrefersReducedMotion();
  const isMemberPage = featuredId != null;
  const [activeId, setActiveId] = useState(featuredId ?? null);
  const shownId = activeId;
  const member = members.find((person) => person.id === shownId) ?? null;
  const nameParts = member ? splitName(member.name) : { first: "", last: "" };
  const shownIndex = Math.max(0, members.findIndex((person) => person.id === shownId));
  const shownIndexRef = useRef(shownIndex);
  shownIndexRef.current = shownIndex;
  const portraitDragX = useMotionValue(0);
  const portraitFrameRef = useRef<HTMLDivElement>(null);
  const firstNameRef = useRef<HTMLSpanElement>(null);
  const [textIndent, setTextIndent] = useState(0);
  const portraitDragRef = useRef({ active: false, startX: 0, animating: false });
  const portraitResetRef = useRef(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const centeredRef = useRef(false);
  const dragRef = useRef({ active: false, startX: 0, origin: 0, moved: false, loop: 0 });
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const copies = members.length > 1 ? 3 : 1;

  function loopWidth() {
    const track = trackRef.current;
    if (!track) return 0;
    const first = track.querySelector<HTMLElement>(":scope > a");
    const marker = track.querySelector<HTMLElement>('[data-loop-start="1"]');
    if (!first || !marker) return 0;
    const width = marker.getBoundingClientRect().left - first.getBoundingClientRect().left;
    return width > 0 ? width : 0;
  }

  function moveTo(value: number, loop = loopWidth()) {
    const next = wrapOffset(value, loop);
    offsetRef.current = next;
    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${next}px, 0, 0)`;
    }
    setOffset(next);
  }

  useEffect(() => {
    setActiveId(featuredId ?? null);
  }, [featuredId]);

  useEffect(() => {
    centeredRef.current = false;
  }, [featuredId]);

  function showPortrait(step: number) {
    if (members.length < 2 || portraitDragRef.current.animating) return;
    const next = members[(shownIndexRef.current + step + members.length) % members.length];
    const width = portraitFrameRef.current?.clientWidth ?? 0;
    const finish = () => {
      portraitDragRef.current.animating = false;
      portraitResetRef.current = true;
      setActiveId(next.id);
      router.push(`/about/team/${next.id}`, { scroll: false });
    };
    if (reducedMotion || width === 0) {
      finish();
      return;
    }
    portraitDragRef.current.animating = true;
    animate(portraitDragX, step > 0 ? -width : width, {
      duration: 0.9,
      ease: portraitEase,
    }).then(finish);
  }

  useLayoutEffect(() => {
    if (!portraitResetRef.current) return;
    portraitDragX.set(0);
    portraitResetRef.current = false;
  }, [shownId, portraitDragX]);

  useLayoutEffect(() => {
    const node = firstNameRef.current;
    if (!node) return;
    const update = () => setTextIndent(node.getBoundingClientRect().width / 2);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [shownId]);

  function onPortraitPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || members.length < 2 || portraitDragRef.current.animating) return;
    const frame = portraitFrameRef.current;
    if (!frame) return;
    const box = frame.getBoundingClientRect();
    const startedOnImage =
      event.clientX >= box.left &&
      event.clientX <= box.right &&
      event.clientY >= box.top &&
      event.clientY <= box.bottom;
    if (!startedOnImage) return;
    portraitDragRef.current.active = true;
    portraitDragRef.current.startX = event.clientX;
    const move = (pointer: globalThis.PointerEvent) => {
      if (!portraitDragRef.current.active) return;
      const delta = pointer.clientX - portraitDragRef.current.startX;
      portraitDragX.set(Math.max(-portraitDragLimit, Math.min(portraitDragLimit, delta)));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (!portraitDragRef.current.active) return;
      const delta = portraitDragX.get();
      portraitDragRef.current.active = false;
      const step = delta <= -portraitDragThreshold ? 1 : delta >= portraitDragThreshold ? -1 : 0;
      if (step !== 0) showPortrait(step);
      else animate(portraitDragX, 0, { duration: reducedMotion ? 0 : 0.35, ease: portraitEase });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }

  useEffect(() => {
    const strip = stripRef.current;
    const track = trackRef.current;
    if (!strip || !track) return;

    const measure = () => {
      if (dragRef.current.active || strip.clientWidth === 0) return;
      const loop = loopWidth();

      if (featuredId && !centeredRef.current && loop > 0) {
        centeredRef.current = true;
        const selected = track.querySelector<HTMLElement>('[aria-current="page"]');
        if (selected) {
          const target = strip.clientWidth / 2 - (selected.offsetLeft + selected.offsetWidth / 2);
          const next = wrapOffset(target, loop);
          offsetRef.current = next;
          setOffset(next);
          return;
        }
      }

      setOffset((current) => {
        const next = wrapOffset(current, loop);
        offsetRef.current = next;
        return next;
      });
    };

    const frame = window.requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(strip);
    observer.observe(track);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [featuredId, members]);

  useEffect(() => {
    if (!shownId || dragRef.current.active) return;
    const strip = stripRef.current;
    const track = trackRef.current;
    if (!strip || !track) return;
    const selected = track.querySelector<HTMLElement>('[aria-current="page"]');
    const loop = loopWidth();
    if (!selected || loop <= 0) return;
    const target = strip.clientWidth / 2 - (selected.offsetLeft + selected.offsetWidth / 2);
    const next = wrapOffset(target, loop);
    offsetRef.current = next;
    setOffset(next);
  }, [shownId]);

  useEffect(() => {
    if (!dragging) return;
    const previous = document.body.style.cursor;
    document.body.style.cursor = "grabbing";
    return () => {
      document.body.style.cursor = previous;
    };
  }, [dragging]);

  function onStripPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const startX = event.clientX;
    const origin = offsetRef.current;
    const loop = loopWidth();
    dragRef.current = { active: true, startX, origin, moved: false, loop };
    setDragging(true);

    const move = (pointer: globalThis.PointerEvent) => {
      if (!dragRef.current.active) return;
      const delta = pointer.clientX - startX;
      if (Math.abs(delta) > 5) dragRef.current.moved = true;
      moveTo(origin + delta, loop);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      dragRef.current.active = false;
      setDragging(false);
      window.setTimeout(() => {
        dragRef.current.moved = false;
      }, 0);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }

  function onStripClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!dragRef.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
  }

  function onCardFocus(event: FocusEvent<HTMLAnchorElement>) {
    // A clipped card at either end gets focused on pointerdown and would
    // snap the row, fighting the drag. Only keyboard focus should align it.
    if (dragRef.current.active) return;
    if (!event.currentTarget.matches(":focus-visible")) return;
    const strip = stripRef.current;
    const card = event.currentTarget;
    if (!strip) return;
    const viewStart = -offsetRef.current;
    const viewEnd = viewStart + strip.clientWidth;
    const cardStart = card.offsetLeft;
    const cardEnd = cardStart + card.offsetWidth;
    if (cardStart < viewStart) moveTo(-cardStart);
    else if (cardEnd > viewEnd) moveTo(-(cardEnd - strip.clientWidth));
  }

  return (
    <section
      aria-labelledby={headingId}
      className="relative z-0 overflow-hidden bg-cream py-16 sm:py-20 lg:py-24"
    >
      <style>{`
        .${stripClass} { --gap: 10px; }
        .${stripClass} .people-card,
        .${stripClass} .people-card img {
          -webkit-user-drag: none;
        }
        .${stripClass} .people-card {
          width: calc((100cqw - 3 * var(--gap)) / 3.7);
        }
        .${stripClass} .people-photo {
          aspect-ratio: 360 / 420;
          width: 100%;
          height: auto;
          object-fit: cover;
          object-position: top;
        }
      `}</style>

      <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
        {isMemberPage && member ? (
          <div className="scroll-mt-36 md:scroll-mt-44">
            <article className="grid items-start gap-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-8 lg:gap-x-14">
              <AnimatePresence mode="wait">
                <motion.div
                  key={member.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="min-w-0 text-left"
                >
                  <h1 className="font-sans text-[48px] font-bold leading-none tracking-[-0.01em] text-[#8B7E2A] sm:text-[64px] lg:text-[80px]">
                    <span ref={firstNameRef} className="inline-block max-w-full">
                      {nameParts.first}
                      {nameParts.last ? (
                        <span className="block w-0 whitespace-nowrap" style={{ marginLeft: "50%" }}>
                          {nameParts.last}
                        </span>
                      ) : null}
                    </span>
                  </h1>
                  <div className="min-w-0 text-left" style={{ paddingLeft: textIndent }}>
                    <p className="mt-4">
                      <span className="inline-block border-b border-[#762323] pb-1 font-sans text-[22px] font-bold italic leading-[1.1] tracking-[-0.02em] text-[#762323] sm:text-[28px] lg:text-[33px]">
                        {member.title}
                      </span>
                    </p>
                    <div className="mt-7 space-y-5 font-serif text-[18px] font-normal leading-[1.5] tracking-[-0.01em] text-[#762323] sm:text-[21px] lg:text-[24px]">
                      {member.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                    {member.links?.length ? (
                      <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                        {member.links.map((link) => (
                          <li key={link.href}>
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-sans text-[16px] font-semibold text-[#8B7E2A] underline underline-offset-4 hover:opacity-70 sm:text-[18px]"
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </motion.div>
              </AnimatePresence>
              <div
                ref={portraitFrameRef}
                className="relative z-0 mx-auto aspect-[580/861] w-[min(56vw,580px)] cursor-grab touch-pan-y overflow-hidden select-none justify-self-center active:cursor-grabbing sm:col-start-2 sm:row-start-1 sm:mx-0 sm:w-[240px] sm:justify-self-end md:w-[360px] xl:aspect-auto xl:h-[861px] xl:w-[580px]"
                onPointerDown={onPortraitPointerDown}
              >
                <motion.div
                  className="pointer-events-none absolute inset-y-0 flex h-full"
                  style={{ x: portraitDragX, width: "300%", left: "-100%" }}
                >
                  {[-1, 0, 1].map((slot) => {
                    const person = members[(shownIndex + slot + members.length) % members.length];
                    return (
                      <div key={person.id} className="h-full w-1/3 shrink-0">
                        <img
                          src={person.fullImage ?? person.image}
                          alt={slot === 0 ? person.name : ""}
                          draggable={false}
                          className="h-full w-full object-cover object-top"
                        />
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            </article>
          </div>
        ) : null}
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2
          id={headingId}
          className={`text-center font-sans text-[36px] font-bold leading-[1.2] tracking-[-0.01em] text-[#762323] sm:text-[48px] lg:text-[65px] ${isMemberPage ? "mt-16 sm:mt-20 lg:mt-24" : ""}`}
        >
          {heading}
        </h2>
        <p className="mx-auto mt-4 max-w-4xl text-center font-serif text-[18px] font-medium leading-[1.2] tracking-[-0.02em] text-[#8B7E2A] sm:text-[24px] lg:text-[30px]">
          {subtitle}
        </p>
      </div>

        <div
          ref={stripRef}
          className={`${stripClass} relative z-0 mt-12 w-full cursor-grab touch-pan-y overflow-clip select-none sm:mt-14 [&_*]:cursor-grab ${
            dragging ? "cursor-grabbing [&_*]:cursor-grabbing" : ""
          }`}
          style={{ containerType: "inline-size" }}
          onPointerDown={onStripPointerDown}
          onDragStart={(event) => event.preventDefault()}
          onClickCapture={onStripClickCapture}
        >
          <div
            ref={trackRef}
            className="people-track flex w-max"
            style={{ gap: "var(--gap)", transform: `translate3d(${offset}px, 0, 0)` }}
          >
            {Array.from({ length: copies }, (_, copy) =>
              members.map((person, index) => {
              const selected = isMemberPage && person.id === shownId;
              const duplicate = copy > 0;

              return (
                <Link
                  key={`${person.id}-${copy}`}
                  href={`/about/team/${person.id}`}
                  aria-current={selected && !duplicate ? "page" : undefined}
                  aria-hidden={duplicate || undefined}
                  tabIndex={duplicate ? -1 : undefined}
                  draggable={false}
                  data-loop-start={copy === 1 && index === 0 ? "1" : undefined}
                  onFocus={onCardFocus}
                  className={`people-card group flex shrink-0 flex-col text-center transition-colors duration-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8B7E2A] ${
                    selected
                      ? "bg-[#B8A6574D]"
                      : "bg-[#E8E8E880] hover:bg-[#B8A6574D] focus-visible:bg-[#B8A6574D]"
                  }`}
                >
                  <span className="block px-2 pb-4 pt-5 sm:px-3 sm:pb-5 sm:pt-7">
                    <span className="block font-sans text-[22px] font-bold leading-[1.15] tracking-[-0.01em] text-[#762323] sm:text-[43px]">
                      {person.name}
                    </span>
                    <span className="mt-1.5 block font-serif text-[14px] font-medium leading-[1.2] tracking-normal text-[#8B7E2A] sm:text-[20px]">
                      {person.role}
                    </span>
                  </span>
                  <img
                    src={person.image}
                    alt=""
                    draggable={false}
                    className="people-photo mt-auto"
                  />
                </Link>
              );
            }),
            )}
          </div>
        </div>
    </section>
  );
}
