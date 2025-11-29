import { api } from './api';

export interface Source {
    id: number;
    name: string;
    url: string;
    feed_url: string;
}

export const sourceRepository = {
    getAll: async (): Promise<Source[]> => {
        return api.get('/sources');
    },
    create: async (source: Omit<Source, 'id'>, token: string): Promise<Source> => {
        return api.post('/sources', source, token);
    },
    delete: async (id: number, token: string) => {
        return api.delete(`/sources/${id}`, token);
    },
    getSuccessful: async (): Promise<Source[]> => {
        return api.get('/sources/successful');
    },
    getHistory: async (): Promise<any[]> => {
        return api.get('/history/successful');
    },
};
