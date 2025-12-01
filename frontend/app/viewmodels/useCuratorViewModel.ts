import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function useCuratorViewModel() {
    const [isCuratorMode, setIsCuratorMode] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'draft' | 'published' | 'archived' | 'all'>('draft');
    const router = useRouter();

    const toggleCuratorMode = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        setIsCuratorMode(!isCuratorMode);
        if (!isCuratorMode) {
            setFilterStatus('draft');
        }
    };

    return {
        isCuratorMode,
        filterStatus,
        setFilterStatus,
        toggleCuratorMode,
    };
}
