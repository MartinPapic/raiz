const API_URL = 'http://localhost:8000';

export const api = {
    get: async (endpoint: string, token?: string) => {
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${API_URL}${endpoint}`, { headers });
        if (!res.ok) throw new Error(`GET ${endpoint} failed`);
        return res.json();
    },
    post: async (endpoint: string, body: any, token?: string) => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        // Handle 204 or empty responses if needed, but usually we expect JSON or just ok
        if (!res.ok) {
            let errorMessage = `POST ${endpoint} failed`;
            try {
                const errorData = await res.json();
                if (errorData.detail) errorMessage = errorData.detail;
            } catch (e) {
                // ignore
            }
            throw new Error(errorMessage);
        }
        return res.json();
    },
    put: async (endpoint: string, body: any, token?: string) => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`PUT ${endpoint} failed`);
        return res.json();
    },
    delete: async (endpoint: string, token?: string) => {
        const headers: any = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });
        if (!res.ok) throw new Error(`DELETE ${endpoint} failed`);
        return res.json();
    },
};
