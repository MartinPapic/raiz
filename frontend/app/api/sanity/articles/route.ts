import { NextResponse } from 'next/server';
import { writeClient } from '../../../lib/sanity.write';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // 'draft', 'published', 'archived', 'all'

        // Construct Query
        // We want all articles. "Lector" handles filtering CLIENT-SIDE usually, 
        // but fetching everything is safer for sync.
        // We fetch everything.
        const query = `*[_type == "article"] | order(_updatedAt desc) {
            _id,
            title,
            "summary": lead,
            "url": slug.current,
            "source": coalesce(source, "Lector"),
            "content": body,
            "tags": array::join(tags, ","),
            publishedAt,
            _createdAt
        }`;

        const sanityDocs = await writeClient.fetch(query);

        // Map to Article Interface
        const articles = sanityDocs.map((doc: any) => {
            // Convert Portable Text body (Block array) to string (simple approximation)
            // For now, we just pass it as is or try to extract text?
            // The Editor expects string. 
            // We will do a naive text extraction for the List View summary if needed,
            // but for Editor we might need the raw blocks or convert string<->blocks.
            // Let's assume content is just text for now to keep it simple as per User request "simplify".
            // We'll extract text from blocks.
            let contentText = '';
            if (Array.isArray(doc.content)) {
                contentText = doc.content.map((block: any) =>
                    block.children?.map((child: any) => child.text).join('')
                ).join('\n\n');
            }

            return {
                id: doc._id, // Use Sanity ID (string)
                title: doc.title,
                content: contentText, // Flattened text
                summary: doc.summary,
                url: doc.url,
                source: doc.source,
                tags: doc.tags,
                status: doc._id.startsWith('drafts.') ? 'draft' : 'published', // Simple status inference
                created_at: doc._createdAt,
                published_at: doc.publishedAt
            };
        });

        return NextResponse.json(articles);
    } catch (error: any) {
        console.error('Sanity GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, content, source } = body;

        // Create Sanity Document
        const doc = {
            _type: 'article',
            title,
            source,
            body: [
                {
                    _type: 'block',
                    children: [{ _type: 'span', text: content || '' }]
                }
            ]
        };

        const result = await writeClient.create(doc);

        return NextResponse.json({
            success: true,
            id: result._id,
            message: 'Article created in Sanity'
        });
    } catch (error: any) {
        console.error('Sanity POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
