'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useArticlesViewModel } from '../viewmodels/useArticlesViewModel';
import { useCuratorViewModel } from '../viewmodels/useCuratorViewModel';
import { useSourceViewModel } from '../viewmodels/useSourceViewModel';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';
import ArticleCard from '../ui/ArticleCard';
import SearchBar from '../ui/SearchBar';
import IngestionControl from '../ui/IngestionControl';
import SourceList from '../ui/SourceList';
import SuccessfulSourceList from '../ui/SuccessfulSourceList';
import ConnectionHistoryList from '../ui/ConnectionHistoryList';
import Navbar from '../ui/Navbar';
import { Article } from '../model';
import { articleRepository } from '../data/articleRepository';

export default function CuratorView() {
    const router = useRouter();
    const { user, logout } = useAuthViewModel();
    // In CuratorView, we force curator mode to be true for logic that depends on it
    const { filterStatus, setFilterStatus } = useCuratorViewModel();

    // Always true in this view
    const effectiveCuratorMode = true;

    const {
        articles,
        loading,
        isSearching,
        searchResults,
        handleSearch,
        refreshArticles,
        setArticles
    } = useArticlesViewModel(effectiveCuratorMode, filterStatus);

    const [showSourceManager, setShowSourceManager] = useState(false);
    const [ingestionPrefill, setIngestionPrefill] = useState<{ url: string; source: string } | null>(null);
    const { successfulSources, connectionHistory } = useSourceViewModel();

    // Curator Filters
    const [filterText, setFilterText] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'columns'>('list');

    // Bulk Actions State
    const [selectedArticleIds, setSelectedArticleIds] = useState<Set<number>>(new Set());

    const displayedArticles = isSearching ? searchResults : articles.filter(article => {
        // 1. Text Filter (Name/Content)
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
            // Set end date to end of day
            end.setHours(23, 59, 59, 999);
            if (articleDate > end) return false;
        }

        return true;
    });

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

    // Bulk Action Handlers
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

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Navbar
                user={user}
                onLogout={logout}
                isCuratorMode={true} // Always active in this view
                onToggleCuratorMode={() => { }} // No-op
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Controls */}
                <div className="mb-8 space-y-6">
                    <SearchBar onSearch={handleSearch} />

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Panel de Control</h3>
                            <button
                                onClick={() => setShowSourceManager(!showSourceManager)}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                {showSourceManager ? 'Ocultar Fuentes' : 'Administrar Fuentes'}
                            </button>
                        </div>

                        {showSourceManager && <SourceList />}

                        <SuccessfulSourceList
                            sources={successfulSources}
                            onSelectSource={(url, name) => setIngestionPrefill({ url, source: name })}
                        />

                        <IngestionControl
                            onIngestComplete={refreshArticles}
                            prefill={ingestionPrefill}
                        />

                        <ConnectionHistoryList history={connectionHistory} />

                        <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
                            <div className="flex gap-2">
                                {(['draft', 'published', 'archived'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            setFilterStatus(status);
                                            setViewMode('list');
                                        }}
                                        className={`px-3 py-1 rounded-full text-sm capitalize ${filterStatus === status && viewMode === 'list'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-medium'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {status === 'draft' ? 'Borradores' : status === 'published' ? 'Validados' : 'Archivados'}
                                    </button>
                                ))}
                            </div>

                            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1 text-sm rounded-md transition-all ${viewMode === 'list'
                                        ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Lista
                                </button>
                                <button
                                    onClick={() => {
                                        setViewMode('columns');
                                        setFilterStatus('all');
                                    }}
                                    className={`px-3 py-1 text-sm rounded-md transition-all ${viewMode === 'columns'
                                        ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    Columnas
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Filtrar por nombre</label>
                                <input
                                    type="text"
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    placeholder="Buscar..."
                                    className="w-full px-3 py-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Desde</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Hasta</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        <div className="flex items-center gap-4 pt-4 border-t dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={displayedArticles.length > 0 && selectedArticleIds.size === displayedArticles.length}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Seleccionar todo ({selectedArticleIds.size})
                                </span>
                            </div>
                            {selectedArticleIds.size > 0 && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleBulkArchive}
                                        className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                                    >
                                        Archivar Seleccionados
                                    </button>
                                    <button
                                        onClick={handleBulkDelete}
                                        className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                                    >
                                        Eliminar Seleccionados
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Article List */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        {isSearching
                            ? `Resultados de búsqueda (${displayedArticles.length})`
                            : viewMode === 'columns'
                                ? 'Tablero Kanban'
                                : `Modo Curador: ${filterStatus === 'draft' ? 'Borradores' : filterStatus === 'published' ? 'Validados' : filterStatus === 'archived' ? 'Archivados' : 'Todos'}`}
                    </h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Cargando artículos...</p>
                        </div>
                    ) : displayedArticles.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <p className="text-gray-500">No se encontraron artículos.</p>
                        </div>
                    ) : viewMode === 'list' ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {displayedArticles.map((article) => (
                                <ArticleCard
                                    key={article.id}
                                    article={article}
                                    showEditButton={true}
                                    onEdit={() => router.push(`/curator/editor/${article.id}`)}
                                    onDelete={() => handleDeleteArticle(article.id)}
                                    onArchive={() => handleArchiveArticle(article)}
                                    onScrape={handleScrapeArticle}
                                    isSelected={selectedArticleIds.has(article.id)}
                                    onToggleSelect={handleToggleSelect}
                                />
                            ))}
                        </div>
                    ) : (
                        /* Columns View */
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-300px)] overflow-hidden">
                            {/* Draft Column */}
                            <div className="flex flex-col bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-full">
                                <h3 className="font-semibold mb-4 flex items-center justify-between text-gray-700 dark:text-gray-300">
                                    <span>Borradores</span>
                                    <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">
                                        {displayedArticles.filter(a => a.status === 'draft').length}
                                    </span>
                                </h3>
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                    {displayedArticles.filter(a => a.status === 'draft').map(article => (
                                        <ArticleCard
                                            key={article.id}
                                            article={article}
                                            showEditButton={true}
                                            onEdit={() => router.push(`/curator/editor/${article.id}`)}
                                            onDelete={() => handleDeleteArticle(article.id)}
                                            onArchive={() => handleArchiveArticle(article)}
                                            onScrape={handleScrapeArticle}
                                            isSelected={selectedArticleIds.has(article.id)}
                                            onToggleSelect={handleToggleSelect}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Published Column */}
                            <div className="flex flex-col bg-green-50 dark:bg-green-900/20 rounded-lg p-4 h-full">
                                <h3 className="font-semibold mb-4 flex items-center justify-between text-green-800 dark:text-green-300">
                                    <span>Validados</span>
                                    <span className="bg-green-100 dark:bg-green-800 px-2 py-0.5 rounded-full text-xs">
                                        {displayedArticles.filter(a => a.status === 'published').length}
                                    </span>
                                </h3>
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                    {displayedArticles.filter(a => a.status === 'published').map(article => (
                                        <ArticleCard
                                            key={article.id}
                                            article={article}
                                            showEditButton={true}
                                            onEdit={() => router.push(`/curator/editor/${article.id}`)}
                                            onDelete={() => handleDeleteArticle(article.id)}
                                            onArchive={() => handleArchiveArticle(article)}
                                            onScrape={handleScrapeArticle}
                                            isSelected={selectedArticleIds.has(article.id)}
                                            onToggleSelect={handleToggleSelect}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Archived Column */}
                            <div className="flex flex-col bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-full">
                                <h3 className="font-semibold mb-4 flex items-center justify-between text-gray-700 dark:text-gray-300">
                                    <span>Archivados</span>
                                    <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">
                                        {displayedArticles.filter(a => a.status === 'archived').length}
                                    </span>
                                </h3>
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                    {displayedArticles.filter(a => a.status === 'archived').map(article => (
                                        <ArticleCard
                                            key={article.id}
                                            article={article}
                                            showEditButton={true}
                                            onEdit={() => router.push(`/curator/editor/${article.id}`)}
                                            onDelete={() => handleDeleteArticle(article.id)}
                                            onArchive={() => handleArchiveArticle(article)}
                                            onScrape={handleScrapeArticle}
                                            isSelected={selectedArticleIds.has(article.id)}
                                            onToggleSelect={handleToggleSelect}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
