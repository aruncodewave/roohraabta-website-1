import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticle from "@/components/media/BlogArticle";
import { decodeEntities, idFromSlug, stripHtml } from "@/lib/media/format";
import { fetchMediaArticle } from "@/lib/media/wordpress";

export const revalidate = 120;

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const id = idFromSlug(slug);
  if (!id) return { title: "Blog | Vows for Eternity" };

  try {
    const article = await fetchMediaArticle(id);
    if (!article) return { title: "Blog | Vows for Eternity" };
    const title = decodeEntities(article.post.title);
    const description = stripHtml(article.post.description).slice(0, 160);
    return {
      title: `${title} | Vows for Eternity`,
      description,
    };
  } catch {
    return { title: "Blog | Vows for Eternity" };
  }
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const id = idFromSlug(slug);
  if (!id) notFound();

  const article = await fetchMediaArticle(id);
  if (!article) notFound();

  return <BlogArticle article={article} />;
}
