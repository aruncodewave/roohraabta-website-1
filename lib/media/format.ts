const PUBLICATIONS: Record<string, string> = {
  "forbes.com": "Forbes",
  "reuters.com": "Reuters",
  "timesofindia.indiatimes.com": "Times Entertainment",
  "herzindagi.com": "HerZindagi.com",
  "bwwellbeingworld.com": "BW Wellbeing World",
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
  "indianexpress.com": "Indian Express",
  "news18.com": "News18",
  "zeenews.india.com": "Zee News",
  "outlookindia.com": "Outlook India",
  "ians.in": "IANS",
  "dailyhunt.in": "Dailyhunt",
  "m.dailyhunt.in": "Dailyhunt",
  "sugermint.com": "Sugermint",
};

export function decodeEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

export function stripHtml(html: string) {
  return decodeEntities(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

export function excerpt(html: string, limit = 118) {
  const firstParagraph = html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
  const text = stripHtml(firstParagraph?.[1] ?? html);
  if (text.length <= limit) return text;
  const clipped = text.slice(0, limit);
  const boundary = clipped.lastIndexOf(" ");
  return `${(boundary > 80 ? clipped.slice(0, boundary) : clipped).trim()}...`;
}

export function formatClock(totalSeconds: number) {
  const seconds = Math.round(totalSeconds);
  if (!Number.isFinite(seconds) || seconds <= 0) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remain = seconds % 60;
  const padded = String(remain).padStart(2, "0");
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${padded}`;
  return `${minutes}:${padded}`;
}

export function formatMediaDate(value: string) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function publicationName(url: string) {
  if (!url) return "";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (PUBLICATIONS[host]) return PUBLICATIONS[host];
    const name = host.split(".")[0] ?? "";
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : "";
  } catch {
    return "";
  }
}

export function blogSlug(title: string, id: number) {
  const base = decodeEntities(title)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "post"}-${id}`;
}

export function blogPath(post: { id: number; title: string }) {
  return `/media/blog/${blogSlug(post.title, post.id)}`;
}

export function idFromSlug(slug: string) {
  const id = slug.split("-").pop() ?? "";
  return /^\d+$/.test(id) ? id : null;
}

export function sanitizeArticleHtml(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/href=(["'])\/signup/gi, "href=$1/contact");
}
