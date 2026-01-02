import ArticleCard from '../ArticleCard';
import { Article } from '../../model';

/* eslint-disable @next/next/no-img-element */
export default function GridBlock({ data }: { data: any }) {
    const { items = [], columns = 3, title, layoutVariant = 'default' } = data;

    if (layoutVariant === 'mosaic') {
        const featured = items[0];
        const sides = items.slice(1);

        return (
            <div className="p-4">
                {title && <h3 className="text-xl font-bold mb-4 dark:text-gray-100 border-l-4 border-green-600 pl-3">{title}</h3>}
                <div className="grid gap-6 md:grid-cols-12">
                    {/* Featured Item (Left, 8 cols) */}
                    <div className="md:col-span-8">
                        {featured && <ArticleCard article={featured} highlight showEditButton={false} />}
                    </div>
                    {/* Side Items (Right, 4 cols) */}
                    <div className="md:col-span-4 flex flex-col gap-6">
                        {sides.map((article: Article) => (
                            <ArticleCard key={article.id} article={article} showEditButton={false} compact />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            {title && <h3 className="text-xl font-bold mb-4 dark:text-gray-100">{title}</h3>}
            <div className={`grid gap-6 ${columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                {items.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-gray-500">
                        Grid Vacío
                    </div>
                )}

                {items.filter((a: any) => !!a).map((article: Article) => (
                    <ArticleCard key={article.id} article={article} showEditButton={false} />
                ))}
            </div>
        </div>
    );
}
