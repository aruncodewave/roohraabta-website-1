"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PodcastEpisode, PodcastShow as Show } from "@/lib/media/podcast";

const RATES = [1, 1.5, 2];
const VINYL_HEIGHT = 570;
const VINYL_SCALE = VINYL_HEIGHT / 913;
const VINYL_WIDTH = 500 * VINYL_SCALE;
const LABEL_X = 30 * VINYL_SCALE;
const LABEL_Y = 450 * VINYL_SCALE;
const DISC_RADIUS = 460 * VINYL_SCALE;

function episodeMark(seconds: number) {
  if (!seconds) return "";
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const remain = total % 60;
  return `${minutes}.${String(remain).padStart(2, "0")}`;
}

function playerTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remain = total % 60;
  const clock = `${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`;
  return hours > 0 ? `${hours}:${clock}` : clock;
}

function shortDescription(value: string) {
  const sentences = value.match(/[^.!?]+[.!?]+/g);
  if (!sentences?.length) return value;
  return sentences.slice(0, 2).join(" ").trim();
}

function openingEpisode(show: Show) {
  const season = show.seasons[0];
  if (!season) return null;
  return season.episodes.find((episode) => /introducing/i.test(episode.title)) ?? season.episodes[0] ?? null;
}

export default function PodcastShow({ initial, unavailable = false }: { initial: Show; unavailable?: boolean }) {
  const [show, setShow] = useState(initial);
  const [seasonId, setSeasonId] = useState(initial.seasons[0]?.id ?? 0);
  const [current, setCurrent] = useState<PodcastEpisode | null>(() => openingEpisode(initial));
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(() => openingEpisode(initial)?.duration ?? 0);
  const [rate, setRate] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [muted, setMuted] = useState(false);
  const [failed, setFailed] = useState(unavailable);
  const [infoOpen, setInfoOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startScroll: number } | null>(null);
  const [scrollBar, setScrollBar] = useState({ track: 400, thumb: 160, top: 0, active: false });
  const playbackRef = useRef({ shuffle, repeat, current, seasonId, show });
  playbackRef.current = { shuffle, repeat, current, seasonId, show };

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/media/podcasts", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load");
        return (await response.json()) as Show;
      })
      .then((data) => {
        if (!data.seasons?.length) {
          setFailed(true);
          return;
        }
        setShow(data);
        setFailed(false);
        setSeasonId((currentSeason) => data.seasons.some((season) => season.id === currentSeason) ? currentSeason : data.seasons[0].id);
        setCurrent((episode) => {
          if (episode && data.seasons.some((season) => season.episodes.some((item) => item.id === episode.id))) return episode;
          return openingEpisode(data);
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (initial.seasons.length === 0) setFailed(true);
      });
    return () => controller.abort();
  }, [initial.seasons.length]);

  const season = show.seasons.find((item) => item.id === seasonId) ?? show.seasons[0];

  const syncScrollBar = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const { scrollHeight, clientHeight, scrollTop } = el;
    const active = scrollHeight > clientHeight + 1;
    const thumb = active ? Math.max((clientHeight / scrollHeight) * clientHeight, 48) : clientHeight;
    const maxTop = Math.max(clientHeight - thumb, 0);
    const top = active ? (scrollTop / (scrollHeight - clientHeight)) * maxTop : 0;
    setScrollBar({ track: clientHeight, thumb, top, active });
  }, []);

  useEffect(() => {
    syncScrollBar();
    const el = listRef.current;
    if (!el) return;
    const observer = new ResizeObserver(syncScrollBar);
    observer.observe(el);
    return () => observer.disconnect();
  }, [syncScrollBar, season?.id, season?.episodes.length]);

  const onThumbPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = listRef.current;
    if (!el) return;
    dragRef.current = { startY: event.clientY, startScroll: el.scrollTop };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onThumbPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const el = listRef.current;
    if (!drag || !el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const maxTop = el.clientHeight - scrollBar.thumb;
    if (maxScroll <= 0 || maxTop <= 0) return;
    el.scrollTop = drag.startScroll + ((event.clientY - drag.startY) / maxTop) * maxScroll;
  };

  const startEpisode = (episode: PodcastEpisode) => {
    const audio = audioRef.current;
    if (!audio || !episode.audioUrl) return;
    setCurrent(episode);
    setDuration(episode.duration);
    const sameTrack = audio.dataset.track === episode.id && audio.currentSrc;
    if (!sameTrack) {
      audio.dataset.loading = "1";
      audio.dataset.track = episode.id;
      audio.src = episode.audioUrl;
      setProgress(0);
    }
    audio.playbackRate = rate;
    audio.muted = muted;
    void audio.play().then(() => setPlaying(true)).catch(() => {
      audio.dataset.loading = "0";
      setPlaying(false);
    });
  };

  const seekBy = (seconds: number) => {
    const audio = audioRef.current;
    const base = audio && audio.dataset.track === current?.id ? audio.currentTime : progress;
    const limit = duration || (audio && Number.isFinite(audio.duration) ? audio.duration : 0);
    const next = Math.min(Math.max(0, base + seconds), limit || Math.max(0, base + seconds));
    setProgress(next);
    if (audio && audio.readyState > 0) audio.currentTime = next;
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!current || audio.dataset.track !== current.id) {
      if (current?.audioUrl) startEpisode(current);
      else {
        const first = season?.episodes.find((episode) => episode.audioUrl);
        if (first) startEpisode(first);
      }
      return;
    }
    if (audio.paused) {
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      return;
    }
    audio.pause();
    setPlaying(false);
  };

  const move = (direction: 1 | -1) => {
    const episodes = season?.episodes.filter((episode) => episode.audioUrl) ?? [];
    if (!episodes.length) return;
    if (playbackRef.current.shuffle && direction === 1) {
      const others = episodes.filter((episode) => episode.id !== current?.id);
      const pick = others[Math.floor(Math.random() * others.length)] ?? episodes[0];
      startEpisode(pick);
      return;
    }
    const index = episodes.findIndex((episode) => episode.id === current?.id);
    const next = episodes[(index + direction + episodes.length) % episodes.length];
    if (next) startEpisode(next);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setProgress(audio.currentTime);
      if (!audio.paused) setPlaying(true);
    };
    const onMeta = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration);
    };
    const onPlaying = () => {
      audio.dataset.loading = "0";
      setPlaying(true);
    };
    const onEnded = () => {
      const state = playbackRef.current;
      if (state.repeat && state.current) {
        audio.currentTime = 0;
        void audio.play();
        return;
      }
      const episodes = (state.show.seasons.find((item) => item.id === state.seasonId) ?? state.show.seasons[0])?.episodes.filter(
        (episode) => episode.audioUrl,
      ) ?? [];
      if (!episodes.length) return;
      const index = episodes.findIndex((episode) => episode.id === state.current?.id);
      const next = state.shuffle
        ? episodes.filter((episode) => episode.id !== state.current?.id)[Math.floor(Math.random() * Math.max(episodes.length - 1, 1))] ?? episodes[0]
        : episodes[(index + 1) % episodes.length];
      if (!next || (!state.shuffle && index === episodes.length - 1 && !state.repeat)) {
        setPlaying(false);
        return;
      }
      audio.dataset.loading = "1";
      audio.dataset.track = next.id;
      setCurrent(next);
      setDuration(next.duration);
      setProgress(0);
      audio.src = next.audioUrl;
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    };
    const onPause = () => {
      if (audio.dataset.loading === "1") return;
      window.setTimeout(() => {
        if (audio.paused) setPlaying(false);
      }, 0);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-cream pb-28 pt-16 sm:pt-20 lg:pb-40">
      <div className="relative">
        <div className="pointer-events-none absolute top-2 left-0 hidden lg:block" style={{ width: VINYL_WIDTH, height: VINYL_HEIGHT }} aria-hidden="true">
          <img src="/images/podcastImage3.png" alt="" className="h-full w-full object-fill" />
          <div
            className="absolute rounded-full border-[5px] border-[#A4911B]"
            style={{ width: DISC_RADIUS * 2, height: DISC_RADIUS * 2, left: LABEL_X - DISC_RADIUS, top: LABEL_Y - DISC_RADIUS }}
          />
        </div>

        <div className="relative z-10 px-5 sm:px-8 lg:pr-12 lg:pl-[420px]">
          <h2 className="type-hero text-center text-[70px] text-[#762323]">
            {show.title}
          </h2>
          {show.seasons.length > 0 ? (
            <div className="mt-6 flex gap-8">
              {show.seasons.map((item) => {
                const active = item.id === season?.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSeasonId(item.id)}
                    className={`type-body cursor-pointer pb-1 text-[#762323] ${
                      active ? "border-b-2 border-[#A4911B]" : ""
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          {season?.description ? (
            <p className="type-body-lg mt-6 max-w-[980px] text-[24px] text-[#762323]">
              {shortDescription(season.description)}
            </p>
          ) : null}

          {failed && show.seasons.length === 0 ? (
            <p className="type-body-sm mt-8 text-[#762323]">Podcasts are unavailable right now.</p>
          ) : null}

          {season && season.episodes.length > 0 ? (
            <div className="mt-8 flex max-w-[980px] items-start gap-2 sm:gap-6">
            <div ref={listRef} onScroll={syncScrollBar} className="podcast-scroll max-h-[304px] min-w-0 flex-1 overflow-y-auto sm:max-h-[400px]">
              {season.episodes.map((episode) => {
                const active = episode.id === current?.id;
                const tone = active ? "text-[#762323] decoration-[#762323]" : "text-[#8B7E2A] decoration-[#8B7E2A]";
                return (
                  <button
                    key={episode.id}
                    type="button"
                    onClick={() => (episode.id === current?.id ? togglePlayback() : startEpisode(episode))}
                    aria-pressed={active}
                    className="grid h-[76px] w-full cursor-pointer grid-cols-[26px_36px_minmax(0,1fr)_auto] items-center gap-x-1.5 text-left sm:h-[100px] sm:grid-cols-[44px_60px_minmax(0,1fr)_auto] sm:gap-x-4"
                  >
                    <span className="type-label text-[#762323]">
                      {String(episode.number).padStart(2, "0")}
                    </span>
                    <img src="/images/podcastImage2.png" alt="" className="h-9 w-9 rounded-[6px] object-cover sm:h-14 sm:w-14" />
                    <span className={`type-body truncate pr-2 underline decoration-1 underline-offset-[3px] sm:pr-8 ${tone}`}>
                      {episode.title}
                    </span>
                    <span className="type-label pl-1 text-right text-[#762323] sm:pl-4 sm:pr-2">
                      {episodeMark(episode.duration)}
                    </span>
                  </button>
                );
              })}
            </div>
            <div
              className="relative w-2 shrink-0 rounded-full bg-[#E7E2D8] sm:w-4"
              style={{ height: scrollBar.track }}
              aria-hidden="true"
            >
              <div
                className="absolute inset-x-0 cursor-grab touch-none rounded-full bg-[#C6A35A] active:cursor-grabbing"
                style={{ height: scrollBar.thumb, top: scrollBar.top }}
                onPointerDown={onThumbPointerDown}
                onPointerMove={onThumbPointerMove}
                onPointerUp={() => {
                  dragRef.current = null;
                }}
              />
            </div>
            </div>
          ) : null}

          <div
            className="mt-16 flex min-h-[168px] w-full items-center rounded-[36px] bg-[#B8A6571A] px-4 py-5 sm:mt-24 sm:rounded-[56px] sm:px-6 lg:mt-32 lg:-ml-[171px] lg:w-[min(1230px,calc(100vw-273px))] lg:rounded-[78px] lg:px-10"
          >
            <div className="min-w-0 flex-1">
              {infoOpen && season?.description ? (
                <p className="type-caption mx-auto mb-2 line-clamp-2 max-w-xl text-center text-[#762323]">
                  {shortDescription(season.description)}
                </p>
              ) : null}
              <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-8 sm:mt-7 sm:gap-x-0 sm:gap-y-0">
                <div className="col-start-1 row-start-1 flex shrink-0 items-center gap-2 sm:gap-5 lg:gap-7">
                <button
                  type="button"
                  onClick={() => {
                    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length] ?? 1;
                    setRate(next);
                    if (audioRef.current) audioRef.current.playbackRate = next;
                  }}
                  className="type-body-sm shrink-0 cursor-pointer leading-none text-[#762323]"
                  aria-label={`Playback speed ${rate} times`}
                >
                  {rate} x
                </button>
                <button type="button" onClick={() => seekBy(-15)} aria-label="Rewind 15 seconds" className="relative h-6 w-[22px] shrink-0 cursor-pointer sm:h-8 sm:w-[29px]">
                  <img src="/icons/replay1.svg" alt="" className="h-full w-full" />
                  <span className="type-caption pointer-events-none absolute top-[54%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] leading-none text-[#79211E]">15</span>
                </button>
                <button type="button" onClick={() => seekBy(30)} aria-label="Forward 30 seconds" className="relative h-6 w-[22px] shrink-0 cursor-pointer sm:h-8 sm:w-[29px]">
                  <img src="/icons/replay2.svg" alt="" className="h-full w-full" />
                  <span className="type-caption pointer-events-none absolute top-[54%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] leading-none text-[#79211E]">30</span>
                </button>
                </div>
                <div className="col-span-3 row-start-2 flex min-w-0 justify-center sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:px-8 lg:px-14">
                  <div className="relative w-full max-w-[715px]">
                    <p className="type-body-sm absolute bottom-full left-0 mb-1.5 max-w-full truncate leading-none text-[#A4911B] sm:mb-2">
                      {current?.title ?? "Select an episode"}
                    </p>
                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      step={0.1}
                      value={Math.min(progress, duration || 0)}
                      aria-label="Seek"
                      onChange={(event) => {
                        const audio = audioRef.current;
                        const next = Number(event.target.value);
                        setProgress(next);
                        if (audio && audio.readyState > 0) audio.currentTime = next;
                      }}
                      style={{ ["--seek" as string]: `${duration ? (Math.min(progress, duration) / duration) * 100 : 0}%` }}
                      className="podcast-seek h-[5.33px] w-full cursor-pointer"
                    />
                    <div className="type-caption absolute inset-x-0 top-full mt-2 flex justify-between leading-none text-black">
                      <span>{playerTime(progress)}</span>
                      <span>{playerTime(duration)}</span>
                    </div>
                  </div>
                </div>
                <div className="col-start-3 row-start-1 flex shrink-0 items-center gap-2 sm:gap-5 lg:gap-7">
                <img src="/icons/dot.svg" alt="" className="h-1 w-4 shrink-0 sm:h-[5px] sm:w-5" />
                <button
                  type="button"
                  aria-expanded={infoOpen}
                  aria-label="Episode details"
                  onClick={() => setInfoOpen((open) => !open)}
                  className="shrink-0 cursor-pointer"
                >
                  <img src="/icons/info.svg" alt="" className="h-4 w-4 sm:h-6 sm:w-6" />
                </button>
                <button
                  type="button"
                  aria-label="Show episodes"
                  onClick={() => document.querySelector(".podcast-scroll")?.scrollIntoView({ behavior: "smooth", block: "center" })}
                  className="shrink-0 cursor-pointer"
                >
                  <img src="/icons/lines.svg" alt="" className="h-3 w-3 sm:h-[13px] sm:w-4" />
                </button>
                <button
                  type="button"
                  aria-label={muted ? "Unmute" : "Mute"}
                  aria-pressed={muted}
                  onClick={() => {
                    const next = !muted;
                    setMuted(next);
                    if (audioRef.current) audioRef.current.muted = next;
                  }}
                  className="shrink-0 cursor-pointer"
                >
                  <img src="/icons/speaker.svg" alt="" className={`h-3.5 w-4 sm:h-4 sm:w-5 ${muted ? "opacity-40" : ""}`} />
                </button>
                </div>
                <div className="col-span-3 row-start-3 mt-6 flex justify-center sm:mt-8 xl:col-span-1 xl:col-start-2 xl:row-start-2 xl:px-14">
                  <div className="grid w-max max-w-full grid-cols-[1fr_auto_1fr] items-center">
                    <div className="flex shrink-0 items-center justify-end gap-4 pr-4 xl:gap-10 xl:pr-14">
                      <button
                        type="button"
                        aria-pressed={shuffle}
                        aria-label="Shuffle"
                        onClick={() => setShuffle((value) => !value)}
                        className={`mr-4 shrink-0 cursor-pointer rounded-full xl:mr-12 ${shuffle ? "ring-2 ring-[#A4911B] ring-offset-2" : ""}`}
                      >
                        <img src="/icons/reverse1.svg" alt="" className="h-6 w-9 shrink-0" />
                      </button>
                      <button type="button" aria-label="Previous episode" onClick={() => move(-1)} className="shrink-0 cursor-pointer">
                        <img src="/icons/prev.svg" alt="" className="h-6 w-6 shrink-0" />
                      </button>
                    </div>
                    <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={togglePlayback} className="shrink-0 cursor-pointer">
                      {playing ? (
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center gap-1 rounded-full bg-[#762323]">
                          <span className="h-4 w-1 bg-white" />
                          <span className="h-4 w-1 bg-white" />
                        </span>
                      ) : (
                        <img src="/icons/play.svg" alt="" className="h-11 w-11 shrink-0" />
                      )}
                    </button>
                    <div className="flex shrink-0 items-center justify-start gap-4 pl-4 xl:gap-10 xl:pl-14">
                      <button type="button" aria-label="Next episode" onClick={() => move(1)} className="shrink-0 cursor-pointer">
                        <img src="/icons/next.svg" alt="" className="h-6 w-6 shrink-0" />
                      </button>
                      <button
                        type="button"
                        aria-pressed={repeat}
                        aria-label="Repeat"
                        onClick={() => setRepeat((value) => !value)}
                        className={`ml-4 shrink-0 cursor-pointer rounded-full xl:ml-12 ${repeat ? "ring-2 ring-[#A4911B] ring-offset-2" : ""}`}
                      >
                        <img src="/icons/reverse2.svg" alt="" className="h-6 w-8 shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <audio ref={audioRef} preload="none" />
      <style>{`
        .podcast-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .podcast-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .podcast-seek { appearance: none; background: transparent; }
        .podcast-seek::-webkit-slider-runnable-track { height: 5.33px; background: linear-gradient(to right, #A4911B var(--seek, 0%), rgba(164, 145, 27, 0.4) var(--seek, 0%)); border-radius: 999px; }
        .podcast-seek::-webkit-slider-thumb { appearance: none; width: 5.68px; height: 16.65px; margin-top: -5.66px; border: 0; border-radius: 999px; background: #3a2a1a; }
        .podcast-seek::-moz-range-track { height: 5.33px; background: linear-gradient(to right, #A4911B var(--seek, 0%), rgba(164, 145, 27, 0.4) var(--seek, 0%)); border: 0; border-radius: 999px; }
        .podcast-seek::-moz-range-thumb { width: 5.68px; height: 16.65px; border: 0; border-radius: 999px; background: #3a2a1a; }
      `}</style>
    </section>
  );
}
