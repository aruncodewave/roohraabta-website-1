"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MediaFrame } from "@/components/media/MediaFrame";
import { blogPath, decodeEntities, excerpt, formatMediaDate, publicationName } from "@/lib/media/format";
import type { MediaList, MediaPost, StoryKind } from "@/lib/media/types";

const STEP = 6;

const copy: Record<StoryKind, { title: string; subtitle: string; empty: string }> = {
  press: {
    title: "Press Coverage",
    subtitle: "A glimpse into how our work and stories have been featured across leading publications.",
    empty: "Press coverage is unavailable right now.",
  },
  posts: {
    title: "Blogs",
    subtitle:
      "A collection of thoughts, insights, and stories to inspire a deeper understanding of love, relationships, and the journeys that bring us together.",
    empty: "Blogs are unavailable right now.",
  },
};

const cardMask = {
  maskImage: "url(/masks/media-card.svg?v=5)",
  WebkitMaskImage: "url(/masks/media-card.svg?v=5)",
  maskSize: "100% 100%",
  WebkitMaskSize: "100% 100%",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
} as const;

function cardImageSrc(post: MediaPost, kind: StoryKind) {
  if (kind === "press" && post.featured_image) {
    return `/api/media/image?src=${encodeURIComponent(post.featured_image)}&v=2`;
  }
  return post.featured_image;
}

function CardImage({ post, kind }: { post: MediaPost; kind: StoryKind }) {
  const [src, setSrc] = useState(() => cardImageSrc(post, kind));
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative" style={{ containerType: "inline-size" }}>
      <div className="overflow-hidden bg-[#F6F1E4]" style={cardMask}>
        {src && !failed ? (
          <img
            src={src}
            alt=""
            onError={() => {
              if (src !== post.featured_image) setSrc(post.featured_image);
              else setFailed(true);
            }}
            className="aspect-[427/343] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[427/343] items-center justify-center px-4 font-serif text-[16px] text-[#8B7E2A]">
            Image not available
          </div>
        )}
      </div>
      <span
        className="absolute flex items-center justify-center rounded-full bg-[#A4911B]"
        style={{ width: "18.8cqw", height: "18.8cqw", right: 0, bottom: 0 }}
      >
        <img src="/icons/arrowrt.svg" alt="" className="h-[34%] w-[34%]" />
      </span>
    </div>
  );
}

function MediaCard({ post, kind }: { post: MediaPost; kind: StoryKind }) {
  const title = decodeEntities(post.title);
  const summary = kind === "posts" ? excerpt(post.description) : "";
  const source = kind === "press" ? publicationName(post.press_coverage_link) : "";
  const date = kind === "press" ? formatMediaDate(post.date) : "";
  const body = (
    <>
      <CardImage post={post} kind={kind} />
      <div className="mt-5">
        {source ? (
          <p className="inline-flex rounded-md bg-[#E7E0CC] px-3 py-1 font-sans text-[20px] leading-[1.15] font-medium tracking-[-0.01em] text-[#8B7E2A]">
            {source}
          </p>
        ) : null}
        <h2 className={`font-sans text-[26px] leading-[1.15] font-bold tracking-[-0.01em] text-[#762323] ${source ? "mt-4" : "mt-1"}`}>
          {title}
        </h2>
        {summary ? <p className="mt-3 line-clamp-2 font-serif text-[16px] leading-snug text-[#8B7E2A]">{summary}</p> : null}
        <div className="mt-6 flex items-baseline justify-between gap-4 text-[#8B7E2A]">
          <span className="font-sans text-[25px] leading-[1.15] font-medium tracking-[-0.01em]">Read More</span>
          {date ? (
            <time dateTime={post.date} className="font-sans text-[20px] leading-[1.15] font-medium tracking-[-0.01em]">
              {date}
            </time>
          ) : null}
        </div>
      </div>
    </>
  );

  const className = "group block rounded-[18px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A4911B]";

  if (kind === "press") {
    if (!post.press_coverage_link) return <article className={className}>{body}</article>;
    return (
      <a href={post.press_coverage_link} target="_blank" rel="noopener noreferrer" className={className}>
        {body}
      </a>
    );
  }

  return (
    <Link href={blogPath(post)} className={className}>
      {body}
    </Link>
  );
}

export default function MediaListing({
  kind,
  initial,
  unavailable = false,
}: {
  kind: StoryKind;
  initial: MediaList;
  unavailable?: boolean;
}) {
  const [items, setItems] = useState(initial.items);
  const [page, setPage] = useState(initial.currentPage || 1);
  const [totalPages, setTotalPages] = useState(initial.totalPages || 1);
  const [visible, setVisible] = useState(Math.min(STEP, initial.items.length));
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(unavailable);
  const content = copy[kind];
  const hasMore = visible < items.length || page < totalPages;
  const pageRef = useRef(page);
  pageRef.current = page;

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/media?type=${kind}&page=1`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load");
        return (await response.json()) as MediaList;
      })
      .then((data) => {
        if (pageRef.current > 1) return;
        setItems(data.items);
        setPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 1);
        setVisible(Math.min(STEP, data.items.length));
        setFailed(data.items.length === 0);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (pageRef.current === 1 && initial.items.length === 0) setFailed(true);
      });
    return () => controller.abort();
  }, [kind, initial.items.length]);

  const viewMore = async () => {
    if (loading) return;
    const target = visible + STEP;
    if (target <= items.length || page >= totalPages) {
      setVisible(Math.min(target, items.length));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/media?type=${kind}&page=${page + 1}`);
      if (!response.ok) throw new Error("Unable to load more");
      const data = (await response.json()) as MediaList;
      const merged = [...items];
      const seen = new Set(items.map((item) => item.id));
      for (const item of data.items) {
        if (!seen.has(item.id)) merged.push(item);
      }
      setItems(merged);
      setPage(data.currentPage || page + 1);
      setTotalPages(data.totalPages || totalPages);
      setVisible(Math.min(target, merged.length));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MediaFrame>
      <header className="mx-auto mt-8 max-w-4xl text-center sm:mt-10">
        <h1 className="font-sans text-[65px] leading-[1.2] font-bold tracking-[-0.01em] text-[#762323]">{content.title}</h1>
        <p className="mt-4 font-serif text-[30px] leading-[1.35] font-normal tracking-[-0.02em] text-[#8B7E2A]">{content.subtitle}</p>
      </header>

      {items.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 sm:mt-12 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, visible).map((post) => (
            <MediaCard key={post.id} post={post} kind={kind} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center font-serif text-[18px] text-[#762323]">{content.empty}</p>
      )}

      {failed && items.length > 0 ? (
        <p className="mt-8 text-center font-serif text-[16px] text-[#762323]">More stories could not be loaded.</p>
      ) : null}

      {hasMore ? (
        <div className="mt-12 flex justify-center sm:mt-14">
          <button
            type="button"
            onClick={viewMore}
            disabled={loading}
            className="cursor-pointer rounded-full bg-[#A4911B] px-12 py-3 font-sans text-[45px] leading-[1.2] font-bold tracking-[-0.03em] text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? "Loading…" : "View More"}
          </button>
        </div>
      ) : null}
    </MediaFrame>
  );
}
