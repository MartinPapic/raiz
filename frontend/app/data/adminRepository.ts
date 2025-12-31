import { api } from './api';

export interface User {
    id: number;
    username: string;
    role: string;
}

export const adminRepository = {
    getAllUsers: async (token: string): Promise<User[]> => {
        return api.get('/users', token);
    },

    deleteUser: async (userId: number, token: string): Promise<void> => {
        return api.delete(`/users/${userId}`, token);
    },

    updateUserRole: async (userId: number, role: string, token: string): Promise<void> => {
        return api.put(`/users/${userId}/role`, { role }, token);
    }
};
