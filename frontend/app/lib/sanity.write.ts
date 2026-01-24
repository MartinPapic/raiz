import { createClient } from 'next-sanity';

export const writeClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2023-05-03',
    useCdn: false, // We need fresh data for writing
    token: process.env.SANITY_API_TOKEN, // Required for write operations
});
