'use client';

import { useState, useEffect } from 'react';
import { useArticlesViewModel } from '../viewmodels/useArticlesViewModel';
import { useCuratorViewModel } from '../viewmodels/useCuratorViewModel';
import { useSourceViewModel } from '../viewmodels/useSourceViewModel';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';
import ArticleCard from '../ui/ArticleCard';
import SearchBar from '../ui/SearchBar';
import IngestionControl from '../ui/IngestionControl';
import ArticleEditorModal from '../ui/ArticleEditorModal';
import SourceList from '../ui/SourceList';
import SuccessfulSourceList from '../ui/SuccessfulSourceList';
import ConnectionHistoryList from '../ui/ConnectionHistoryList';
import Navbar from '../ui/Navbar';
import { Article } from '../model';
import { articleRepository } from '../data/articleRepository';

export default function HomeView() {
    const { user, logout } = useAuthViewModel();
    const { isCuratorMode, filterStatus, setFilterStatus, toggleCuratorMode } = useCuratorViewModel();

    // Only allow curator mode if user is admin
    const effectiveCuratorMode = isCuratorMode && user?.role === 'admin';

    const {
        articles,
        loading,
        isSearching,
        searchResults,
        handleSearch,
        refreshArticles,
        setArticles
    } = useArticlesViewModel(effectiveCuratorMode, filterStatus);

    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSourceManager, setShowSourceManager] = useState(false);
    const [ingestionPrefill, setIngestionPrefill] = useState<{ url: string; source: string } | null>(null);
    const { successfulSources, connectionHistory } = useSourceViewModel();

    // Knowledge Base State
    const [kbSuggestions, setKbSuggestions] = useState<any[]>([]);

    // Fetch suggestions when editing article changes
    useEffect(() => {
        if (editingArticle && editingArticle.tags) {
            const token = localStorage.getItem('token') || '';
            articleRepository.getSuggestions(editingArticle.tags, '', token)
                .then(setKbSuggestions)
                .catch(err => console.error('Error fetching suggestions:', err));
        } else {
            setKbSuggestions([]);
        }
    }, [editingArticle]);

    const displayedArticles = isSearching ? searchResults : articles;

    const handleSaveArticle = async (updatedArticle: Article) => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token') || '';
            const saved = await articleRepository.update(updatedArticle, token);

            // Optimistic update
            setArticles(prev => prev.map(a => a.id === saved.id ? saved : a));
            setEditingArticle(null);
            refreshArticles(); // Refresh to be sure
        } catch (error) {
            alert('Error saving article');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRegenerateArticle = async () => {
        if (!editingArticle) return;
        if (!confirm('Esto reescribirá el título y el contenido usando IA. ¿Continuar?')) return;

        setIsRegenerating(true);
        try {
            const token = localStorage.getItem('token') || '';
            const regenerated = await articleRepository.regenerate(editingArticle.id, token);
            setEditingArticle(regenerated); // Update the modal
        } catch (error) {
            alert('Error regenerating article');
        } finally {
            setIsRegenerating(false);
        }
    };

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

    const [isAuditing, setIsAuditing] = useState(false);
    const [auditReport, setAuditReport] = useState<string | null>(null);

    const handleAuditArticle = async () => {
        console.log('handleAuditArticle called');
        if (!editingArticle) {
            console.log('No editingArticle');
            return;
        }
        setIsAuditing(true);
        try {
            console.log('Calling articleRepository.audit...');
            const token = localStorage.getItem('token') || '';
            const report = await articleRepository.audit(editingArticle.id, token);
            console.log('Audit report received:', report);
            setAuditReport(report);
        } catch (error) {
            console.error('Error in handleAuditArticle:', error);
            alert('Error auditing article');
        } finally {
            setIsAuditing(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Navbar
                user={user}
                onLogout={logout}
                isCuratorMode={effectiveCuratorMode}
                onToggleCuratorMode={toggleCuratorMode}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Controls */}
                <div className="mb-8 space-y-6">
                    <SearchBar onSearch={handleSearch} />

                    {effectiveCuratorMode && (
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

                            <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                                {(['draft', 'published', 'archived'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-3 py-1 rounded-full text-sm capitalize ${filterStatus === status
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-medium'
                                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {status === 'draft' ? 'Borradores' : status === 'published' ? 'Publicados' : 'Archivados'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Article List */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        {isSearching
                            ? `Resultados de búsqueda (${displayedArticles.length})`
                            : effectiveCuratorMode
                                ? `Modo Curador: ${filterStatus === 'draft' ? 'Borradores' : filterStatus === 'published' ? 'Publicados' : 'Archivados'}`
                                : 'Últimas Noticias'}
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
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {displayedArticles.map((article) => (
                                <ArticleCard
                                    key={article.id}
                                    article={article}
                                    showEditButton={effectiveCuratorMode}
                                    onEdit={() => setEditingArticle(article)}
                                    onDelete={() => handleDeleteArticle(article.id)}
                                    onArchive={() => handleArchiveArticle(article)}
                                    onScrape={handleScrapeArticle}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Modal */}
            {editingArticle && (
                <ArticleEditorModal
                    article={editingArticle}
                    onSave={handleSaveArticle}
                    onCancel={() => {
                        setEditingArticle(null);
                        setAuditReport(null);
                    }}
                    onRegenerate={handleRegenerateArticle}
                    onRefine={async (instruction, content) => {
                        setIsRefining(true);
                        try {
                            const token = localStorage.getItem('token') || '';
                            const refinedContent = await articleRepository.refine(editingArticle.id, content, instruction, token);

                            // Update local state
                            setEditingArticle({ ...editingArticle, content: refinedContent });
                        } catch (error) {
                            alert('Error refining article');
                        } finally {
                            setIsRefining(false);
                        }
                    }}
                    onScrape={async () => {
                        try {
                            const token = localStorage.getItem('token') || '';
                            const scrapedArticle = await articleRepository.scrape(editingArticle.id, token);
                            setEditingArticle(scrapedArticle);
                            refreshArticles();
                        } catch (error: any) {
                            console.error("Scrape error:", error);
                            alert(`Error recuperando texto original: ${error.message || 'Unknown error'}`);
                        }
                    }}
                    onAudit={handleAuditArticle}
                    onRegenerateWithAudit={async (report) => {
                        setIsRefining(true);
                        try {
                            const token = localStorage.getItem('token') || '';
                            const instruction = `Corrige el siguiente artículo basándote ESTRICTAMENTE en los errores detectados en este reporte de auditoría. Si el reporte dice "sin errores", mejora el estilo general.\n\nREPORTE DE AUDITORÍA:\n${report}`;

                            const refinedContent = await articleRepository.refine(editingArticle.id, editingArticle.content || '', instruction, token);

                            // Update local state
                            setEditingArticle({ ...editingArticle, content: refinedContent });
                            // Optionally clear the audit report after fixing
                            // setAuditReport(null); 
                        } catch (error) {
                            console.error('Error regenerating with audit:', error);
                            alert('Error regenerating article with audit');
                        } finally {
                            setIsRefining(false);
                        }
                    }}
                    onAddToKnowledgeBase={async (content, tags) => {
                        try {
                            const token = localStorage.getItem('token') || '';
                            await articleRepository.addToKnowledgeBase(content, tags, editingArticle.id, token);
                        } catch (error) {
                            console.error('Error adding to KB:', error);
                            throw error; // Re-throw to be caught by modal
                        }
                    }}
                    knowledgeBaseSuggestions={kbSuggestions}
                    isRegenerating={isRegenerating}
                    isRefining={isRefining}
                    isSaving={isSaving}
                    isAuditing={isAuditing}
                    auditReport={auditReport}
                    onClearAudit={() => setAuditReport(null)}
                />
            )}
        </main>
    );
}
