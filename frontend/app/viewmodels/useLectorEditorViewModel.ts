import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { articleRepository } from '../data/articleRepository';
import { Article } from '../model';

export function useLectorEditorViewModel(articleId: string) {
    const router = useRouter();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [kbSuggestions, setKbSuggestions] = useState<any[]>([]);

    // Editor State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [originalContent, setOriginalContent] = useState('');
    const [tags, setTags] = useState('');
    const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');

    // UI State
    const [isSaving, setIsSaving] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [isScraping, setIsScraping] = useState(false);
    const [isAuditing, setIsAuditing] = useState(false);
    const [isAddingToKB, setIsAddingToKB] = useState(false);
    const [auditReport, setAuditReport] = useState<string | null>(null);
    const [showRefineMenu, setShowRefineMenu] = useState(false);
    const [customInstruction, setCustomInstruction] = useState('');
    const [regenerateInstruction, setRegenerateInstruction] = useState('');

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                // We don't need the Auth0 token for the internal Next.js API unless we implement specific protection.
                // For now, the middleware protects the page.
                const data = await articleRepository.getById(articleId, '');

                setArticle(data);
                setTitle(data.title);
                setContent(data.content || data.summary || '');
                setOriginalContent(data.original_content || '');
                setTags(data.tags || '');
                setStatus(data.status);

                // Fetch suggestions
                if (data.tags) {
                    articleRepository.getSuggestions(data.tags, '', '')
                        .then(setKbSuggestions)
                        .catch(err => console.error('Error fetching suggestions:', err));
                }
            } catch (error) {
                console.error('Error loading article:', error);
                alert('Error cargando el artículo');
                router.push('/lector');
            } finally {
                setLoading(false);
            }
        };

        if (articleId) {
            fetchArticle();
        }
    }, [articleId, router]);

    // Actions
    const handleSave = async () => {
        if (!article) return;
        setIsSaving(true);
        try {
            const newSummary = content.length > 200 ? content.substring(0, 200) + '...' : content;
            const updatedArticle = { ...article, title, content, summary: newSummary, tags, status };

            // Update directly to Sanity via Repository
            await articleRepository.update(updatedArticle, '');

            // No separate pushToSanity needed.

            router.push('/lector');
        } catch (error) {
            console.error('Error saving article:', error);
            alert('Error guardando el artículo');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.push('/lector');
    };

    const handleRegenerate = async () => {
        if (!article) return;
        if (!confirm('Esto reescribirá el título y el contenido usando IA. ¿Continuar?')) return;
        setIsRegenerating(true);
        try {
            const regenerated = await articleRepository.regenerate(article.id, '', regenerateInstruction);

            setTitle(regenerated.title);
            setContent(regenerated.content || regenerated.summary || '');
            setTags(regenerated.tags || '');
        } catch (error) {
            console.error('Error regenerating:', error);
            alert('Error regenerando el artículo');
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleRefine = async (instruction: string) => {
        if (!article) return;
        setIsRefining(true);
        try {
            const refinedContent = await articleRepository.refine(article.id, content, instruction, '');
            setContent(refinedContent);
            setShowRefineMenu(false);
            setCustomInstruction('');
        } catch (error) {
            console.error('Error refining:', error);
            alert('Error refinando el contenido');
        } finally {
            setIsRefining(false);
        }
    };

    const handleScrape = async () => {
        if (!article) return;
        if (!confirm('Esto reemplazará el contenido actual con el texto original. ¿Continuar?')) return;
        setIsScraping(true);
        try {
            const scraped = await articleRepository.scrape(article.id, '');
            setOriginalContent(scraped.original_content || '');
        } catch (error) {
            console.error('Error scraping:', error);
            alert('Error recuperando texto original');
        } finally {
            setIsScraping(false);
        }
    };

    const handleAudit = async () => {
        if (!article) return;
        setIsAuditing(true);
        try {
            const report = await articleRepository.audit(article.id, '');
            setAuditReport(report);
        } catch (error) {
            console.error('Error auditing:', error);
            alert('Error auditando el artículo');
        } finally {
            setIsAuditing(false);
        }
    };

    const handleRegenerateWithAudit = async (report: string) => {
        if (!article) return;
        setIsRefining(true);
        try {
            const instruction = `Corrige el siguiente artículo basándote ESTRICTAMENTE en los errores detectados en este reporte de auditoría. Si el reporte dice "sin errores", mejora el estilo general.\n\nREPORTE DE AUDITORÍA:\n${report}`;
            const refinedContent = await articleRepository.refine(article.id, content, instruction, '');
            setContent(refinedContent);
        } catch (error) {
            console.error('Error refining with audit:', error);
            alert('Error aplicando correcciones');
        } finally {
            setIsRefining(false);
        }
    };

    const handleAddToKB = async () => {
        // Deprecated or requires number ID
        // await articleRepository.addToKnowledgeBase(content, tags, article.id as number, '');
        alert('Función temporalmente desactivada durante migración a Sanity');
    };

    const handleRecoverOriginal = () => {
        if (originalContent) {
            if (confirm('¿Estás seguro de que quieres reemplazar tu borrador con el texto original?')) {
                setContent(originalContent);
            }
        } else {
            alert('No hay contenido original disponible para recuperar.');
        }
    };

    // Preview Article Object
    const previewArticle: Article | null = article ? {
        ...article,
        title,
        content,
        summary: content.length > 200 ? content.substring(0, 200) + '...' : content,
        tags,
        status
    } : null;

    return {
        article: previewArticle,
        loading,
        kbSuggestions,

        // Form State
        title, setTitle,
        content, setContent,
        originalContent, setOriginalContent,
        tags, setTags,
        status, setStatus,

        // UI State
        isSaving,
        isRegenerating,
        isRefining,
        isScraping,
        isAuditing,
        isAddingToKB,
        auditReport, setAuditReport,
        showRefineMenu, setShowRefineMenu,
        customInstruction, setCustomInstruction,
        regenerateInstruction, setRegenerateInstruction,

        // Actions
        handleSave,
        handleCancel,
        handleRegenerate,
        handleRefine,
        handleScrape,
        handleAudit,
        handleRegenerateWithAudit,
        handleAddToKB,
        handleRecoverOriginal
    };
}
