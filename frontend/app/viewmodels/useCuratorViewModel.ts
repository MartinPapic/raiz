import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useArticlesViewModel } from './useArticlesViewModel';
import { useSourceViewModel } from './useSourceViewModel';
import { useAuthViewModel } from './useAuthViewModel';
import { articleRepository } from '../data/articleRepository';
import { Article } from '../model';

export function useCuratorViewModel() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuthViewModel();

    // Auth Protection
    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                router.push('/');
            }
        }
    }, [user, authLoading, router]);

    // Core State
    const [filterStatus, setFilterStatus] = useState<'draft' | 'published' | 'archived' | 'all'>('draft');
    const effectiveCuratorMode = true;

    // Composition of other ViewModels
    const {
        articles,
        loading: articlesLoading,
        isSearching,
        searchResults,
        handleSearch,
        refreshArticles,
    } = useArticlesViewModel(effectiveCuratorMode, filterStatus);

    const { successfulSources, connectionHistory } = useSourceViewModel();

    // UI State
    const [showSourceManager, setShowSourceManager] = useState(false);
    const [ingestionPrefill, setIngestionPrefill] = useState<{ url: string; source: string } | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'columns'>('list');

    // Filter State
    const [filterText, setFilterText] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Selection State
    const [selectedArticleIds, setSelectedArticleIds] = useState<Set<number>>(new Set());

    // Modal State
    const [showNewArticleModal, setShowNewArticleModal] = useState(false);
    const [newArticleMode, setNewArticleMode] = useState<'url' | 'manual'>('url');
    const [newArticleUrl, setNewArticleUrl] = useState('');
    const [newArticleTitle, setNewArticleTitle] = useState('');
    const [newArticleContent, setNewArticleContent] = useState('');
    const [newArticleSource, setNewArticleSource] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Derived State (Filtering)
    const displayedArticles = useMemo(() => {
        const sourceList = isSearching ? searchResults : articles;

        return sourceList.filter(article => {
            // 1. Text Filter
            if (filterText) {
                const lowerFilter = filterText.toLowerCase();
                const matchesTitle = article.title?.toLowerCase().includes(lowerFilter);
                const matchesSummary = article.summary?.toLowerCase().includes(lowerFilter);
                if (!matchesTitle && !matchesSummary) return false;
            }

            // 2. Date Range Filter
            if (startDate) {
                const articleDate = new Date(article.published_at || article.created_at);
                const start = new Date(startDate);
                if (articleDate < start) return false;
            }
            if (endDate) {
                const articleDate = new Date(article.published_at || article.created_at);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                if (articleDate > end) return false;
            }

            return true;
        });
    }, [articles, searchResults, isSearching, filterText, startDate, endDate]);

    // Actions
    const handleDeleteArticle = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este artículo?')) return;
        try {
            const token = localStorage.getItem('token') || '';
            await articleRepository.delete(id, token);
            refreshArticles();
        } catch (error) {
            alert('Error deleting article');
        }
    };

    const handleArchiveArticle = async (article: Article) => {
        try {
            const token = localStorage.getItem('token') || '';
            await articleRepository.update({ ...article, status: 'archived' }, token);
            refreshArticles();
        } catch (error) {
            alert('Error archiving article');
        }
    };

    const handleScrapeArticle = async (article: Article) => {
        if (!confirm('Esto reemplazará el contenido actual con el texto original. ¿Continuar?')) return;
        try {
            const token = localStorage.getItem('token') || '';
            await articleRepository.scrape(article.id, token);
            refreshArticles();
        } catch (error: any) {
            console.error("Scrape error:", error);
            alert(`Error recuperando texto original: ${error.message || 'Unknown error'}`);
        }
    };

    const handleToggleSelect = (id: number) => {
        const newSelected = new Set(selectedArticleIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedArticleIds(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedArticleIds.size === displayedArticles.length) {
            setSelectedArticleIds(new Set());
        } else {
            setSelectedArticleIds(new Set(displayedArticles.map(a => a.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`¿Estás seguro de eliminar ${selectedArticleIds.size} artículos?`)) return;

        const token = localStorage.getItem('token') || '';
        let successCount = 0;

        for (const id of selectedArticleIds) {
            try {
                await articleRepository.delete(id, token);
                successCount++;
            } catch (error) {
                console.error(`Error deleting article ${id}:`, error);
            }
        }

        if (successCount > 0) {
            setSelectedArticleIds(new Set());
            refreshArticles();
            alert(`Se eliminaron ${successCount} artículos.`);
        }
    };

    const handleBulkArchive = async () => {
        const token = localStorage.getItem('token') || '';
        let successCount = 0;

        for (const id of selectedArticleIds) {
            try {
                const article = articles.find(a => a.id === id);
                if (article) {
                    await articleRepository.update({ ...article, status: 'archived' }, token);
                    successCount++;
                }
            } catch (error) {
                console.error(`Error archiving article ${id}:`, error);
            }
        }

        if (successCount > 0) {
            setSelectedArticleIds(new Set());
            refreshArticles();
            alert(`Se archivaron ${successCount} artículos.`);
        }
    };

    const handleCreateArticle = async () => {
        if (!newArticleTitle || !newArticleContent) {
            alert('Título y contenido son obligatorios');
            return;
        }
        setIsCreating(true);
        try {
            const token = localStorage.getItem('token') || '';
            await articleRepository.create(newArticleTitle, newArticleContent, newArticleSource || 'Manual', token);
            refreshArticles();
            setShowNewArticleModal(false);
            setNewArticleTitle('');
            setNewArticleContent('');
            setNewArticleSource('');
            alert('Artículo creado exitosamente');
        } catch (error) {
            console.error('Error creating article:', error);
            alert('Error al crear el artículo');
        } finally {
            setIsCreating(false);
        }
    };

    const handleIngestArticle = async () => {
        if (!newArticleUrl) {
            alert('URL es obligatoria');
            return;
        }
        setIsCreating(true);
        try {
            const token = localStorage.getItem('token') || '';
            const article = await articleRepository.create('Borrador desde URL', '', 'Web', token);
            const articleWithUrl = { ...article, url: newArticleUrl };
            await articleRepository.update(articleWithUrl, token);
            await articleRepository.scrape(article.id, token);

            refreshArticles();
            setShowNewArticleModal(false);
            setNewArticleUrl('');
            alert('Artículo importado exitosamente');
        } catch (error) {
            console.error('Error ingesting article:', error);
            alert('Error al importar el artículo');
        } finally {
            setIsCreating(false);
        }
    };

    return {
        // Auth & Loading
        user,
        authLoading,
        articlesLoading,

        // Data
        displayedArticles,
        successfulSources,
        connectionHistory,

        // UI State
        filterStatus,
        setFilterStatus,
        viewMode,
        setViewMode,
        showSourceManager,
        setShowSourceManager,
        ingestionPrefill,
        setIngestionPrefill,

        // Filters
        filterText,
        setFilterText,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        isSearching,

        // Selection
        selectedArticleIds,
        handleToggleSelect,
        handleSelectAll,

        // Modals
        showNewArticleModal,
        setShowNewArticleModal,
        newArticleMode,
        setNewArticleMode,
        newArticleUrl,
        setNewArticleUrl,
        newArticleTitle,
        setNewArticleTitle,
        newArticleContent,
        setNewArticleContent,
        newArticleSource,
        setNewArticleSource,
        isCreating,

        // Actions
        handleSearch,
        refreshArticles,
        handleDeleteArticle,
        handleArchiveArticle,
        handleScrapeArticle,
        handleBulkDelete,
        handleBulkArchive,
        handleCreateArticle,
        handleIngestArticle,
        logout: useAuthViewModel().logout // Re-export logout
    };
}
