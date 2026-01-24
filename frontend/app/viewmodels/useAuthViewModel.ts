import { useUser } from '@auth0/nextjs-auth0/client';


export interface User {
    username: string;
    role: 'admin' | 'user';
    picture?: string;
}

export function useAuthViewModel() {
    const { user: auth0User, error, isLoading } = useUser();

    // Map Auth0 user to our User interface
    // Note: Role management needs to be handled via Auth0 Actions/Rules to add claims,
    // or by fetching from backend. For MVP, we'll default to 'user' or check specific email.
    const user: User | null = auth0User ? {
        username: auth0User.name || auth0User.email || 'User',
        role: (
            auth0User['https://raiz-api/roles']?.includes('admin') ||
            auth0User['https://raiz.com/roles']?.includes('admin') ||
            auth0User.email === 'martin.papic@gmail.com' ||
            auth0User.email === 'ma.papic@duocuc.cl' ||
            auth0User.name === 'admin'
        ) ? 'admin' : 'user',
        picture: auth0User.picture || undefined
    } : null;

    const login = async () => {
        window.location.href = '/auth/login';
        return true;
    };

    const register = async () => {
        window.location.href = '/auth/login?screen_hint=signup';
        return { success: true };
    };

    const logout = () => {
        window.location.href = '/auth/logout';
    };

    return {
        user,
        loading: isLoading,
        login,
        register,
        logout,
    };
}
