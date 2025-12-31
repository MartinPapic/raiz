'use client';

import { useRouter } from 'next/navigation';
import { useCuratorViewModel } from '../viewmodels/useCuratorViewModel';
import ArticleCard from '../ui/ArticleCard';
import SearchBar from '../ui/SearchBar';
import IngestionControl from '../ui/IngestionControl';
import SourceList from '../ui/SourceList';
import SuccessfulSourceList from '../ui/SuccessfulSourceList';
import ConnectionHistoryList from '../ui/ConnectionHistoryList';
import SchedulerControl from '../ui/SchedulerControl';
import Navbar from '../ui/Navbar';

export default function CuratorView() {
    const router = useRouter();

    const {
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
        logout
    } = useCuratorViewModel();

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return null; // Will redirect
    }

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

                        <SchedulerControl />

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
                            <button
                                onClick={() => setShowNewArticleModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm flex items-center gap-2"
                            >
                                <span>+</span> Nuevo Artículo
                            </button>
                        </div>

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

                    {articlesLoading ? (
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


            {/* New Article Modal */}
            {
                showNewArticleModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
                            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                                <h3 className="text-lg font-bold dark:text-white">Nuevo Artículo</h3>
                                <button onClick={() => setShowNewArticleModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">✕</button>
                            </div>

                            <div className="p-4 border-b dark:border-gray-700 flex gap-4">
                                <button
                                    onClick={() => setNewArticleMode('url')}
                                    className={`pb-2 text-sm font-medium border-b-2 ${newArticleMode === 'url' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                >
                                    Importar desde URL
                                </button>
                                <button
                                    onClick={() => setNewArticleMode('manual')}
                                    className={`pb-2 text-sm font-medium border-b-2 ${newArticleMode === 'manual' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                >
                                    Crear Manualmente
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1">
                                {newArticleMode === 'url' ? (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Ingresa la URL de una noticia para extraer su contenido automáticamente.
                                        </p>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">URL del Artículo</label>
                                            <input
                                                type="url"
                                                value={newArticleUrl}
                                                onChange={(e) => setNewArticleUrl(e.target.value)}
                                                placeholder="https://ejemplo.com/noticia"
                                                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Título *</label>
                                            <input
                                                type="text"
                                                value={newArticleTitle}
                                                onChange={(e) => setNewArticleTitle(e.target.value)}
                                                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Fuente (Opcional)</label>
                                            <input
                                                type="text"
                                                value={newArticleSource}
                                                onChange={(e) => setNewArticleSource(e.target.value)}
                                                placeholder="Ej: Comunicado de Prensa"
                                                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Contenido *</label>
                                            <textarea
                                                value={newArticleContent}
                                                onChange={(e) => setNewArticleContent(e.target.value)}
                                                rows={10}
                                                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
                                <button
                                    onClick={() => setShowNewArticleModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={newArticleMode === 'url' ? handleIngestArticle : handleCreateArticle}
                                    disabled={isCreating}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isCreating ? 'Procesando...' : (newArticleMode === 'url' ? 'Importar' : 'Crear')}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </main >
    );
}
