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
        const { layout, title, isActive, id } = body;

        // Use a deterministic ID if not provided, or update existing
        const docId = id || 'homepage-default';

        const doc = {
            _type: 'homepage',
            _id: docId,
            title: title || 'Default Edition',
            isActive: isActive !== undefined ? isActive : false,
            layout: layout || []
        };

        // Create or Replace (update) the document
        const result = await client.createOrReplace(doc);

        return NextResponse.json({ success: true, docId: result._id });
    } catch (error: any) {
        console.error('Sanity Save Layout Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
