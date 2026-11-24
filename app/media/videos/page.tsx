import type { Metadata } from "next";
import VideoListing from "@/components/media/VideoListing";
import { fetchMediaList } from "@/lib/media/wordpress";
import type { MediaList } from "@/lib/media/types";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Videos | Vows for Eternity",
  description: "Stories, conversations, and perspectives worth watching.",
};

const empty: MediaList = { items: [], currentPage: 1, totalPages: 1, totalPosts: 0 };

export default async function VideosPage() {
  try {
    const initial = await fetchMediaList("videos", 1);
    return <VideoListing initial={initial} />;
  } catch {
    return <VideoListing initial={empty} unavailable />;
  }
}
