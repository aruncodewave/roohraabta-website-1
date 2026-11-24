import type { Metadata } from "next";
import PodcastShow from "@/components/media/PodcastShow";
import { fetchPodcastShow } from "@/lib/media/podcast";
import type { PodcastShow as PodcastShowData } from "@/lib/media/podcast";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Heart to Heart | Vows for Eternity",
  description: "Heart to Heart with Anuradda Gupta. Conversations on love, relationships, and the stories that connect us.",
};

const empty: PodcastShowData = { title: "Heart to Heart", seasons: [] };

export default async function HeartToHeartPage() {
  try {
    return <PodcastShow initial={await fetchPodcastShow()} />;
  } catch {
    return <PodcastShow initial={empty} unavailable />;
  }
}
