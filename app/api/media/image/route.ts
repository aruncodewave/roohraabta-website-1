import { stripLogoPlate } from "@/lib/media/stripLogo";

const HOST = "prod-wordpress.vowsforeternity.com";

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get("src");
  let url: URL;
  try {
    url = new URL(src ?? "");
  } catch {
    return new Response("Invalid image", { status: 400 });
  }

  if (url.protocol !== "https:" || url.hostname !== HOST || !url.pathname.startsWith("/wp-content/")) {
    return new Response("Invalid image", { status: 400 });
  }

  const upstream = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
  if (!upstream.ok) return new Response("Image unavailable", { status: 502 });

  const type = upstream.headers.get("content-type") || "image/jpeg";
  const original = Buffer.from(await upstream.arrayBuffer());

  try {
    const cleaned = await stripLogoPlate(original);
    if (!cleaned) {
      return new Response(original, {
        headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400" },
      });
    }
    return new Response(new Uint8Array(cleaned), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return new Response(original, {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=300" },
    });
  }
}
