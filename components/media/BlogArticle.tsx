"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DOMPurify from "dompurify";
import { blogPath, decodeEntities, sanitizeArticleHtml } from "@/lib/media/format";
import type { MediaArticle, MediaNeighbor } from "@/lib/media/types";

const AUTHOR = "Anuradha Gupta";

const articleClass = [
  "font-serif text-[25px] leading-[1.35] font-normal tracking-[-0.01em] text-[#8B7E2A]",
  "[&_a]:text-[#8B7E2A] [&_a]:underline",
  "[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-left [&_h2]:font-sans [&_h2]:text-[40px] [&_h2]:leading-[1.15] [&_h2]:font-semibold [&_h2]:italic [&_h2]:tracking-[-0.01em] [&_h2]:text-[#79211E]",
  "[&_h3]:mt-12 [&_h3]:mb-4 [&_h3]:text-left [&_h3]:font-sans [&_h3]:text-[40px] [&_h3]:leading-[1.15] [&_h3]:font-semibold [&_h3]:italic [&_h3]:tracking-[-0.01em] [&_h3]:text-[#79211E]",
  "[&_p]:mb-5",
  "[&_p:has(>b:only-child)]:mt-12 [&_p:has(>b:only-child)]:mb-4 [&_p:has(>b:only-child)]:text-left",
  "[&_p:has(>b:only-child)>b]:font-sans [&_p:has(>b:only-child)>b]:text-[40px] [&_p:has(>b:only-child)>b]:leading-[1.15] [&_p:has(>b:only-child)>b]:font-semibold [&_p:has(>b:only-child)>b]:italic [&_p:has(>b:only-child)>b]:tracking-[-0.01em] [&_p:has(>b:only-child)>b]:text-[#79211E]",
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
        <h1 className="font-sans text-[60px] leading-[1.15] font-bold tracking-[-0.01em] text-[#762323]">
          {title}
        </h1>
        <p className="mt-3 font-sans text-[42px] leading-[1.1] font-bold tracking-[-0.02em] text-[#8B7E2A] italic">
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
