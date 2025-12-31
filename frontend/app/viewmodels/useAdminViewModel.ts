import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminRepository, User } from '../data/adminRepository';
import { useAuthViewModel } from './useAuthViewModel';

export function useAdminViewModel() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    const { user: currentUser, loading: authLoading } = useAuthViewModel();

    useEffect(() => {
        if (!authLoading) {
            if (!currentUser || currentUser.role !== 'admin') {
                router.push('/');
                return;
            }
            fetchUsers();
        }
    }, [currentUser, authLoading, router]);

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const data = await adminRepository.getAllUsers(token);
            setUsers(data);
        } catch (err) {
            setError('Failed to fetch users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await adminRepository.deleteUser(userId, token);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err: any) {
            alert(err.message || 'Error deleting user');
        }
    };

    const handleToggleRole = async (user: User) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        if (!confirm(`Change role of ${user.username} to ${newRole}?`)) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            await adminRepository.updateUserRole(user.id, newRole, token);
            setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
        } catch (err: any) {
            alert(err.message || 'Error updating role');
        }
    };

    return {
        users,
        loading,
        error,
        handleDeleteUser,
        handleToggleRole
    };
}
