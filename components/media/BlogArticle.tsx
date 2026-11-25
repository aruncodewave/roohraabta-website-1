"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DOMPurify from "dompurify";
import { blogPath, decodeEntities, sanitizeArticleHtml } from "@/lib/media/format";
import type { MediaArticle, MediaNeighbor } from "@/lib/media/types";

const AUTHOR = "Anuradha Gupta";

const articleClass = [
  "article-body text-[#8B7E2A]",
  "[&_a]:text-[#8B7E2A] [&_a]:underline",
  "[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-left [&_h2]:text-[#79211E]",
  "[&_h3]:mt-12 [&_h3]:mb-4 [&_h3]:text-left [&_h3]:text-[#79211E]",
  "[&_p]:mb-5",
  "[&_p:has(>b:only-child)]:mt-12 [&_p:has(>b:only-child)]:mb-4 [&_p:has(>b:only-child)]:text-left",
  "[&_p:has(>b:only-child)>b]:text-[#79211E]",
  "[&_img]:my-8 [&_img]:w-full",
  "[&_li]:mb-2 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6",
].join(" ");

function ArticleBody({ html }: { html: string }) {
  const prepared = sanitizeArticleHtml(html);
  const [clean, setClean] = useState(prepared);

  useEffect(() => {
    setClean(DOMPurify.sanitize(prepared));
  }, [prepared]);

  return <div className={articleClass} dangerouslySetInnerHTML={{ __html: clean }} />;
}

function NeighborButton({
  post,
  direction,
  label,
}: {
  post: MediaNeighbor | null;
  direction: "prev" | "next";
  label: string;
}) {
  const className =
    "flex h-16 w-16 items-center justify-center rounded-full bg-[#A4911B] transition-opacity hover:opacity-80";
  const icon = (
    <img
      src="/icons/arrowrt.svg"
      alt=""
      className={`h-6 w-6 ${direction === "prev" ? "rotate-[225deg]" : "rotate-45"}`}
    />
  );

  if (!post) {
    return (
      <span aria-hidden className={`${className} pointer-events-none opacity-35`}>
        {icon}
      </span>
    );
  }

  return (
    <Link href={blogPath(post)} aria-label={`${label}: ${decodeEntities(post.title)}`} className={className}>
      {icon}
    </Link>
  );
}

export default function BlogArticle({ article }: { article: MediaArticle }) {
  const title = decodeEntities(article.post.title);
  const image = article.post.featuredImage;
  const newer = article.next;
  const older = article.previous;

  return (
    <section className="bg-cream pb-16 pt-8 sm:pt-10 lg:pb-20">
      <header className="mx-auto w-full max-w-[1120px] px-5 text-center sm:px-8 lg:px-12">
        <h1 className="type-h2 text-[#762323]">
          {title}
        </h1>
        <p className="type-h4 mt-3 italic text-[#8B7E2A]">
          By {AUTHOR}
        </p>
      </header>

      {image ? <img src={image} alt="" className="mt-8 w-full sm:mt-10" /> : null}

      <div className="mx-auto mt-10 w-full max-w-[1120px] px-5 sm:mt-12 sm:px-8 lg:px-12">
        <ArticleBody html={article.post.description} />
        <nav className="mt-14 flex items-center gap-4 sm:mt-16" aria-label="More essays">
          <NeighborButton post={newer} direction="prev" label="Previous" />
          <NeighborButton post={older} direction="next" label="Next" />
        </nav>
      </div>
    </section>
  );
}
