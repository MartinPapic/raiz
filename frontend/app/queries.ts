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

export const HOMEPAGE_QUERY = defineQuery(`
  *[_type == "homepage" && isActive == true][0]{
    _id,
    title,
    layout[]{
      _key,
      _type,
      ...,
      // Expand references for Hero Block
      article->{
        title,
        "summary": lead,
        "slug": slug.current,
        "main_image": mainImage.asset->url,
        "source": "Raíz",
        publishedAt,
        author->
      },
      // Expand references for Grid/List/Opinion Blocks
      items[]->{
        title,
        "summary": lead,
        "slug": slug.current,
        "main_image": mainImage.asset->url,
        "source": "Raíz",
        publishedAt,
        author->{
          name,
          image { asset-> }
        }
      },
      // Pass through other fields
      layoutVariant,
      columns,
      content, 
      link,
      type
    }
  }
`);
