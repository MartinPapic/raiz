'use client';

import { useArticlesViewModel } from '../viewmodels/useArticlesViewModel';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';
import ArticleCard from '../ui/ArticleCard';
import SearchBar from '../ui/SearchBar';
import Navbar from '../ui/Navbar';

export default function HomeView() {
    const { user, logout } = useAuthViewModel();

    // HomeView is always read-only (not curator mode)
    const effectiveCuratorMode = false;
    const filterStatus = 'published'; // Home only shows published articles

    const {
        articles,
        loading,
        isSearching,
        searchResults,
        handleSearch
    } = useArticlesViewModel(effectiveCuratorMode, filterStatus);

    const displayedArticles = isSearching ? searchResults : articles;

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Navbar
                user={user}
                onLogout={logout}
                isCuratorMode={false}
                onToggleCuratorMode={() => { }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Controls */}
                <div className="mb-8 space-y-6">
                    <SearchBar onSearch={handleSearch} />
                </div>

                {/* Article List */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        {isSearching
                            ? `Resultados de búsqueda (${displayedArticles.length})`
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
                                    showEditButton={false}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
