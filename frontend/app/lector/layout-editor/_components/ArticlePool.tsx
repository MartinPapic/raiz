import { Article } from '../../../model';
import { useDraggable } from '@dnd-kit/core';

export default function ArticlePool({ articles }: { articles: Article[] }) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b dark:border-gray-700">
                <h2 className="font-semibold text-gray-700 dark:text-gray-200">Artículos Listos</h2>
                <div className="text-xs text-gray-500 mt-1">Arrastra al lienzo</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {articles.length === 0 && (
                    <div className="text-center text-sm text-gray-400 py-8">
                        No hay artículos listos para diseño.
                    </div>
                )}
                {articles.map(article => (
                    <DraggableArticle key={article.id} article={article} />
                ))}
            </div>
        </div>
    );
}

function DraggableArticle({ article }: { article: Article }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `article-${article.id}`,
        data: {
            type: 'article',
            article
        }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="p-3 bg-white dark:bg-gray-700 rounded shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md cursor-grab active:cursor-grabbing"
        >
            <h4 className="text-sm font-medium line-clamp-2">{article.title}</h4>
            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{article.source}</span>
                <span>{new Date(article.published_at!).toLocaleDateString()}</span>
            </div>
        </div>
    );
}
