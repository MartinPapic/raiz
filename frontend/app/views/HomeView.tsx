'use client';

import { useAuthViewModel } from '../viewmodels/useAuthViewModel';
import ArticleCard from '../ui/ArticleCard';
import SearchBar from '../ui/SearchBar';
import Navbar from '../ui/Navbar';
import HeroBlock from '../ui/blocks/HeroBlock';
import GridBlock from '../ui/blocks/GridBlock';
import ListBlock from '../ui/blocks/ListBlock';
import OpinionBlock from '../ui/blocks/OpinionBlock';
import TickerBlock from '../ui/blocks/TickerBlock';

import { Article } from '../model';

interface HomeViewProps {
    initialFeatured: any[]; // sanity types
    initialArticles: any[]; // sanity types
    layout?: any[] | null;
}

export default function HomeView({ initialFeatured = [], initialArticles = [], layout }: HomeViewProps) {
    const { user, logout } = useAuthViewModel();

    // Mapping helper
    const mapSanityToArticle = (doc: any): Article => ({
        id: doc._id,
        title: doc.title,
        summary: doc.lead || '',
        content: '',
        status: 'published',
        source: 'Raíz',
        url: doc.slug,
        published_at: doc.publishedAt,
        author: doc.author,
        main_image: doc.mainImage,
        created_at: doc._createdAt || new Date().toISOString()
    });

    const articles = initialArticles.map(mapSanityToArticle);
    const featured = initialFeatured.map(mapSanityToArticle);

    const loading = false;
    const isSearching = false;
    const searchResults: Article[] = [];

    const handleSearch = (query: string) => {
        console.log("Search not yet re-wired for Sanity");
    };

    const displayedArticles = isSearching ? searchResults : articles;

    const resolveBlockComponent = (type: string) => {
        switch (type) {
            case 'heroBlock': return HeroBlock;
            case 'gridBlock': return GridBlock;
            case 'listBlock': return ListBlock;
            case 'opinionBlock': return OpinionBlock;
            case 'tickerBlock': return TickerBlock;
            default: return () => null;
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Navbar
                user={user}
                onLogout={logout}
                isCuratorMode={false}
                onToggleCuratorMode={() => { }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">

                {/* HERO */}
                <section className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                        Raíz — Comunicación Sostenible para Latinoamérica
                    </h1>
                    <p className="max-w-3xl text-lg text-gray-600 dark:text-gray-300">
                        Noticias y análisis sobre sostenibilidad, curadas por personas y
                        asistidas por inteligencia artificial responsable.
                    </p>
                </section>

                {/* SEARCH */}
                <section>
                    <SearchBar onSearch={handleSearch} />
                </section>

                {/* DYNAMIC LAYOUT OR DEFAULT FALLBACK */}
                {layout && layout.length > 0 ? (
                    <div className="custom-grid-layout">
                        {layout.map((block: any) => {
                            const Component = resolveBlockComponent(block._type);
                            if (!Component) return null;

                            // Default Layout Fallback if missing
                            const l = block.layout || { x: 0, y: 0, w: 12, h: 4 };

                            // CSS Variables for Grid Placement
                            const style = {
                                '--x': (l.x || 0) + 1,      // 1-based index
                                '--y': (l.y || 0) + 1,      // 1-based index
                                '--w': l.w || 12,           // default full width
                                '--h': l.h || 4             // default height
                            } as React.CSSProperties;

                            return (
                                <div key={block._key} className="custom-grid-item" style={style}>
                                    <Component data={block} />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <>
                        {/* FEATURED FALLBACK */}
                        {!isSearching && featured.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-xl font-semibold">Destacados</h2>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {featured.map((article) => (
                                        <ArticleCard
                                            key={article.id}
                                            article={article}
                                            highlight
                                            showEditButton={false}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* LATEST FALLBACK */}
                        <section className="space-y-4">
                            <h2 className="text-xl font-semibold">
                                {isSearching
                                    ? `Resultados de búsqueda (${displayedArticles.length})`
                                    : 'Últimas publicaciones'}
                            </h2>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-500">Cargando artículos...</p>
                                </div>
                            ) : displayedArticles.length === 0 && !isSearching ? (
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
                        </section>
                    </>
                )}
            </div>
        </main>
    );
}
