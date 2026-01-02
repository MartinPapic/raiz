'use client';

import { useState, useEffect } from 'react';
import { Article } from '../model';

interface ArticleEditorModalProps {
    article: Article;
    onSave: (article: Article) => void;
    onCancel: () => void;
    onRegenerate: () => Promise<void>;
    onRefine: (instruction: string, currentContent: string) => Promise<void>;
    onScrape: () => Promise<void>;
    onAudit: () => Promise<void>;
    onRegenerateWithAudit: (report: string) => Promise<void>;
    onAddToKnowledgeBase: (content: string, tags: string) => Promise<void>;
    knowledgeBaseSuggestions: any[];
    isRegenerating: boolean;
    isRefining: boolean;
    isSaving: boolean;
    isAuditing: boolean;
    auditReport: string | null;
    onClearAudit: () => void;
}

export default function ArticleEditorModal({
    article,
    onSave,
    onCancel,
    onRegenerate,
    onRefine,
    onScrape,
    onAudit,
    onRegenerateWithAudit,
    onAddToKnowledgeBase,
    knowledgeBaseSuggestions,
    isRegenerating,
    isRefining,
    isSaving,
    isAuditing,
    auditReport,
    onClearAudit
}: ArticleEditorModalProps) {
    const [title, setTitle] = useState(article.title);
    const [content, setContent] = useState(article.content || ''); // Prefer raw content
    const [summary, setSummary] = useState(article.summary || '');
    const [slug, setSlug] = useState(article.url || '');
    const [featured, setFeatured] = useState(article.featured || false);
    const [originalContent, setOriginalContent] = useState(article.original_content || '');
    const [tags, setTags] = useState(article.tags || '');
    const [status, setStatus] = useState(article.status);
    const [showRefineMenu, setShowRefineMenu] = useState(false);
    const [customInstruction, setCustomInstruction] = useState('');
    const [isScraping, setIsScraping] = useState(false);
    const [isAddingToKB, setIsAddingToKB] = useState(false);

    const refineOptions = [
        "Corregir gramática y estilo",
        "Hacer más conciso",
        "Tono más formal",
        "Simplificar lenguaje"
    ];

    const handleRefine = async (instruction: string) => {
        await onRefine(instruction, content);
        setShowRefineMenu(false);
        setCustomInstruction('');
    };

    const handleScrape = async () => {
        setIsScraping(true);
        try {
            await onScrape();
        } finally {
            setIsScraping(false);
        }
    };

    // Update local state if article prop changes (e.g. after regeneration)
    useEffect(() => {
        setTitle(article.title);
        setContent(article.content || '');
        setSummary(article.summary || '');
        setSlug(article.url || '');
        setFeatured(article.featured || false);
        setOriginalContent(article.original_content || '');
        setTags(article.tags || '');
        setStatus(article.status);
    }, [article]);

    const handleSave = () => {
        onSave({
            ...article,
            title,
            content,
            summary,
            url: slug,
            featured,
            tags,
            status
        });
    };

    const handleAddToKB = async () => {
        setIsAddingToKB(true);
        try {
            await onAddToKnowledgeBase(content, tags);
            alert('Añadido a la base de conocimientos correctamente');
        } catch (error) {
            console.error('Error adding to KB:', error);
            alert('Error al añadir a la base de conocimientos');
        } finally {
            setIsAddingToKB(false);
        }
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
    // Debug log
    useEffect(() => {
        console.log('ArticleEditorModal mounted');
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full h-[90vh] flex flex-col p-6 relative transition-all duration-300 overflow-y-auto ${auditReport ? 'max-w-[95vw]' : 'max-w-6xl'}`}>

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold dark:text-white">Editar Artículo</h2>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onAudit}
                            disabled={isAuditing}
                            className="px-3 py-1 text-sm bg-red-100 text-red-800 border border-red-200 rounded hover:bg-red-200 disabled:opacity-50 flex items-center gap-1 font-bold"
                        >
                            {isAuditing ? 'Auditando...' : '🕵️ AUDITAR (BETA)'}
                        </button>

                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowRefineMenu(!showRefineMenu)}
                                disabled={isRefining}
                                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50 flex items-center gap-1"
                            >
                                {isRefining ? 'Refinando...' : '✨ Refinar'}
                            </button>

                            {showRefineMenu && (
                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border dark:border-gray-600 p-2">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">Sugerencias</div>
                                    {refineOptions.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => handleRefine(option)}
                                            className="block w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                                        >
                                            {option}
                                        </button>
                                    ))}
                                    <div className="border-t dark:border-gray-600 my-2"></div>
                                    <div className="px-2">
                                        <input
                                            type="text"
                                            placeholder="Instrucción personalizada..."
                                            value={customInstruction}
                                            onChange={(e) => setCustomInstruction(e.target.value)}
                                            className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white mb-1"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && customInstruction) {
                                                    handleRefine(customInstruction);
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={() => customInstruction && handleRefine(customInstruction)}
                                            className="w-full text-center text-xs bg-purple-600 text-white py-1 rounded hover:bg-purple-700"
                                        >
                                            Ir
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onRegenerate}
                            disabled={isRegenerating}
                            className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50"
                        >
                            {isRegenerating ? 'Regenerando...' : '↻ Regenerar con IA'}
                        </button>
                    </div>
                </div>

                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Slug (URL)</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="ej: mi-articulo-titulo"
                            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Bajada / Resumen (Lead)</label>
                    <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white resize-none"
                    />
                </div>

                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-gray-300">Estado</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        >
                            <option value="draft">Borrador (Draft)</option>
                            <option value="published">Validado</option>
                            <option value="archived">Archivado (Archived)</option>
                        </select>
                    </div>
                    <div className="flex items-end mb-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={featured}
                                onChange={(e) => setFeatured(e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="text-sm font-medium dark:text-gray-300">Destacado de Portada (Hero)</span>
                        </label>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tags (separados por coma)</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="ej: política, economía, internacional"
                            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                        <button
                            type="button"
                            onClick={handleAddToKB}
                            disabled={isAddingToKB}
                            className="px-3 py-2 text-sm bg-blue-100 text-blue-800 border border-blue-200 rounded hover:bg-blue-200 disabled:opacity-50 whitespace-nowrap"
                            title="Agregar contenido y tags a la Base de Conocimientos"
                        >
                            {isAddingToKB ? '...' : '📚 Agregar a KB'}
                        </button>
                    </div>
                </div>

                {/* Knowledge Base Suggestions */}
                {knowledgeBaseSuggestions.length > 0 && (
                    <div className="mb-6 border-t pt-4 dark:border-gray-700">
                        <h3 className="text-md font-bold mb-2 dark:text-white">💡 Sugerencias de la Base de Conocimientos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                            {knowledgeBaseSuggestions.map((item) => (
                                <div key={item.id} className="p-3 border rounded bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800/50 text-sm">
                                    <div className="font-bold text-xs text-gray-500 dark:text-gray-400 mb-1">Tags: {item.tags}</div>
                                    <div className="line-clamp-3 dark:text-gray-300">{item.content}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2 mt-auto">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}
