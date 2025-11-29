import Link from 'next/link';
import { Article } from "../model";

interface ArticleCardProps {
    article: Article;
    showEditButton?: boolean;
    onEdit?: (article: Article) => void;
    onDelete?: (id: number) => void;
    onArchive?: (article: Article) => void;
    onScrape?: (article: Article) => void;
}

export default function ArticleCard({ article, showEditButton, onEdit, onDelete, onArchive, onScrape }: ArticleCardProps) {
    const title = article.title;

    const source = article.source;

    const url = article.url;

    const snippet = article.summary;

    const formattedDate = article.published_at
        ? new Date(article.published_at).toLocaleDateString('es-CL', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
        : 'Fecha desconocida';

    return (
        <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                    {source}
                </span>
                {article.status === 'draft' && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full ml-2">
                        Borrador
                    </span>
                )}
                {article.status === 'archived' && (
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full ml-2">
                        Archivado
                    </span>
                )}
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full ml-2 flex items-center gap-1">
                    ✨ IA
                </span>
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">
                <Link href={`/article/${article.id}`} className="hover:underline">
                    {title}
                </Link>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                {snippet}
            </p>
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                <span>Publicado el: {formattedDate}</span>
            </div>
            <div className="flex justify-end">
                <Link
                    href={`/article/${article.id}`}
                    className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                    Leer artículo &rarr;
                </Link>
            </div>
            {showEditButton && onEdit && (
                <div className="mt-4 flex gap-2 justify-end border-t pt-4 border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => onEdit(article)}
                        className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        Editar
                    </button>
                    {article.status !== 'archived' && onArchive && (
                        <button
                            onClick={() => onArchive(article)}
                            className="text-sm px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded transition-colors"
                        >
                            Archivar
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={() => onDelete(article.id)}
                            className="text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
                        >
                            Eliminar
                        </button>
                    )}
                </div>
            )}
            {article.status === 'draft' && onScrape && (
                <div className="mt-2 flex justify-end border-t pt-2 border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => onScrape(article)}
                        className="text-sm px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors"
                    >
                        Recuperar Original
                    </button>
                </div>
            )}
        </div>
    );
}
