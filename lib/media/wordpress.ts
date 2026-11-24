import { unstable_cache } from "next/cache";
import { formatClock } from "@/lib/media/format";
import { getWordpressUrl } from "@/lib/vfe/config";
import type { MediaArticle, MediaKind, MediaList, MediaNeighbor, MediaPost } from "@/lib/media/types";

type RawPost = Partial<MediaPost> & {
  "yt-iframe-small"?: string;
  "yt-iframe-large"?: string;
};

type WordpressListResponse = {
  posts?: RawPost[];
  currentPage?: number;
  totalPages?: number;
  totalPosts?: number;
};

type WordpressPostResponse = {
  post?: { id?: number; title?: string; description?: string } | null;
  previous_post?: { id?: number; title?: string; link?: string } | null;
  next_post?: { id?: number; title?: string; link?: string } | null;
};

const ENDPOINTS: Record<MediaKind, string> = {
  posts: "posts",
  press: "press-coverage",
  videos: "videolist",
};

// Public key shipped in YouTube's own web client. Used only to read the length of public videos.
const YOUTUBE_CLIENT_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

function youtubeIdFrom(raw: RawPost) {
  const source = `${raw["yt-iframe-small"] ?? ""} ${raw["yt-iframe-large"] ?? ""}`;
  return source.match(/youtube\.com\/embed\/([\w-]{11})/)?.[1] ?? "";
}

function normalizePost(raw: RawPost): MediaPost {
  return {
    id: Number(raw.id),
    title: raw.title ?? "",
    description: raw.description ?? "",
    date: raw.date ?? "",
    featured_image: raw.featured_image ?? "",
    link: raw.link ?? "",
    press_coverage_link: raw.press_coverage_link ?? "",
    youtubeId: youtubeIdFrom(raw),
    duration: "",
  };
}

async function readYoutubeDuration(videoId: string) {
  try {
    const response = await fetch(
      `https://www.youtube.com/youtubei/v1/player?key=${YOUTUBE_CLIENT_KEY}&prettyPrint=false`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          context: {
            client: {
              clientName: "ANDROID",
              clientVersion: "20.10.38",
              androidSdkVersion: 30,
              hl: "en",
            },
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      },
    );
    if (!response.ok) return "";
    const data = (await response.json()) as { videoDetails?: { lengthSeconds?: string } };
    return formatClock(Number(data.videoDetails?.lengthSeconds));
  } catch {
    return "";
  }
}

const cachedYoutubeDuration = unstable_cache(readYoutubeDuration, ["youtube-video-duration"], {
  revalidate: 60 * 60 * 24,
});

function normalizeNeighbor(raw: WordpressPostResponse["previous_post"]): MediaNeighbor | null {
  if (!raw?.id || !raw.title) return null;
  return { id: Number(raw.id), title: raw.title, link: raw.link ?? "" };
}

export async function fetchMediaList(kind: MediaKind, page: number): Promise<MediaList> {
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const response = await fetch(
    `${getWordpressUrl()}/wp-json/custom/v1/${ENDPOINTS[kind]}/?page=${safePage}`,
    { next: { revalidate: 120 } },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch ${kind}: ${response.status}`);
  }

  const data = (await response.json()) as WordpressListResponse;
  const items = (data.posts ?? []).map(normalizePost).filter((post) => Number.isFinite(post.id));

  if (kind === "videos") {
    const durations = await Promise.all(items.map((item) => (item.youtubeId ? cachedYoutubeDuration(item.youtubeId) : "")));
    items.forEach((item, index) => {
      item.duration = durations[index] ?? "";
    });
  }

  return {
    items,
    currentPage: data.currentPage ?? safePage,
    totalPages: data.totalPages ?? 1,
    totalPosts: data.totalPosts ?? 0,
  };
}

async function fetchFeaturedImage(id: string) {
  try {
    const response = await fetch(
      `${getWordpressUrl()}/wp-json/wp/v2/posts/${id}?_embed=wp:featuredmedia&_fields=featured_media,_embedded`,
      { next: { revalidate: 120 } },
    );
    if (!response.ok) return "";
    const data = (await response.json()) as {
      _embedded?: { "wp:featuredmedia"?: { source_url?: string }[] };
    };
    return data._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? "";
  } catch {
    return "";
  }
}

export async function fetchMediaArticle(id: string): Promise<MediaArticle | null> {
  if (!/^\d+$/.test(id)) return null;

  const [response, featuredImage] = await Promise.all([
    fetch(`${getWordpressUrl()}/wp-json/custom/v1/post/${id}`, {
      next: { revalidate: 120 },
    }),
    fetchFeaturedImage(id),
  ]);

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Failed to fetch blog post ${id}: ${response.status}`);
  }

  const data = (await response.json()) as WordpressPostResponse;
  if (!data.post?.id || !data.post.title) return null;

  return {
    post: {
      id: Number(data.post.id),
      title: data.post.title,
      description: data.post.description ?? "",
      featuredImage,
    },
    previous: normalizeNeighbor(data.previous_post),
    next: normalizeNeighbor(data.next_post),
  };
}
