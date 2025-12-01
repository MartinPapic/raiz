'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Article } from '../model';
import { articleRepository } from '../data/articleRepository';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';

interface ArticleDetailViewProps {
    articleId: number;
}

export default function ArticleDetailView({ articleId }: ArticleDetailViewProps) {
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuthViewModel();
    const router = useRouter();

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const data = await articleRepository.getById(articleId);
                setArticle(data);
            } catch (err) {
                console.error('Error fetching article:', err);
                setError('Error al cargar el artículo');
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [articleId]);

    if (loading) return <div className="p-8 text-center">Cargando...</div>;
    if (error || !article) return <div className="p-8 text-center text-red-500">{error || 'Artículo no encontrado'}</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <button
                onClick={() => router.back()}
                className="mb-6 text-green-600 hover:underline flex items-center gap-2"
            >
                &larr; Volver
            </button>

            <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
                            {article.source}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {article.published_at ? new Date(article.published_at).toLocaleDateString('es-CL', {
                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                timeZone: 'America/Santiago'
                            }) : ''}
                        </span>
                        {article.status === 'draft' && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                Borrador
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        {article.title}
                    </h1>

                    <div className="prose dark:prose-invert max-w-none mb-8">
                        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {article.content || article.summary}
                        </p>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-between items-center">
                        <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            Ver fuente original &rarr;
                        </a>

                        {user?.role === 'admin' && (
                            <div className="flex gap-2">
                                {/* Future: Add Edit/Delete actions here */}
                            </div>
                        )}
                    </div>
                </div>
            </article>
        </div>
    );
}
