import { Article } from '../../model';

export default function ListBlock({ data }: { data: any }) {
    const { items = [], title } = data;

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded border dark:border-gray-700">
            {title && <h3 className="text-lg font-bold mb-4 border-b pb-2 dark:border-gray-700">{title}</h3>}
            <div className="divide-y dark:divide-gray-700">
                {items.length === 0 && <div className="py-4 text-center text-gray-400">Lista Vacía</div>}

                {items.filter((a: any) => !!a).map((article: Article) => (
                    <div key={article.id} className="py-3 group cursor-pointer">
                        <h4 className="font-medium group-hover:text-blue-600 transition-colors">{article.title}</h4>
                        <div className="flex gap-2 mt-1 text-xs text-gray-500">
                            <span className="font-semibold">{article.source}</span>
                            <span>•</span>
                            <span>{new Date(article.published_at!).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
