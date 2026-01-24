import { defineQuery } from "next-sanity";

export const HERO_QUERY = defineQuery(`
  *[_type == "article"][0]{
    _id,
    title,
    lead,
    "slug": slug.current,
    "author": author->name,
    "mainImage": mainImage.asset->url,
    publishedAt
  }
`);

export const RECENT_QUERY = defineQuery(`
  *[_type == "article"] | order(publishedAt desc)[0...12]{
    _id,
    title,
    lead,
    "slug": slug.current,
    "author": author->name,
    "mainImage": mainImage.asset->url,
    publishedAt
  }
`);

// 1. Featured Hero: The most recent article with featured=true
export const FEATURED_HERO_QUERY = defineQuery(`
  *[_type == "article" && featured == true] | order(publishedAt desc)[0] {
    _id,
    title,
    lead,
    "slug": slug.current,
    "main_image": mainImage.asset->url,
    "source": "Raíz",
    publishedAt,
    author->{name},
    "categories": categories[]->title
  }
`);

// 2. Category Feeds: Recent articles for major categories
// We will fetch everything and group in frontend, or individual queries. 
// For efficiency in GROQ:
export const CATEGORY_FEEDS_QUERY = defineQuery(`
  {
    "politics": *[_type == "article" && count((categories[]->title)[@ == "Politica"]) > 0] | order(publishedAt desc)[0...4] {
       _id, title, lead, "slug": slug.current, "main_image": mainImage.asset->url, publishedAt, author->{name}
    },
    "economy": *[_type == "article" && count((categories[]->title)[@ == "Economia"]) > 0] | order(publishedAt desc)[0...4] {
       _id, title, lead, "slug": slug.current, "main_image": mainImage.asset->url, publishedAt, author->{name}
    },
    "society": *[_type == "article" && count((categories[]->title)[@ == "Sociedad"]) > 0] | order(publishedAt desc)[0...4] {
       _id, title, lead, "slug": slug.current, "main_image": mainImage.asset->url, publishedAt, author->{name}
    },
    "latest": *[_type == "article"] | order(publishedAt desc)[0...10] {{
       _id, title, lead, "slug": slug.current, "main_image": mainImage.asset->url, publishedAt, author->{name}
    }}
  }
`);

export const HOMEPAGE_QUERY = defineQuery(`
  *[_type == "homepage" && isActive == true][0]{
    // ... Deprecated manually managed query
  }
`);

export const SECTION_QUERY = defineQuery(`
  *[_type == "article" && (
    count((categories[]->title)[@ == $categoryTitle]) > 0 ||
    section == $sectionValue
  )] | order(publishedAt desc) {
     _id, title, lead, "url": slug.current, "main_image": mainImage.asset->url, publishedAt, author->{name}
  }
`);
