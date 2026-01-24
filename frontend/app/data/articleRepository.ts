import { Article } from '../model';

export const articleRepository = {
    getAll: async (status: string = 'published', token?: string): Promise<Article[]> => {
        // Fetch from internal Sanity proxy
        const res = await fetch(`/api/sanity/articles?status=${status}`);
        if (!res.ok) throw new Error('Failed to fetch articles');
        return res.json();
    },
    getById: async (id: number | string, token?: string): Promise<Article> => {
        const res = await fetch(`/api/sanity/articles/${id}`);
        if (!res.ok) throw new Error('Failed to fetch article');
        return res.json();
    },
    // Search is handled locally or via Sanity? 
    // For now we might need to implement search query in GET /api/sanity/articles?query=...
    search: async (query: string): Promise<Article[]> => {
        // Not implemented in API yet, returning empty or filtering locally
        // We'll temporarily fetch all and filter client side if needed, or implement search param later.
        const res = await fetch(`/api/sanity/articles`);
        if (!res.ok) return [];
        const all = await res.json();
        return all.filter((a: Article) => a.title.toLowerCase().includes(query.toLowerCase()));
    },

    // Ingestion/Scraping (Legacy Python - effectively disabled for Sanity IDs)
    ingest: async (feedUrl: string, sourceName: string, token: string) => {
        console.warn('Ingestion not supported in Sanity mode yet');
        return null;
    },

    create: async (title: string, content: string, source: string, token: string): Promise<Article> => {
        const res = await fetch('/api/sanity/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, source })
        });
        if (!res.ok) throw new Error('Failed to create article');
        const data = await res.json();
        // Return a mock article since API might only return ID
        return {
            id: data.id,
            title, content, source,
            status: 'draft',
            url: '',
            summary: '',
            tags: '',
            created_at: new Date().toISOString(),
            published_at: undefined
        };
    },

    update: async (article: Article, token: string): Promise<Article> => {
        const res = await fetch(`/api/sanity/articles/${article.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: article.title,
                content: article.content, // Text content to be wrapped in blocks
                summary: article.summary,
                url: article.url,
                tags: Array.isArray(article.tags) ? article.tags.join(',') : article.tags
            })
        });
        if (!res.ok) throw new Error('Failed to update article');
        return article;
    },

    delete: async (id: number | string, token: string) => {
        const res = await fetch(`/api/sanity/articles/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) throw new Error('Failed to delete article');
    },

    // AI/Legacy methods - kept as stubs or to be reimplemented via Vercel AI SDK
    regenerate: async (id: number | string, token: string, instruction?: string): Promise<Article> => {
        console.warn("Regenerate not implemented for Sanity");
        return articleRepository.getById(id, token);
    },
    scrape: async (id: number | string, token: string): Promise<Article> => {
        console.warn("Scrape not implemented for Sanity");
        return articleRepository.getById(id, token);
    },
    pushToSanity: async (article: Article, token: string): Promise<{ success: boolean; sanityId: string }> => {
        // No-op, we are already in Sanity
        return { success: true, sanityId: String(article.id) };
    },
    refine: async (id: number | string, content: string, instruction: string, token: string): Promise<string> => {
        console.warn("Refine not implemented");
        return content;
    },
    audit: async (id: number | string, token: string): Promise<string> => {
        return "Audit module pending migration.";
    },
    addToKnowledgeBase: async (content: string, tags: string, sourceArticleId: number, token: string): Promise<void> => {
        // deprecated
    },
    getSuggestions: async (tags: string, query: string, token: string): Promise<any[]> => {
        return [];
    },
    importFromSanity: async (): Promise<any[]> => {
        return articleRepository.getAll('all');
    }
};
