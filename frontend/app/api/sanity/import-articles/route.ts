import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId, useCdn } from '../../../../sanity/env';

// Client with token to read potential drafts/private data if needed, 
// though generally we want what's "in Sanity" (published usually).
const client = createClient({
    apiVersion,
    dataset,
    projectId,
    useCdn: false, // Always fresh
    token: process.env.SANITY_API_TOKEN,
});

export async function GET() {
    try {
        // Fetch all articles from Sanity
        const query = `*[_type == "article"]{
            _id,
            title,
            "lead": lead,
            "slug": slug.current,
            "author": author->name,
            "mainImage": mainImage.asset->url,
            publishedAt,
            body
        }`;

        const sanityArticles = await client.fetch(query);
        return NextResponse.json({ success: true, articles: sanityArticles });
    } catch (error: any) {
        console.error('Sanity Import Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
