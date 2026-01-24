import Link from 'next/link';
import Image from 'next/image';

interface ArticleCardProps {
    article: {
        slug: string;
        title: string;
        lead?: string;
        main_image?: string;
        publishedAt?: string;
        author?: { name: string };
    };
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
    // Handle image URL resolution
    // Assuming article.mainImage is a string URL based on previous usage in page.tsx
    // "src={article.main_image}" in page.tsx suggests it might be mapped already or raw
    // Let's verify how page.tsx used it. It used "article.main_image" (snake_case) but schema has "mainImage" (camelCase).
    // I should check the GROQ query to be sure, but standardizing on the prop passed to this component is key.
    // The Component in page.tsx used `article.main_image` and `article.slug`. 
    // Let's stick to the interface matching the object passed in.

    // Note: page.tsx used `href={\`/noticia/${article.slug}\`}`. 
    // Often Sanity returns slug as an object { current: ... }. 
    // page.tsx usage: `href="/noticia/${article.slug}"`. This implies article.slug is a string OR it relies on toString?
    // Usually it is `article.slug.current`. 
    // I will check the queries.ts file to be safe. But for now I'll create this file and might adjust it after checking queries.

    // Replicating exactly what was in page.tsx for safety:
    // article.main_image
    // article.slug (as string in link)

    return (
        <Link href={`/noticia/${article.slug}`} className="group block">
            <div className="aspect-video relative overflow-hidden rounded-md mb-3 bg-gray-100 dark:bg-gray-800">
                {article.main_image ? (
                    <img
                        src={article.main_image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-xs">Sin Imagen</span>
                    </div>
                )}
            </div>
            <h3 className="font-bold text-lg leading-snug text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {article.title}
            </h3>
            {article.lead && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {article.lead}
                </p>
            )}
            <div className="mt-3 flex items-center text-xs text-gray-500 dark:text-gray-500">
                <span className="font-medium">{article.author?.name || 'Redacción'}</span>
                <span className="mx-1">•</span>
                <time>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</time>
            </div>
        </Link>
    );
};

export default ArticleCard;
