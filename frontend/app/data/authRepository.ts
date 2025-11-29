import { api } from './api';

export const authRepository = {
    login: async (username: string, password: string): Promise<{ access_token: string }> => {
        // Login endpoint expects form-data, so we need a custom call here or adjust api helper
        // For simplicity, let's use fetch directly for this specific content-type
        const body = new URLSearchParams();
        body.append('username', username);
        body.append('password', password);

        const res = await fetch('http://localhost:8000/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body,
        });

        if (!res.ok) throw new Error('Login failed');
        return res.json();
    },
};
