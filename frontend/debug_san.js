const { createClient } = require('@sanity/client');
const dotenv = require('dotenv');
const path = require('path');

// Load env from .env.local (relative to frontend dir)
dotenv.config({ path: '.env.local' });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

console.log('Config:', { projectId, dataset, hasToken: !!token });

const client = createClient({
    projectId,
    dataset,
    useCdn: false, // Ensure fresh data
    apiVersion: '2024-01-01',
    // No token, simulating public access
});

const tokenClient = createClient({
    projectId,
    dataset,
    useCdn: false,
    apiVersion: '2024-01-01',
    token
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

        if (publicData && publicData.layout) {
            const missingArticles = publicData.layout.some((b) =>
                (b._type === 'heroBlock' && !b.article) ||
                (b.items && b.items.some((i) => !i))
            );
            if (missingArticles) {
                console.log("❌ WARNING: Some referenced articles are NULL in public fetch (likely drafts).");
            } else {
                console.log("✅ All referenced articles resolved in public fetch.");
            }
        } else {
            console.log("❌ WARNING: No active homepage found in public fetch.");
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
                article->{title, _id},
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
