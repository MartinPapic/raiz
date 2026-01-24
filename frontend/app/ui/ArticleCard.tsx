import Link from 'next/link';
import { Article } from "../model";

interface ArticleCardProps {
    article: Article;
    showEditButton?: boolean;
    onEdit?: (article: Article) => void;
    onDelete?: (id: number) => void;
    onArchive?: (article: Article) => void;
    onScrape?: (article: Article) => void;
    onSanityPush?: (article: Article) => void; // New prop for Sanity
    isSelected?: boolean;
    onToggleSelect?: (id: number) => void;
    highlight?: boolean;
    compact?: boolean;
}

export default function ArticleCard({ article, showEditButton, onEdit, onDelete, onArchive, onScrape, onSanityPush, isSelected, onToggleSelect, highlight, compact }: ArticleCardProps) {
    const title = article.title;

    const source = article.source;

    const url = article.url;

    const snippet = article.summary;

    const formattedDate = article.published_at
        ? new Date(article.published_at).toLocaleDateString('es-CL', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
            timeZone: 'America/Santiago'
        })
        : 'Fecha desconocida';

    if (compact) {
        return (
            <div className={`flex gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow`}>
                <div className="w-24 h-24 shrink-0 rounded overflow-hidden bg-gray-200">
                    {article.main_image && <img src={article.main_image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide mb-1">{source}</span>
                    <h3 className="font-bold text-sm leading-tight text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                        <Link href={`/article/${article.url || article.id}`} className="hover:underline">{title}</Link>
                    </h3>
                    <div className="text-xs text-gray-500">{formattedDate}</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${isSelected ? 'ring-2 ring-green-500' : ''} ${highlight ? 'border-green-500 md:col-span-1 lg:col-span-1 border-2' : ''}`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    {onToggleSelect && (
                        <input
                            type="checkbox"
                            checked={isSelected || false}
                            onChange={() => typeof article.id === 'number' && onToggleSelect(article.id)}
                            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                    )}
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                        {source}
                    </span>
                </div>
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

            </div>
            <h3 className={`text-lg font-bold mb-2 text-gray-900 dark:text-gray-100 ${highlight ? 'text-xl md:text-2xl' : ''}`}>
                <Link href={`/article/${article.url || article.id}`} className="hover:underline">
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
                    href={`/article/${article.url || article.id}`}
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
                    {onDelete && typeof article.id === 'number' && (
                        <button
                            onClick={() => onDelete(article.id as number)}
                            className="text-sm px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded transition-colors"
                        >
                            Eliminar
                        </button>
                    )}
                </div>
            )}
            {article.status === 'draft' && (
                <div className="mt-2 flex gap-2 justify-end border-t pt-2 border-gray-100 dark:border-gray-700">
                    {onScrape && (
                        <button
                            onClick={() => onScrape(article)}
                            className="text-sm px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition-colors"
                        >
                            ↻ Re-Scrape
                        </button>
                    )}
                    {onSanityPush && (
                        <button
                            onClick={() => onSanityPush(article)}
                            className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors font-medium flex items-center gap-1"
                        >
                            <span>⚡</span> Aprobar en CMS
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
