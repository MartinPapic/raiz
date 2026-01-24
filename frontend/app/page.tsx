import { defineQuery } from "next-sanity";
import { client } from '../sanity/lib/client';
import { FEATURED_HERO_QUERY, CATEGORY_FEEDS_QUERY } from './queries';
import Link from 'next/link';

// Reusing Block Components for UI consistency, but feeding them direct data
import HeroBlock from './ui/blocks/HeroBlock';
import GridBlock from './ui/blocks/GridBlock'; // Check if GridBlock accepts 'items' prop directly or needs adaptation
import ArticleCard from './components/ArticleCard';

// ISR Revalidation
export const revalidate = 60;

export default async function Page() {
  let heroArticle = null;
  let categoryFeeds = null;

  try {
    // 1. Fetch Featured Hero
    heroArticle = await client.fetch(FEATURED_HERO_QUERY);

    // 2. Fetch Category Feeds
    categoryFeeds = await client.fetch(CATEGORY_FEEDS_QUERY);
  } catch (e: any) {
    console.error("Sanity Homepage Fetch Error:", e);
  }

  // Helper to adapt raw article to block format if needed, or pass directly.
  // HeroBlock expects { article: ... }
  // GridBlock expects { items: ..., title: ... }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">

      {/* 1. Hero Section */}
      {heroArticle ? (
        <HeroBlock
          article={heroArticle}
          layoutVariant="fullscreen"
          customHeadline={heroArticle.title} // Optional override
        />
      ) : (
        <div className="py-12 text-center text-gray-500">No hay artículo destacado definido.</div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* 2. Latest News (General) */}
        {categoryFeeds?.latest && categoryFeeds.latest.length > 0 && (
          <Section title="Últimas Noticias">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categoryFeeds.latest.map((article: any) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          </Section>
        )}

        {/* 3. Politics */}
        {categoryFeeds?.politics && categoryFeeds.politics.length > 0 && (
          <Section title="Política" link="/seccion/politica">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {categoryFeeds.politics.map((article: any) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          </Section>
        )}

        {/* 4. Economy */}
        {categoryFeeds?.economy && categoryFeeds.economy.length > 0 && (
          <Section title="Economía" link="/seccion/economia">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {categoryFeeds.economy.map((article: any) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          </Section>
        )}

        {/* 5. Society */}
        {categoryFeeds?.society && categoryFeeds.society.length > 0 && (
          <Section title="Sociedad" link="/seccion/sociedad">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {categoryFeeds.society.map((article: any) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          </Section>
        )}

      </div>
    </main>
  );
}

// Simple Section Helper
const Section = ({ title, link, children }: { title: string, link?: string, children: React.ReactNode }) => (
  <section>
    <div className="flex justify-between items-end mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
      <h2 className="text-2xl font-bold font-serif text-gray-900 dark:text-white uppercase tracking-wider">
        {title}
      </h2>
      {link && (
        <Link href={link} className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          Ver más →
        </Link>
      )}
    </div>
    {children}
  </section>
);
