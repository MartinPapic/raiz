'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import CuratorEditorView from '../../../views/CuratorEditorView';
import { articleRepository } from '../../../data/articleRepository';
import { Article } from '../../../model';

export default function CuratorEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Unwrap params using React.use()
    const { id } = use(params);
    const articleId = parseInt(id);

    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [kbSuggestions, setKbSuggestions] = useState<any[]>([]);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const token = localStorage.getItem('token') || '';
                // We need a way to get a single article. 
                // Assuming articleRepository.getById exists or we fetch all and find.
                // Since getById might not exist in the repo shown before, let's check.
                // If not, we might need to add it or fetch list. 
                // For now, let's assume we can fetch it or filter from list if needed.
                // Actually, let's try to fetch all and find, as a fallback if getById isn't there.
                // Ideally we should add getById to repository.

                // Let's assume we add getById to repository or use a direct fetch here for now.
                const response = await fetch(`http://localhost:8000/articles/${articleId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch article');
                const data = await response.json();
                setArticle(data);

                // Fetch suggestions
                if (data.tags) {
                    articleRepository.getSuggestions(data.tags, '', token)
                        .then(setKbSuggestions)
                        .catch(err => console.error('Error fetching suggestions:', err));
                }
            } catch (error) {
                console.error('Error loading article:', error);
                alert('Error cargando el artículo');
                router.push('/curator');
            } finally {
                setLoading(false);
            }
        };

        if (articleId) {
            fetchArticle();
        }
    }, [articleId, router]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando editor...</div>;
    }

    if (!article) {
        return <div className="flex justify-center items-center h-screen">Artículo no encontrado</div>;
    }

    const token = localStorage.getItem('token') || '';

    return (
        <CuratorEditorView
            article={article}
            onSave={async (updatedArticle) => {
                await articleRepository.update(updatedArticle, token);
                router.push('/curator');
            }}
            onCancel={() => router.push('/curator')}
            onRegenerate={async () => {
                return await articleRepository.regenerate(article.id, token);
            }}
            onRefine={async (instruction, content) => {
                return await articleRepository.refine(article.id, content, instruction, token);
            }}
            onScrape={async () => {
                return await articleRepository.scrape(article.id, token);
            }}
            onAudit={async () => {
                return await articleRepository.audit(article.id, token);
            }}
            onRegenerateWithAudit={async (report) => {
                const instruction = `Corrige el siguiente artículo basándote ESTRICTAMENTE en los errores detectados en este reporte de auditoría. Si el reporte dice "sin errores", mejora el estilo general.\n\nREPORTE DE AUDITORÍA:\n${report}`;
                return await articleRepository.refine(article.id, article.content || '', instruction, token);
            }}
            onAddToKnowledgeBase={async (content, tags) => {
                await articleRepository.addToKnowledgeBase(content, tags, article.id, token);
            }}
            knowledgeBaseSuggestions={kbSuggestions}
        />
    );
}
