import { client } from '@/sanity/lib/client';
import { SECTION_QUERY } from '@/app/queries';
import ArticleCard from '@/app/ui/ArticleCard';
import { notFound } from 'next/navigation';

export const revalidate = 60;

// Mapping slugs to Sanity Category Titles
// Adjust these based on actual data in Sanity (e.g. Accents)
const CATEGORY_MAPPING: { [key: string]: string } = {
    'economia': 'Economía', // Legacy Title
    'politica': 'Política', // Legacy Title
    'cultura': 'Cultura',
    'tecnologia': 'Tecnologia', // or Tecnología
    'medio-ambiente': 'Medio Ambiente',
    'opinion': 'Opinion', // or Opinión
    'panoramas': 'Panoramas',
    'regional': 'Regional',
    'destacados': 'Destacados',
    'sociedad': 'Sociedad'
};

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function SectionPage({ params }: Props) {
    const { slug } = await params;
    const categoryTitle = CATEGORY_MAPPING[slug];

    if (!categoryTitle) {
        return notFound();
    }

    const articles = await client.fetch(SECTION_QUERY, {
        categoryTitle,
        sectionValue: slug // The slug usually matches the valid values in our list section schema (e.g. 'politica')
    });

    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-8">
                    <h1 className="text-4xl font-bold font-serif text-gray-900 dark:text-white uppercase tracking-wider">
                        {categoryTitle}
                    </h1>
                </div>

                {articles && articles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article: any) => (
                            <ArticleCard key={article._id} article={article} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No hay artículos en esta sección por el momento.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
