"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";

type Frame = { x: number; y: number; w: number; h: number; radius: number };

type Scatter = {
  id: string;
  sx: number;
  sy: number;
  rot: number;
  scale: number;
  frame: Frame;
  back: { title: string; body?: string; credit?: string };
  backColor: string;
};

const BOARD = { width: 1307, height: 640 };
const STORY = "#B7A656";
const TRAVEL = 1.28;

type PhotoTile = Scatter & { kind: "photo"; src: string };
type CardTile = Scatter & { kind: "card"; text: string; backgroundColor: string };
type Tile = PhotoTile | CardTile;

const tiles: Tile[] = [
  {
    id: "gate",
    kind: "photo",
    src: "/images/crossed/gate.jpg",
    sx: -0.42,
    sy: -0.16,
    rot: -8,
    scale: 1.35,
    frame: { x: 0, y: 0, w: 648, h: 419, radius: 22 },
    back: {
      title: "The Match I Wouldn't Have Made",
      body: "“I spend my days evaluating investments and questioning assumptions. Skepticism comes with the job. So when I first heard about Vows for Eternity, I assumed it was a dating agency with a luxury price tag.\n\nI was wrong.\n\nWhat surprised me wasn't the introduction. It was everything that came before it. They pushed back on what I said I wanted. They asked uncomfortable questions about why my previous relationships hadn't worked. I'm used to people telling me what I want to hear. They didn't.\n\nThe woman they introduced me to wasn't who I would have picked on paper. She's a paediatrician. Quiet, grounded, completely unimpressed by my world.\n\nOn paper, I might have passed. In person, something just worked.\n\nWe got married last spring.\n\nTurns out I wasn't very good at knowing what I needed.”",
      credit: "Family Office | Dubai | 33",
    },
    backColor: STORY,
  },
  {
    id: "wall",
    kind: "photo",
    src: "/images/crossed/wall.jpg",
    sx: 0.22,
    sy: -0.34,
    rot: 7,
    scale: 1.22,
    frame: { x: 661, y: 0, w: 314, h: 419, radius: 18 },
    back: {
      title: "A Story Still Unfolding",
      body: "“My first marriage ended after eighteen years. I spent the next two convincing myself I didn't need to try again.\n\nWhen I finally reached out, I expected judgement or pity. I got neither.\n\nMy past was treated as information, not a verdict.\n\nI haven't met my person yet. But for the first time since my divorce, I believe I will.”",
      credit: "Architect | London | 51",
    },
    backColor: STORY,
  },
  {
    id: "members",
    kind: "card",
    text: "Real members.\nReal paths.",
    backgroundColor: "#79211E",
    sx: 0.5,
    sy: -0.06,
    rot: 5,
    scale: 1.12,
    frame: { x: 992, y: 2, w: 315, h: 195, radius: 19 },
    back: { title: "Every path here belongs to someone real." },
    backColor: "#FFFDF7",
  },
  {
    id: "fate",
    kind: "card",
    text: "A Quiet Kind\nof Fate.",
    backgroundColor: "#A19236",
    sx: -0.46,
    sy: 0.3,
    rot: -6,
    scale: 1.14,
    frame: { x: 0, y: 434, w: 314, h: 202, radius: 18 },
    back: { title: "Some meetings arrive without a plan." },
    backColor: "#FFFDF7",
  },
  {
    id: "water",
    kind: "photo",
    src: "/images/crossed/water.jpg",
    sx: 0.02,
    sy: 0.4,
    rot: -4,
    scale: 1.28,
    frame: { x: 330, y: 435, w: 645, h: 205, radius: 20 },
    back: {
      title: "A Love Away from the Spotlight",
      body: "“After being in the public eye for so long, you become skeptical. You start wondering if people are interested in you or in what surrounds you.\n\nWhat changed my mind about Vows for Eternity was how little they cared about the public version of me. Everything was discreet. I could just be a person again.\n\nI met three women through the service. The first two weren't right. The third was everything I'd forgotten I wanted.\n\nOn our first date, we barely talked about work. She wanted to know who I was when I wasn't performing.\n\nThat meant everything.\n\nWe've been together for over a year now. It's quiet. It's private. And it's mine.”",
      credit: "Actor | Mumbai | 39",
    },
    backColor: STORY,
  },
  {
    id: "cafe",
    kind: "photo",
    src: "/images/crossed/cafe.jpg",
    sx: 0.46,
    sy: 0.28,
    rot: 8,
    scale: 1.2,
    frame: { x: 992, y: 217, w: 314, h: 419, radius: 18 },
    back: {
      title: "Where Two Worlds Met",
      body: "“My parents had a vision. I had a different one. For years, I avoided the conversation entirely.\n\nVows for Eternity didn't take sides, but they made us sit in the discomfort between what we meant and what we were actually saying.\n\nMy mother wanted safety. I wanted autonomy.\n\nTurns out those aren't opposites.\n\nI didn't find a match through the process. But my family and I learned to speak the same language. That changed everything that followed.”",
      credit: "Venture Capital | Singapore | 36",
    },
    backColor: STORY,
  },
];

