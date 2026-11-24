import { decodeEntities, stripHtml } from "@/lib/media/format";
import { getWordpressUrl } from "@/lib/vfe/config";

export type PodcastEpisode = {
  id: string;
  number: number;
  title: string;
  audioUrl: string;
  duration: number;
};

export type PodcastSeason = {
  id: number;
  label: string;
  description: string;
  episodes: PodcastEpisode[];
};

export type PodcastShow = {
  title: string;
  seasons: PodcastSeason[];
};

type WordpressPodcast = {
  id?: number;
  description?: string;
  poadcast_season?: string;
  poadcast_episodes?: string;
};

type AudioTrack = {
  title: string;
  url: string;
  duration: number;
};

const RSS_URL = "https://feeds.megaphone.fm/ISP4835260754";
const STOP_WORDS = new Set(["heart", "to", "conversation", "with", "speaking", "the", "and", "into", "for"]);

function seasonNumber(label: string) {
  const match = label.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function parseClock(raw: string) {
  const value = raw.trim();
  if (/^\d+$/.test(value)) return Number(value);
  const parts = value.split(":").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function audioUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "traffic.megaphone.fm") return "";
    return url.toString();
  } catch {
    return "";
  }
}

function parseEpisodes(html: string) {
  const episodes: { number: number; title: string }[] = [];
  const pattern = /<li>\s*<strong>\s*Ep\s*(\d+)\s*:?\s*<\/strong>\s*<a\s+href="[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(pattern)) {
    const title = stripHtml(match[2] ?? "");
    const number = Number(match[1]);
    if (title && Number.isFinite(number)) episodes.push({ number, title });
  }
  return episodes.sort((a, b) => a.number - b.number);
}

function tokens(value: string) {
  return decodeEntities(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function matchTrack(title: string, tracks: AudioTrack[]) {
  if (/sneak|trailer/i.test(title) && /season\s*2/i.test(title)) {
    return tracks.find((track) => /trailer/i.test(track.title) && /season\s*2/i.test(track.title)) ?? null;
  }
  if (/sneak|trailer/i.test(title)) {
    return tracks.find((track) => /sneak/i.test(track.title)) ?? null;
  }

  const wanted = tokens(title);
  let best: AudioTrack | null = null;
  let bestScore = 0;
  for (const track of tracks) {
    const have = new Set(tokens(track.title));
    const score = wanted.filter((word) => have.has(word)).length;
    if (score > bestScore) {
      best = track;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : null;
}

function parseRss(xml: string): AudioTrack[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];
  return items.flatMap((block) => {
    const title = stripHtml(block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1] ?? "");
    const url = audioUrl(block.match(/<enclosure[^>]*\surl="([^"]+)"/i)?.[1] ?? "");
    const duration = parseClock(block.match(/<itunes:duration>([\s\S]*?)<\/itunes:duration>/i)?.[1] ?? "0");
    return title && url ? [{ title, url, duration }] : [];
  });
}

async function fetchTracks() {
  try {
    const response = await fetch(RSS_URL, { next: { revalidate: 60 * 60 } });
    if (!response.ok) return [];
    return parseRss(await response.text());
  } catch {
    return [];
  }
}

export async function fetchPodcastShow(): Promise<PodcastShow> {
  const response = await fetch(`${getWordpressUrl()}/wp-json/custom/v1/poadcastlist`, {
    next: { revalidate: 120 },
  });
  if (!response.ok) throw new Error(`Failed to fetch podcasts: ${response.status}`);

  const data = (await response.json()) as { posts?: WordpressPodcast[] };
  const tracks = await fetchTracks();
  const seasons = (data.posts ?? [])
    .map((post) => {
      const label = post.poadcast_season?.trim() || "Season";
      const episodes = parseEpisodes(post.poadcast_episodes ?? "").map((episode) => {
        const track = matchTrack(episode.title, tracks);
        return {
          id: `${post.id ?? label}-${episode.number}`,
          number: episode.number,
          title: episode.title,
          audioUrl: track?.url ?? "",
          duration: track?.duration ?? 0,
        };
      });
      return {
        id: Number(post.id),
        label,
        description: stripHtml(post.description ?? ""),
        episodes,
        order: seasonNumber(label),
      };
    })
    .filter((season) => Number.isFinite(season.id))
    .sort((a, b) => a.order - b.order)
    .map(({ order: _order, ...season }) => season);

  return { title: "Heart to Heart", seasons };
}
