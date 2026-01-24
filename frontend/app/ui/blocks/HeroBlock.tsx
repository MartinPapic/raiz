/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

interface HeroBlockProps {
    data?: any;
    article?: any;
    layoutVariant?: string;
    customHeadline?: string;
}

export default function HeroBlock({ data, article, layoutVariant, customHeadline }: HeroBlockProps) {
    const item = article || data?.article;
    const { layoutVariant: dataVariant, customHeadline: dataHeadline } = data || {};

    // Legacy support for 'data' prop
    const finalVariant = layoutVariant || dataVariant;
    const finalHeadline = customHeadline || dataHeadline;

    if (!item) return null; // Don't show empty block

    const isSplit = finalVariant === 'split';
    const headline = finalHeadline || item.title;
    const summary = item.summary;

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    if (isSplit) {
        return (
            <Link href={`/${item.url || item.slug}`} className="block group">
                <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border dark:border-gray-700 min-h-[400px]">
                    <div className="md:w-1/2 relative min-h-[250px] md:min-h-auto overflow-hidden">
                        {item.main_image ? (
                            <img
                                src={item.main_image}
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
                            {item.source || 'Destacado'}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                            {headline}
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
                            {summary}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            {item.author && <span className="font-medium mr-4">{typeof item.author === 'string' ? item.author : item.author.name}</span>}
                            <span>{formatDate(item.published_at || item.publishedAt)}</span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // Default Full Overlay Style (Premium Look)
    return (
        <Link href={`/${item.url || item.slug}`} className="block group relative rounded-2xl overflow-hidden shadow-lg h-[500px]">
            <div className="absolute inset-0">
                {item.main_image ? (
                    <img
                        src={item.main_image}
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
                    {item.source || 'Portada'}
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                    {headline}
                </h2>
                <p className="text-lg md:text-xl text-gray-200 line-clamp-2 md:line-clamp-3 max-w-2xl">
                    {summary || item.lead}
                </p>
                <div className="mt-6 flex items-center text-sm text-gray-300">
                    {item.author && <span className="font-medium mr-4 border-r border-gray-500 pr-4">{typeof item.author === 'string' ? item.author : item.author.name}</span>}
                    <span>{formatDate(item.published_at || item.publishedAt)}</span>
                </div>
            </div>
        </Link>
    );
}
