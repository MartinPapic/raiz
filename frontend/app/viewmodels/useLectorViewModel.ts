import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useArticlesViewModel } from './useArticlesViewModel';
import { useSourceViewModel } from './useSourceViewModel';
import { useAuthViewModel } from './useAuthViewModel';
import { articleRepository } from '../data/articleRepository';
import { Article } from '../model';
import { getAuthToken } from '../utils/clientAuth';

export function useLectorViewModel() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuthViewModel();

    // Auth Protection
    // Auth Protection
    // We removed the silent redirect to show a proper Access Denied screen in the View
    // This helps with debugging why a user is not considered an admin

    // Core State
    const [filterStatus, setFilterStatus] = useState<'draft' | 'published' | 'archived' | 'all'>('all');
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
    const [viewMode, setViewMode] = useState<'list' | 'columns'>('columns');

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
            const token = await getAuthToken();
            await articleRepository.delete(id, token);
            refreshArticles();
        } catch (error) {
            alert('Error deleting article');
        }
    };

    const handleArchiveArticle = async (article: Article) => {
        try {
            const token = await getAuthToken();
            await articleRepository.update({ ...article, status: 'archived' }, token);
            refreshArticles();
        } catch (error) {
            alert('Error archiving article');
        }
    };

    const handleScrapeArticle = async (article: Article) => {
        if (!confirm('Esto reemplazará el contenido actual con el texto original. ¿Continuar?')) return;
        try {
            const token = await getAuthToken();
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
            setSelectedArticleIds(new Set(displayedArticles.map(a => a.id as number)));
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`¿Estás seguro de eliminar ${selectedArticleIds.size} artículos?`)) return;

        const token = await getAuthToken();
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
        const token = await getAuthToken();
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
            const token = await getAuthToken();
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
            const token = await getAuthToken();
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

    const handleSanityPush = async (article: Article) => {
        if (!confirm(`¿Enviar "${article.title}" al CMS(Sanity)?`)) return;
        try {
            const token = await getAuthToken();

            // 1. Push to Sanity API
            await articleRepository.pushToSanity(article, token);

            // 2. Mark as Published locally to remove from "Borradores"
            await articleRepository.update({ ...article, status: 'published' }, token);

            refreshArticles();
            alert('✅ Enviado a Sanity Studio! Ahora puedes editarlo allí.');
        } catch (error: any) {
            console.error('Sanity Push Error:', error);
            alert(`Error enviando a Sanity: ${error.message}`);
        }
    };

    const handleSyncSanity = async (silent: boolean = false) => {
        if (!silent && !confirm('Esto sincronizará artículos entre Sanity y Local (Bidireccional). \n\n1. Importará de Sanity -> Local (Validados)\n2. Exportará de Local (Validados) -> Sanity\n\n¿Continuar?')) return;

        try {
            const token = await getAuthToken();
            const sanityArticles = await articleRepository.importFromSanity();
            let importCount = 0;
            let exportCount = 0;

            // 1. IMPORT: Sanity -> Local
            // Sanity is the source of truth for its own content.
            for (const sArticle of sanityArticles) {
                // Check if exists locally by Slug match (approximate) or Title
                const exists = articles.some(a => a.url === sArticle.slug || a.title === sArticle.title);

                if (!exists) {
                    try {
                        const newArticle = await articleRepository.create(
                            sArticle.title,
                            sArticle.body ? 'Importado de Sanity' : '',
                            'Sanity Import',
                            token
                        );

                        await articleRepository.update({
                            ...newArticle,
                            summary: sArticle.lead,
                            url: sArticle.slug,
                            status: 'published',
                            published_at: sArticle.publishedAt,
                            featured: false
                        }, token);

                        importCount++;
                    } catch (importErr) {
                        console.error(`Failed to import article ${sArticle.title}:`, importErr);
                        // Continue to next article
                    }
                }
            }

            // 2. EXPORT: Local (Published) -> Sanity
            // Only export if we verified Sanity state first (sanityArticles valid)
            if (sanityArticles) {
                // Find local published articles that are NOT in Sanity
                const pendingExport = articles.filter(a =>
                    a.status === 'published' &&
                    !sanityArticles.some((sa: any) => sa.slug === a.url || sa.title === a.title)
                );

                for (const lArticle of pendingExport) {
                    try {
                        console.log(`Auto-exporting to Sanity: ${lArticle.title}`);
                        await articleRepository.pushToSanity(lArticle, token);
                        exportCount++;
                    } catch (err) {
                        console.error(`Failed to auto-export article ${lArticle.id}:`, err);
                    }
                }
            }

            if (importCount > 0 || exportCount > 0) {
                refreshArticles();
                if (!silent) alert(`✅ Sincronización Completada:\n⬇️ Importados: ${importCount}\n⬆️ Exportados: ${exportCount}`);
            } else {
                if (!silent) alert('Todo sincronizado. No se encontraron cambios.');
            }

        } catch (error: any) {
            console.error('Sync Error:', error);
            if (!silent) alert(`Error sincronizando: ${error.message}`);
        }
    };

    // Auto-sync on mount (ONCE)
    const hasAutoSynced = useRef(false);

    useEffect(() => {
        // Run once when articles are loaded and user is admin
        if (!hasAutoSynced.current && !articlesLoading && user?.role === 'admin' && articles.length > 0) {
            console.log('Running auto-sync...');
            hasAutoSynced.current = true;
            // We use a small timeout to let the UI settle
            setTimeout(() => handleSyncSanity(true), 1000);
        }
    }, [articlesLoading, user?.role, articles.length]);

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
        handleSanityPush,
        handleSyncSanity,
        logout: useAuthViewModel().logout
    };
}
