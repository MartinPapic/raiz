import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId, useCdn } from '../../../../sanity/env';

// Server-side client with Write Token
const client = createClient({
    apiVersion,
    dataset,
    projectId,
    useCdn,
    token: process.env.SANITY_API_TOKEN, // Protected token
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, content, lead, source, url } = body;

        // Check if article with this slug exists
        const existingQuery = `*[_type == "article" && slug.current == "${url}"][0]`;
        const existingDoc = await client.fetch(existingQuery);

        // Sanity Document Object
        const doc = {
            _type: 'article',
            title: title,
            lead: lead || '',
            slug: { _type: 'slug', current: url }, // Map URL to Slug
            publishedAt: new Date().toISOString(),
            // Transform plain text content to Portable Text (basic paragraph)
            body: [
                {
                    _type: 'block',
                    _key: Math.random().toString(36).substring(7),
                    style: 'normal',
                    children: [
                        {
                            _type: 'span',
                            _key: Math.random().toString(36).substring(7),
                            text: content || '',
                            marks: [],
                        }
                    ],
                    markDefs: []
                }
            ],
            featured: body.featured || false
        };

        let result;
        if (existingDoc) {
            // Patch existing (If it's published, this updates live. If it's draft, it updates draft)
            // Ideally we should check if a draft exists for this published doc, but simple upsert first.
            result = await client.patch(existingDoc._id).set(doc).commit();
            console.log(`Updated existing Sanity article: ${existingDoc._id}`);
        } else {
            // Create NEW as DRAFT
            // We manually generate an ID to ensure it's a draft
            const newId = 'drafts.' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const draftDoc = { ...doc, _id: newId };

            result = await client.createIfNotExists(draftDoc);
            console.log(`Created new Sanity DRAFT: ${result._id}`);
        }

        return NextResponse.json({ success: true, sanityId: result._id });
    } catch (error: any) {
        console.error('Sanity Create Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
