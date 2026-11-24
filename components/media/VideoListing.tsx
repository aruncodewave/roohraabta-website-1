"use client";

import { useEffect, useRef, useState } from "react";
import { MediaFrame } from "@/components/media/MediaFrame";
import { decodeEntities, formatMediaDate } from "@/lib/media/format";
import type { MediaList, MediaPost } from "@/lib/media/types";

const STEP = 6;

function thumbnailCandidates(video: MediaPost) {
  const fromYoutube = video.youtubeId
    ? ["maxresdefault", "sddefault", "hqdefault"].map((size) => `https://i.ytimg.com/vi/${video.youtubeId}/${size}.jpg`)
    : [];
  return [...fromYoutube, video.featured_image].filter(Boolean);
}

function VideoThumb({ video }: { video: MediaPost }) {
  const candidates = thumbnailCandidates(video);
  const [index, setIndex] = useState(0);
  const src = candidates[index];

  const advance = () => setIndex((current) => current + 1);

  return (
    <div className="relative overflow-hidden rounded-[16px] bg-[#F6F1E4]">
      {src ? (
        <img
          src={src}
          alt=""
          onLoad={(event) => {
            if (event.currentTarget.naturalWidth > 0 && event.currentTarget.naturalWidth <= 120) advance();
          }}
          onError={advance}
          className="aspect-video w-full object-cover"
        />
      ) : (
        <div className="flex aspect-video items-center justify-center px-4 font-serif text-[16px] text-[#8B7E2A]">
          Image not available
        </div>
      )}
      {video.duration ? (
        <span
          className="absolute right-2.5 bottom-2.5 rounded-md bg-black/80 px-2 py-1 text-[13px] leading-none font-medium tracking-wide text-white"
          style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
        >
          {video.duration}
        </span>
      ) : null}
    </div>
  );
}

function VideoCard({ video }: { video: MediaPost }) {
  const [playing, setPlaying] = useState(false);
  const title = decodeEntities(video.title);
  const date = formatMediaDate(video.date);
  const canPlay = Boolean(video.youtubeId);

  const play = () => {
    if (canPlay) setPlaying(true);
  };

  const copy = (
    <>
      <h2 className="mt-4 font-sans text-[26px] leading-[1.15] font-bold tracking-[-0.01em] text-[#762323]">{title}</h2>
      {date ? (
        <time dateTime={video.date} className="mt-3 block font-sans text-[20px] leading-[1.15] font-medium tracking-[-0.01em] text-[#8B7E2A]">
          {date}
        </time>
      ) : null}
    </>
  );

  return (
    <article className="rounded-[18px]">
      {playing && canPlay ? (
        <div className="overflow-hidden rounded-[16px] bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="aspect-video w-full"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={play}
          disabled={!canPlay}
          aria-label={canPlay ? `Play ${title}` : undefined}
          className="block w-full cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A4911B] disabled:cursor-default"
        >
          <VideoThumb video={video} />
        </button>
      )}
      {playing || !canPlay ? (
        copy
      ) : (
        <button type="button" onClick={play} className="block w-full cursor-pointer text-left">
          {copy}
        </button>
      )}
    </article>
  );
}

export default function VideoListing({ initial, unavailable = false }: { initial: MediaList; unavailable?: boolean }) {
  const [items, setItems] = useState(initial.items);
  const [page, setPage] = useState(initial.currentPage || 1);
  const [totalPages, setTotalPages] = useState(initial.totalPages || 1);
  const [visible, setVisible] = useState(Math.min(STEP, initial.items.length));
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(unavailable);
  const hasMore = visible < items.length || page < totalPages;
  const pageRef = useRef(page);
  pageRef.current = page;

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/media?type=videos&page=1", { signal: controller.signal })
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
  }, [initial.items.length]);

  const viewMore = async () => {
    if (loading) return;
    const target = visible + STEP;
    if (target <= items.length || page >= totalPages) {
      setVisible(Math.min(target, items.length));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/media?type=videos&page=${page + 1}`);
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
        <h1 className="font-sans text-[65px] leading-[1.2] font-bold tracking-[-0.01em] text-[#762323]">Videos</h1>
        <p className="mt-4 font-serif text-[30px] leading-[1.35] font-normal tracking-[-0.02em] text-[#8B7E2A]">
          Stories, conversations, and perspectives worth watching.
        </p>
      </header>

      {items.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 sm:mt-12 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, visible).map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center font-serif text-[18px] text-[#762323]">
          {failed ? "Videos are unavailable right now." : "No videos yet."}
        </p>
      )}

      {failed && items.length > 0 ? (
        <p className="mt-8 text-center font-serif text-[16px] text-[#762323]">More videos could not be loaded.</p>
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