function settleOpen(progress: number) {
  const t = Math.min(1, Math.max(0, progress));
  // Ease-out: the first part of the scroll carries most of the travel,
  // then the tiles ease into the grid.
  const eased = 1 - (1 - t) * (1 - t);
  return 1 - eased;
}

function PathTile({
  tile,
  open,
  width,
  height,
  settled,
  fineHover,
  active,
  dimmed,
  compact,
  onActivate,
  onClear,
}: {
  tile: Tile;
  open: MotionValue<number>;
  width: MotionValue<number>;
  height: MotionValue<number>;
  settled: boolean;
  fineHover: boolean;
  active: boolean;
  dimmed: boolean;
  compact: boolean;
  onActivate: (id: string) => void;
  onClear: () => void;
}) {
  const x = useTransform(
    [open, width],
    ([value, view]) => tile.sx * Number(view) * Number(value) * TRAVEL,
  );
  const y = useTransform(
    [open, height],
    ([value, view]) => tile.sy * Number(view) * Number(value) * TRAVEL,
  );
  const rotate = useTransform(open, (value) => tile.rot * value * 1.35);
  const scale = useTransform(open, (value) => 1 + (tile.scale - 1) * value);
  const flipped = settled && active;
  const spacious = tile.frame.w > 500;
  const radius = compact
    ? tile.frame.radius
    : `calc(${tile.frame.radius} * 100cqw / ${BOARD.width})`;

  return (
    <motion.article
      className={`min-h-0 ${compact ? "min-h-48" : "absolute"} ${settled ? "cursor-pointer" : "pointer-events-none"} ${flipped ? "z-10" : ""}`}
      style={{
        x,
        y,
        rotate,
        scale,
        transformOrigin: "center",
        willChange: compact ? "auto" : "transform",
        ...(compact
          ? {}
          : {
              left: `${(tile.frame.x / BOARD.width) * 100}%`,
              top: `${(tile.frame.y / BOARD.height) * 100}%`,
              width: `${(tile.frame.w / BOARD.width) * 100}%`,
              height: `${(tile.frame.h / BOARD.height) * 100}%`,
            }),
      }}
      tabIndex={settled ? 0 : -1}
      onMouseEnter={() => {
        if (settled && fineHover) onActivate(tile.id);
      }}
      onMouseLeave={() => {
        if (fineHover) onClear();
      }}
      onClick={() => {
        if (!settled || fineHover) return;
        if (active) onClear();
        else onActivate(tile.id);
      }}
      onFocus={() => {
        if (settled) onActivate(tile.id);
      }}
      onBlur={onClear}
    >
      <div className={`[perspective:1400px] ${compact ? "h-full min-h-48 sm:min-h-52" : "h-full"}`}>
        <div
          className={`relative h-full transition-transform duration-[950ms] ease-[cubic-bezier(0.65,0.02,0.15,1)] [transform-style:preserve-3d] motion-reduce:transition-none ${flipped ? "[transform:rotateY(180deg)]" : ""}`}
        >
                    <div
                      className="absolute inset-0 overflow-hidden [backface-visibility:hidden]"
                      style={{ borderRadius: radius, transform: "rotateY(0deg) translateZ(1px)" }}
                    >
                      {tile.kind === "card" ? (
                        <div
                          className="flex h-full items-center justify-center whitespace-pre-line px-6 text-center font-serif text-[22px] font-normal italic leading-[1.25] tracking-[-0.02em] text-[#FFFFF0] sm:text-[26px] lg:text-[28px]"
                          style={{ backgroundColor: tile.backgroundColor }}
                        >
                          {tile.text}
                        </div>
                      ) : (
                        <img
                          src={tile.src}
                          alt=""
                          draggable={false}
                          className="h-full w-full object-cover"
                        />
                      )}
                      <div
                        className={`pointer-events-none absolute inset-0 bg-[#FFFDF7] transition-opacity duration-700 ease-out ${dimmed ? "opacity-80" : "opacity-0"}`}
                      />
                    </div>
                    <div
                      className="absolute inset-0 overflow-y-auto text-left [backface-visibility:hidden]"
                      style={{
                        borderRadius: radius,
                        backgroundColor: tile.backColor,
                        color: tile.backColor === "#FFFDF7" ? "#762323" : "#FFF8E8",
                        transform: "rotateY(180deg) translateZ(1px)",
                      }}
                    >
                      <div className={`flex min-h-full flex-col justify-start ${spacious ? "px-6 py-5 sm:px-8 lg:px-10" : "px-4 py-3 sm:px-5 lg:px-6"}`}>
                      <p className="font-serif text-[30px] font-medium italic leading-[1.25] tracking-[-0.02em]">
                        {tile.back.title}
                      </p>
                      {tile.back.body ? (
                        <p className="mt-3 whitespace-pre-line font-serif text-[16px] font-normal leading-[1.4] tracking-normal">
                          {tile.back.body}
                        </p>
                      ) : null}
                      {tile.back.credit ? (
                        <p className="mt-4 font-serif text-[20px] font-semibold leading-[1.25] tracking-[-0.02em]">
                          {tile.back.credit}
                        </p>
                      ) : null}
                      </div>
        </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function CrossedPaths() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const width = useMotionValue(0);
  const height = useMotionValue(0);
  const scrollProgress = useMotionValue(0);
  const [compact, setCompact] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [settled, setSettled] = useState(false);
  const [fineHover, setFineHover] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const compactValue = useMotionValue(0);
  const reducedValue = useMotionValue(0);
  const settledRef = useRef(false);

  const openTarget = useTransform([scrollProgress, compactValue, reducedValue], (values) => {
    const [progress, isCompact, isReduced] = values as number[];
    return isCompact || isReduced ? 0 : settleOpen(progress);
  });
  const open = useSpring(openTarget, {
    stiffness: 170,
    damping: 30,
    mass: 0.58,
    restDelta: 0.001,
  });

  compactValue.set(compact ? 1 : 0);
  reducedValue.set(reduced ? 1 : 0);

  useEffect(() => {
    const compactMedia = window.matchMedia("(max-width: 1179px)");
    const reducedMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hoverMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => {
      setCompact(compactMedia.matches);
      setReduced(reducedMedia.matches);
      setFineHover(hoverMedia.matches);
    };
    apply();
    compactMedia.addEventListener("change", apply);
    reducedMedia.addEventListener("change", apply);
    hoverMedia.addEventListener("change", apply);
    return () => {
      compactMedia.removeEventListener("change", apply);
      reducedMedia.removeEventListener("change", apply);
      hoverMedia.removeEventListener("change", apply);
    };
  }, []);

  useLayoutEffect(() => {
    const update = () => {
      width.set(window.innerWidth);
      height.set(window.innerHeight);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [height, width]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let frameId = 0;
    const measure = () => {
      frameId = 0;
      const rect = section.getBoundingClientRect();
      const distance = section.offsetHeight - window.innerHeight;
      const traveled = Math.min(Math.max(-rect.top, 0), Math.max(distance, 0));
      scrollProgress.set(distance <= 0 ? 1 : traveled / distance);
    };
    const requestMeasure = () => {
      if (!frameId) frameId = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", requestMeasure, { passive: true });
    window.addEventListener("resize", requestMeasure);
    return () => {
      window.removeEventListener("scroll", requestMeasure);
      window.removeEventListener("resize", requestMeasure);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [scrollProgress]);

  useEffect(() => {
    const sync = (value: number) => {
      const isSettled = value < 0.045;
      if (isSettled === settledRef.current) return;
      settledRef.current = isSettled;
      setSettled(isSettled);
      if (!isSettled) setActiveId(null);
    };
    sync(open.get());
    return open.on("change", sync);
  }, [open]);

  return (
    <div
      ref={sectionRef}
      className={compact || reduced ? "relative mt-10" : "relative mt-10 h-[200vh]"}
    >
      <div
        className={
          compact || reduced
            ? ""
            : "sticky top-[120px] h-[calc(100vh-120px)] overflow-hidden md:top-[150px] md:h-[calc(100vh-150px)]"
        }
      >
        <div
          className={
            compact || reduced
              ? "grid grid-cols-1 gap-4 px-6 sm:grid-cols-2 sm:gap-5 sm:px-10 md:px-16"
              : "flex h-full w-full items-center justify-center"
          }
        >
          <div
            className={compact || reduced ? "contents" : "relative"}
            style={
              compact || reduced
                ? undefined
                : {
                    width: "min(calc(100% - 3rem), 1307px, calc((100vh - 182px) * 1307 / 640))",
                    aspectRatio: "1307 / 640",
                    containerType: "inline-size",
                  }
            }
          >
            {tiles.map((tile) => (
              <PathTile
                key={tile.id}
                tile={tile}
                open={open}
                width={width}
                height={height}
                settled={settled}
                fineHover={fineHover}
                active={activeId === tile.id}
                dimmed={Boolean(activeId) && activeId !== tile.id}
                compact={compact || reduced}
                onActivate={setActiveId}
                onClear={() => setActiveId(null)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
