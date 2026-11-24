import type { Metadata } from "next";
import MediaListing from "@/components/media/MediaListing";
import { fetchMediaList } from "@/lib/media/wordpress";
import type { MediaList } from "@/lib/media/types";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Blogs | Vows for Eternity",
  description:
    "A collection of thoughts, insights, and stories to inspire a deeper understanding of love, relationships, and the journeys that bring us together.",
};

const empty: MediaList = { items: [], currentPage: 1, totalPages: 1, totalPosts: 0 };

export default async function BlogPage() {
  try {
    const initial = await fetchMediaList("posts", 1);
    return <MediaListing kind="posts" initial={initial} />;
  } catch {
    return <MediaListing kind="posts" initial={empty} unavailable />;
  }
}
