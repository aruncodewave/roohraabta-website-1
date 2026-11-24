import type { Metadata } from "next";
import MediaListing from "@/components/media/MediaListing";
import { fetchMediaList } from "@/lib/media/wordpress";
import type { MediaList } from "@/lib/media/types";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Press Coverage | Vows for Eternity",
  description: "A glimpse into how our work and stories have been featured across leading publications.",
};

const empty: MediaList = { items: [], currentPage: 1, totalPages: 1, totalPosts: 0 };

export default async function PressPage() {
  try {
    const initial = await fetchMediaList("press", 1);
    return <MediaListing kind="press" initial={initial} />;
  } catch {
    return <MediaListing kind="press" initial={empty} unavailable />;
  }
}
