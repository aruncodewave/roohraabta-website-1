import { fetchPodcastShow } from "@/lib/media/podcast";

export async function GET() {
  try {
    return Response.json(await fetchPodcastShow());
  } catch {
    return Response.json({ error: "Unable to load podcasts" }, { status: 502 });
  }
}
