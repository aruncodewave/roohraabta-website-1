import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Podcasts | Vows for Eternity",
  description: "Conversations that explore love, relationships, and the stories that connect us.",
};

export default function PodcastsPage() {
  return (
    <section className="relative overflow-hidden bg-cream pb-28 pt-8 lg:pb-40">
      <header className="mx-auto mt-8 max-w-4xl px-5 text-center sm:mt-10 sm:px-8">
        <h1 className="type-h1 text-[#762323]">Podcasts</h1>
        <p className="type-body-lg mt-4 text-[#8B7E2A]">
          Conversations that explore love, relationships, and the stories that connect us.
        </p>
      </header>

      <div className="mt-12 grid grid-cols-1 gap-3 bg-white sm:mt-14 sm:grid-cols-2 sm:gap-4">
        <Link
          href="/media/podcasts/heart-to-heart"
          aria-label="Heart to Heart with Anuradda Gupta"
          className="cursor-pointer overflow-hidden focus-visible:outline focus-visible:outline-[#A4911B]"
        >
          <img src="/images/podcastImage2.png" alt="Heart to Heart with Anuradda Gupta" className="aspect-square w-full object-cover" />
        </Link>
        <img src="/images/podcastImage1.webp" alt="Soft as Steel with Anuradda Gupta" className="aspect-square w-full object-contain" />
      </div>
    </section>
  );
}
