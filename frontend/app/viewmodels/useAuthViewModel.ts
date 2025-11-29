import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authRepository } from '../data/authRepository';

export interface User {
    username: string;
    role: 'admin' | 'user';
}

export function useAuthViewModel() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ username: payload.sub, role: payload.role || 'user' });
            } catch (e) {
                console.error('Invalid token', e);
                logout();
            }
        }
        setLoading(false);
    };

    const login = async (username: string, password: string) => {
        try {
            const data = await authRepository.login(username, password);
            localStorage.setItem('token', data.access_token);
            checkAuth();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/');
    };

    return {
        user,
        loading,
        login,
        logout,
    };
}
