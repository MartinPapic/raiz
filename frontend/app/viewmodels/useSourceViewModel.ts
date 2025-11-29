import { useState, useEffect } from 'react';
import { sourceRepository, Source } from '../data/sourceRepository';

export function useSourceViewModel() {
    const [sources, setSources] = useState<Source[]>([]);
    const [loading, setLoading] = useState(false);
    const [successfulSources, setSuccessfulSources] = useState<Source[]>([]);
    const [connectionHistory, setConnectionHistory] = useState<any[]>([]);

    useEffect(() => {
        fetchSources();
        fetchSuccessfulSources();
        fetchConnectionHistory();
    }, []);

    const fetchSources = async () => {
        try {
            const data = await sourceRepository.getAll();
            setSources(data);
        } catch (error) {
            console.error('Error fetching sources:', error);
        }
    };

    const fetchSuccessfulSources = async () => {
        try {
            const data = await sourceRepository.getSuccessful();
            setSuccessfulSources(data);
        } catch (error) {
            console.error('Error fetching successful sources:', error);
        }
    };

    const fetchConnectionHistory = async () => {
        try {
            const data = await sourceRepository.getHistory();
            setConnectionHistory(data);
        } catch (error) {
            console.error('Error fetching connection history:', error);
        }
    };

    const addSource = async (source: Omit<Source, 'id'>) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token');
            await sourceRepository.create(source, token);
            fetchSources();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteSource = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No token');
            await sourceRepository.delete(id, token);
            fetchSources();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    return {
        sources,
        successfulSources,
        connectionHistory,
        loading,
        addSource,
        deleteSource,
    };
}
