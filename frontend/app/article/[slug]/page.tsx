import { defineQuery } from "next-sanity";
import { Metadata } from 'next';
import { client } from '../../../sanity/lib/client';
import ArticleDetailView from '../../views/ArticleDetailView';
import { Article } from '../../model';

export const revalidate = 60; // ISR

const ARTICLE_QUERY = defineQuery(`
  *[_type == "article" && slug.current == $slug][0]{
    _id,
    title,
    lead,
    "slug": slug.current,
    "author": author->name,
    "mainImage": mainImage.asset->url,
    publishedAt,
    body
  }
`);

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const { slug } = params;

    if (/^\d+$/.test(slug)) {
        // Legacy/Numeric ID: Fetch basic metadata or default
        return {
            title: `Noticia #${slug} - Raíz`,
            description: 'Noticia archivada o en borrador.',
        };
    }

    // Sanity Fetch
    const doc = await client.fetch(ARTICLE_QUERY, { slug });

    if (!doc) {
        return {
            title: 'Artículo no encontrado - Raíz',
        };
    }

    return {
        title: `${doc.title} - Raíz`,
        description: doc.lead,
        openGraph: {
            title: doc.title,
            description: doc.lead,
            images: doc.mainImage ? [doc.mainImage] : [],
            type: 'article',
            authors: [doc.author || 'Raíz'],
            publishedTime: doc.publishedAt,
        },
    };
}

export default async function Page({ params }: { params: { slug: string } }) {
    const { slug } = params;

    // Hybrid Logic:
    // 1. Check if slug is a numeric ID (Legacy / Python DB)
    if (/^\d+$/.test(slug)) {
        return <ArticleDetailView articleId={parseInt(slug)} />;
    }

    // 2. Fetch from Sanity (Headless CMS)
    const doc = await client.fetch(ARTICLE_QUERY, { slug });

    if (!doc) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Artículo no encontrado</h1>
                    <p className="text-gray-600">Lo sentimos, no pudimos encontrar la noticia "{slug}".</p>
                    <a href="/" className="mt-4 inline-block text-green-600 hover:underline">Volver al inicio</a>
                </div>
            </div>
        );
    }

    // Map Sanity Doc to Article Model
    const article: Article = {
        id: doc._id,
        title: doc.title,
        summary: doc.lead,
        content: doc.body ? 'Contenido completo en desarrollo (PortableText)' : doc.lead, // Temp placeholder for body
        status: 'published',
        source: 'Raíz', // First-party content
        url: doc.slug,
        published_at: doc.publishedAt,
        author: doc.author,
        main_image: doc.mainImage,
        created_at: doc.publishedAt || new Date().toISOString()
    };

    return <ArticleDetailView article={article} />;
}
