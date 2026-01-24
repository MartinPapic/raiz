import { useState, useEffect } from 'react';
import { client } from '../../sanity/lib/client';
import { defineQuery } from 'next-sanity';
import { LayoutBlock } from '../lector/layout-editor/page';
import { Article } from '../model';

export function useLayoutViewModel() {
    const [readyArticles, setReadyArticles] = useState<Article[]>([]);
    const [blocks, setBlocks] = useState<LayoutBlock[]>([]);
    const [loading, setLoading] = useState(true);
    const [homepageId, setHomepageId] = useState<string | null>(null);

    // Queries
    // const READY_ARTICLES_QUERY = defineQuery(`*[_type == "article" && editorialStatus == "readyForLayout"]`);
    // NOTE: using 'published' for testing since we might not have readyForLayout articles yet
    const READY_ARTICLES_QUERY = defineQuery(`*[_type == "article"]`);

    const HOMEPAGE_QUERY = defineQuery(`*[_type == "homepage"][0]{
        ...,
        layout[]{
            ...,
            items[]->
        }
    }`);

    useEffect(() => {
        loadData();
    }, []);

    const mapSanityDocToArticle = (doc: any): Article => ({
        id: doc._id,
        title: doc.title,
        summary: doc.lead,
        source: 'Raíz',
        status: 'published',
        url: doc.slug?.current,
        published_at: doc.publishedAt,
        main_image: doc.mainImage?.asset?._ref ? doc.mainImage.asset._ref : doc.mainImage,
        author: doc.author,
        content: '', // Not needed for layout preview
        created_at: doc._createdAt || new Date().toISOString(),
        featured: doc.featured || false
    });

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Articles
            const articlesDoc = await client.fetch(READY_ARTICLES_QUERY);
            const mappedArticles: Article[] = articlesDoc.map(mapSanityDocToArticle);
            setReadyArticles(mappedArticles);

            // 2. Fetch Layout
            const homepageDoc = await client.fetch(HOMEPAGE_QUERY);
            if (homepageDoc) {
                setHomepageId(homepageDoc._id);
                // Map Sanity blocks to Editor blocks
                const mappedBlocks = (homepageDoc.layout || []).map((block: any) => ({
                    id: block._key,
                    type: block._type,
                    data: resolveBlockData(block)
                }));
                setBlocks(mappedBlocks);
            }

        } catch (error) {
            console.error("Error loading layout data", error);
        } finally {
            setLoading(false);
        }
    };

    const resolveBlockData = (block: any) => {
        // Map expanded Sanity items back to Article models
        if (block.items && Array.isArray(block.items)) {
            return {
                ...block,
                items: block.items.map((item: any) => item ? mapSanityDocToArticle(item) : null).filter(Boolean)
            };
        }
        return block;
    };

    const saveLayout = async (isActive: boolean = false) => {
        // Fallback to default ID if creating for the first time
        const targetId = homepageId || 'homepage-default';

        // Transform Editor Blocks back to Sanity Format
        // We need to ensure we keep the _key for stable updates
        const sanityLayout = blocks.map(block => {
            const blockData = { ...block.data };

            // Transform items array back to references
            if (blockData.items && Array.isArray(blockData.items)) {
                blockData.items = blockData.items.map((article: Article) => ({
                    _type: 'reference',
                    _ref: article.id,
                    _key: article.id // stable key helps sanity
                }));
            }

            // Transform single article to reference (for HeroBlock)
            if (blockData.article && blockData.article.id) {
                blockData.article = {
                    _type: 'reference',
                    _ref: blockData.article.id
                };
            }

            return {
                _type: block.type,
                _key: block.id,
                ...blockData
            };
        });

        try {
            await fetch('/api/sanity/save-layout', {
                method: 'POST',
                body: JSON.stringify({
                    id: targetId,
                    layout: sanityLayout,
                    isActive
                })
            });
            alert(isActive ? 'Portada Publicada Exitosamente' : 'Borrador Guardado');
        } catch (error) {
            alert('Error guardando layout');
        }
    };

    return {
        readyArticles,
        blocks,
        setBlocks,
        loading,
        saveLayout
    };
}
