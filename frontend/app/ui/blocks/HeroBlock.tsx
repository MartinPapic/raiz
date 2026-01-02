/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function HeroBlock({ data }: { data: any }) {
    const { article, layoutVariant, customHeadline } = data;

    if (!article) return null; // Don't show empty block

    const isSplit = layoutVariant === 'split';
    const headline = customHeadline || article.title;
    const summary = article.summary;

    if (isSplit) {
        return (
            <Link href={`/${article.url}`} className="block group">
                <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border dark:border-gray-700 min-h-[400px]">
                    <div className="md:w-1/2 relative min-h-[250px] md:min-h-auto overflow-hidden">
                        {article.main_image ? (
                            <img
                                src={article.main_image}
                                alt={headline}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                No Image
                            </div>
                        )}
                    </div>
                    <div className="md:w-1/2 p-8 flex flex-col justify-center">
                        <div className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">
                            {article.source || 'Destacado'}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                            {headline}
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                            {summary}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            {article.author && <span className="font-medium mr-4">{typeof article.author === 'string' ? article.author : article.author.name}</span>}
                            <span>{new Date(article.published_at || Date.now()).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // Default Full Overlay Style (Premium Look)
    return (
        <Link href={`/${article.url}`} className="block group relative rounded-2xl overflow-hidden shadow-lg h-[500px]">
            <div className="absolute inset-0">
                {article.main_image ? (
                    <img
                        src={article.main_image}
                        alt={headline}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-800" />
                )}
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white max-w-4xl">
                <div className="inline-block px-3 py-1 mb-4 bg-green-600/90 rounded-full text-xs font-bold uppercase tracking-wider">
                    {article.source || 'Portada'}
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                    {headline}
                </h2>
                <p className="text-lg md:text-xl text-gray-200 line-clamp-2 md:line-clamp-3 max-w-2xl">
                    {summary}
                </p>
                <div className="mt-6 flex items-center text-sm text-gray-300">
                    {article.author && <span className="font-medium mr-4 border-r border-gray-500 pr-4">{typeof article.author === 'string' ? article.author : article.author.name}</span>}
                    <span>{new Date(article.published_at || Date.now()).toLocaleDateString()}</span>
                </div>
            </div>
        </Link>
    );
}
