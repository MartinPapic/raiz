import { api } from './api';
import { Article } from '../model';

export const articleRepository = {
    getAll: async (status: string = 'published', token?: string): Promise<Article[]> => {
        return api.get(`/articles?status=${status}`, token);
    },
    getById: async (id: number, token?: string): Promise<Article> => {
        return api.get(`/articles/${id}`, token);
    },
    search: async (query: string): Promise<Article[]> => {
        return api.get(`/search?query=${encodeURIComponent(query)}`);
    },
    ingest: async (feedUrl: string, sourceName: string, token: string) => {
        return api.post('/ingest', { feed_url: feedUrl, source_name: sourceName }, token);
    },
    create: async (title: string, content: string, source: string, token: string): Promise<Article> => {
        return api.post('/articles', { title, content, source }, token);
    },
    update: async (article: Article, token: string): Promise<Article> => {
        return api.put(`/articles/${article.id}`, article, token);
    },
    delete: async (id: number, token: string) => {
        return api.delete(`/articles/${id}`, token);
    },
    regenerate: async (id: number, token: string, instruction?: string): Promise<Article> => {
        return api.post(`/articles/${id}/regenerate`, { instruction }, token);
    },
    scrape: async (id: number, token: string): Promise<Article> => {
        return api.post(`/articles/${id}/scrape`, {}, token);
    },

    pushToSanity: async (article: Article, token: string): Promise<{ success: boolean; sanityId: string }> => {
        // 1. Post to local API route (which has the SANITY_API_TOKEN)
        const response = await fetch('/api/sanity/create-draft', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: article.title,
                content: article.content, // HTML/Text content
                lead: article.summary,
                source: article.source,
                url: article.url
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to push to Sanity');
        }

        // 2. We do NOT update local status here to avoid circular dep, 
        // the ViewModel should handle the local update or the user manually refreshes.

        return response.json();
    },
    refine: async (id: number, content: string, instruction: string, token: string): Promise<string> => {
        const response = await api.post(`/articles/${id}/refine`, { content, instruction }, token);
        return response.refined_content;
    },
    audit: async (id: number, token: string): Promise<string> => {
        const response = await api.post(`/articles/${id}/audit`, {}, token);
        return response.audit_report;
    },

    async addToKnowledgeBase(content: string, tags: string, sourceArticleId: number, token: string): Promise<void> {
        await api.post('/knowledge-base', { content, tags, source_article_id: sourceArticleId }, token);
    },

    async getSuggestions(tags: string, query: string, token: string): Promise<any[]> {
        const params = new URLSearchParams();
        if (tags) params.append('tags', tags);
        if (query) params.append('query', query);

        return api.get(`/knowledge-base/suggestions?${params.toString()}`, token);
    },

    importFromSanity: async (): Promise<any[]> => {
        const response = await fetch('/api/sanity/import-articles');
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error || 'Failed to import from Sanity');
        }
        return data.articles;
    }
};
