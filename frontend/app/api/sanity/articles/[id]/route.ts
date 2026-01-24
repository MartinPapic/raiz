import { NextResponse } from 'next/server';
import { writeClient } from '../../../../lib/sanity.write';
import { toHTML } from '@portabletext/to-html';
import { htmlToBlocks } from '@sanity/block-tools';
import { Schema } from '@sanity/schema';
import { JSDOM } from 'jsdom';

// Define minimal schema for block-tools
const defaultSchema = Schema.compile({
    name: 'default',
    types: [
        {
            type: 'object',
            name: 'blogPost',
            fields: [
                {
                    title: 'Body',
                    name: 'body',
                    type: 'array',
                    of: [{ type: 'block' }]
                }
            ]
        }
    ]
});

const blockContentType = defaultSchema.get('blogPost').fields.find((field: any) => field.name === 'body').type;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const query = `*[_type == "article" && _id == $id][0]{
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

        const doc = await writeClient.fetch(query, { id });

        if (!doc) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        let contentHtml = '';
        if (doc.content) {
            // Convert Portable Text to HTML
            contentHtml = toHTML(doc.content);
        }

        const article = {
            id: doc._id,
            title: doc.title,
            content: contentHtml, // Return HTML for the editor
            summary: doc.summary,
            url: doc.url,
            source: doc.source,
            tags: doc.tags,
            status: doc._id.startsWith('drafts.') ? 'draft' : 'published',
            created_at: doc._createdAt,
            published_at: doc.publishedAt
        };

        return NextResponse.json(article);
    } catch (error: any) {
        console.error("API GET Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Map updates
        const updates: any = {};
        if (body.title) updates.title = body.title;
        if (body.summary) updates.lead = body.summary;
        if (body.url) updates.slug = { _type: 'slug', current: body.url };

        if (body.content) {
            // Convert HTML back to Portable Text
            const blocks = htmlToBlocks(body.content, blockContentType, {
                parseHtml: (html) => new JSDOM(html).window.document,
            });
            updates.body = blocks;
        }

        if (body.tags) {
            // assuming tags is comma separated string
            updates.tags = body.tags.split(',').map((t: string) => t.trim());
        }

        await writeClient.patch(id).set(updates).commit();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API PUT Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await writeClient.delete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
