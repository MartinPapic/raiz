import { useState, useEffect } from 'react';
import { schedulerRepository, SchedulerStatus } from '../data/schedulerRepository';
import { useAuthViewModel } from './useAuthViewModel';

export function useSchedulerViewModel() {
    const [status, setStatus] = useState<SchedulerStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuthViewModel();

    const fetchStatus = async () => {
        const token = localStorage.getItem('token');
        if (!token || user?.role !== 'admin') return;

        try {
            const data = await schedulerRepository.getStatus(token);
            setStatus(data);
        } catch (err) {
            console.error('Failed to fetch scheduler status', err);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchStatus();
            const interval = setInterval(fetchStatus, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    const startScheduler = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setLoading(true);
        try {
            await schedulerRepository.start(token);
            await fetchStatus();
        } catch (err) {
            setError('Failed to start scheduler');
        } finally {
            setLoading(false);
        }
    };

    const stopScheduler = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setLoading(true);
        try {
            await schedulerRepository.stop(token);
            await fetchStatus();
        } catch (err) {
            setError('Failed to stop scheduler');
        } finally {
            setLoading(false);
        }
    };

    const runNow = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setLoading(true);
        try {
            await schedulerRepository.runNow(token);
            alert('Ingestion triggered in background');
        } catch (err) {
            setError('Failed to trigger ingestion');
        } finally {
            setLoading(false);
        }
    };

    return {
        status,
        loading,
        error,
        startScheduler,
        stopScheduler,
        runNow,
        refreshStatus: fetchStatus
    };
}
