import { useState, useEffect } from 'react';
import { Article } from '../model';
import { articleRepository } from '../data/articleRepository';

export function useArticlesViewModel(isCuratorMode: boolean, filterStatus: string) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<Article[]>([]);

    useEffect(() => {
        fetchArticles();
    }, [isCuratorMode, filterStatus]);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const status = isCuratorMode ? filterStatus : 'published';
            const token = localStorage.getItem('token') || '';
            const data = await articleRepository.getAll(status, token);
            setArticles(data);
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setIsSearching(false);
            return;
        }
        setLoading(true);
        setIsSearching(true);
        try {
            const results = await articleRepository.search(query);
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshArticles = () => {
        fetchArticles();
    };

    return {
        articles,
        loading,
        isSearching,
        searchResults,
        handleSearch,
        refreshArticles,
        setArticles, // Exposed for optimistic updates
    };
}
