import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: 'frontend/.env.local' });

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: '2024-01-01',
    // No token, simulating public access
});

const tokenClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: '2024-01-01',
    token: process.env.SANITY_API_TOKEN
});

async function checkHomepage() {
    console.log("--- DEBUGGING HOMEPAGE DATA ---");

    // 1. Fetch with Public Client
    try {
        const query = `*[_type == "homepage" && isActive == true][0]{
            title,
            layout[]{
                _type,
                article->{title, _id},
                items[]->{title, _id}
            }
        }`;
        const publicData = await client.fetch(query);
        console.log("Public Data:", JSON.stringify(publicData, null, 2));

        if (publicData?.layout) {
            const missingArticles = publicData.layout.some((b: any) =>
                (b._type === 'heroBlock' && !b.article) ||
                (b.items && b.items.some((i: any) => !i))
            );
            if (missingArticles) {
                console.log("❌ WARNING: Some referenced articles are NULL in public fetch (likely drafts).");
            }
        }
    } catch (e) {
        console.error("Public Fetch Error:", e.message);
    }

    // 2. Fetch with Token Client
    try {
        const query = `*[_type == "homepage" && isActive == true][0]{
            title,
            layout[]{
                _type,
                article->{title, _id, _originalId},
                items[]->{title, _id}
            }
        }`;
        const tokenData = await tokenClient.fetch(query);
        console.log("Token Data (Admin):", JSON.stringify(tokenData, null, 2));
    } catch (e) {
        console.error("Token Fetch Error:", e.message);
    }
}

checkHomepage();
