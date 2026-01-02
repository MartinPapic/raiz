const { createClient } = require('next-sanity');

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2024-01-01',
    useCdn: false,
});

const query = `*[_type == "article"][0]`;

async function testFetch() {
    console.log("Testing Sanity Fetch...");
    console.log("Project ID:", process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
    console.log("Dataset:", process.env.NEXT_PUBLIC_SANITY_DATASET);

    try {
        const result = await client.fetch(query);
        console.log("Success! Data:", result ? "Found Article" : "No Article (but connection ok)");
    } catch (error) {
        console.error("Fetch Error:", error.message);
    }
}

testFetch();
