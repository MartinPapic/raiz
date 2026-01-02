import { defineQuery } from "next-sanity";
import { client } from '../sanity/lib/client';
import HomeView from './views/HomeView';
import { HOMEPAGE_QUERY, HERO_QUERY, RECENT_QUERY } from './queries';
import HeroBlock from './ui/blocks/HeroBlock';
import GridBlock from './ui/blocks/GridBlock';
import ListBlock from './ui/blocks/ListBlock';

// ISR Revalidation
export const revalidate = 60;


export default async function Page() {
  let homepage = null;
  let initialFeatured = null;
  let initialArticles: any[] = [];
  let error = null;

  try {
    // 1. Try to fetch Active Homepage Layout
    homepage = await client.fetch(HOMEPAGE_QUERY);
  } catch (e: any) {
    console.error("Sanity Homepage Fetch Error:", e);
    error = e.message;
  }

  return (
    <div>
      <HomeView
        initialFeatured={initialFeatured ? [initialFeatured] : []}
        initialArticles={initialArticles || []}
        layout={homepage?.layout || null}
      />
    </div>
  );
}

function resolveBlockComponent(type: string) {
  switch (type) {
    case 'heroBlock': return HeroBlock;
    case 'gridBlock': return GridBlock;
    case 'listBlock': return ListBlock;
    default: return () => null; // Graceful fallback
  }
}
