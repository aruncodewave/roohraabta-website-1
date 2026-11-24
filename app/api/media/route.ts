import { fetchMediaList } from "@/lib/media/wordpress";
import type { MediaKind } from "@/lib/media/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const page = Number(searchParams.get("page"));

  if (type !== "posts" && type !== "press" && type !== "videos") {
    return Response.json({ error: "Invalid type" }, { status: 400 });
  }

  if (!Number.isInteger(page) || page < 1 || page > 100) {
    return Response.json({ error: "Invalid page" }, { status: 400 });
  }

  try {
    const list = await fetchMediaList(type as MediaKind, page);
    return Response.json(list);
  } catch {
    return Response.json({ error: "Unable to load stories" }, { status: 502 });
  }
}
