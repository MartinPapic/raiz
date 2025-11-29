import { api } from './api';
import { Article } from '../model';

export const articleRepository = {
    getAll: async (status: string = 'published', token?: string): Promise<Article[]> => {
        return api.get(`/articles?status=${status}`, token);
    },
    getById: async (id: number): Promise<Article> => {
        return api.get(`/articles/${id}`);
    },
    search: async (query: string): Promise<Article[]> => {
        return api.get(`/search?query=${encodeURIComponent(query)}`);
    },
    ingest: async (feedUrl: string, sourceName: string, token: string) => {
        return api.post('/ingest', { feed_url: feedUrl, source_name: sourceName }, token);
    },
    update: async (article: Article, token: string): Promise<Article> => {
        return api.put(`/articles/${article.id}`, article, token);
    },
    delete: async (id: number, token: string) => {
        return api.delete(`/articles/${id}`, token);
    },
    regenerate: async (id: number, token: string): Promise<Article> => {
        return api.post(`/articles/${id}/regenerate`, {}, token);
    },
    scrape: async (id: number, token: string): Promise<Article> => {
        return api.post(`/articles/${id}/scrape`, {}, token);
    },
    refine: async (id: number, content: string, instruction: string, token: string): Promise<string> => {
        const response = await api.post<{ refined_content: string }>(`/articles/${id}/refine`, { content, instruction }, token);
        return response.refined_content;
    },
    audit: async (id: number, token: string): Promise<string> => {
        const response = await api.post<{ audit_report: string }>(`/articles/${id}/audit`, {}, token);
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
    }
};
