'use client';

import { useState, useEffect } from 'react';
import { Article } from '../model';
import ArticleCard from '../ui/ArticleCard';
import Link from 'next/link';

interface CuratorEditorViewProps {
    article: Article;
    onSave: (article: Article) => Promise<void>;
    onCancel: () => void;
    onRegenerate: () => Promise<Article>;
    onRefine: (instruction: string, currentContent: string) => Promise<string>;
    onScrape: () => Promise<Article>;
    onAudit: () => Promise<string>;
    onRegenerateWithAudit: (report: string) => Promise<string>;
    onAddToKnowledgeBase: (content: string, tags: string) => Promise<void>;
    knowledgeBaseSuggestions: any[];
}

export default function CuratorEditorView({
    article: initialArticle,
    onSave,
    onCancel,
    onRegenerate,
    onRefine,
    onScrape,
    onAudit,
    onRegenerateWithAudit,
    onAddToKnowledgeBase,
    knowledgeBaseSuggestions,
}: CuratorEditorViewProps) {
    // Local state for the article being edited
    const [article, setArticle] = useState<Article>(initialArticle);

    // Form states
    const [title, setTitle] = useState(initialArticle.title);
    const [content, setContent] = useState(initialArticle.content || initialArticle.summary || '');
    const [originalContent, setOriginalContent] = useState(initialArticle.original_content || '');
    const [tags, setTags] = useState(initialArticle.tags || '');
    const [status, setStatus] = useState(initialArticle.status);

    // UI states
    const [isSaving, setIsSaving] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [isScraping, setIsScraping] = useState(false);
    const [isAuditing, setIsAuditing] = useState(false);
    const [isAddingToKB, setIsAddingToKB] = useState(false);
    const [auditReport, setAuditReport] = useState<string | null>(null);
    const [showRefineMenu, setShowRefineMenu] = useState(false);
    const [customInstruction, setCustomInstruction] = useState('');

    // Sync local state with prop updates (e.g. if parent refetches)
    useEffect(() => {
        setArticle(initialArticle);
        setTitle(initialArticle.title);
        setContent(initialArticle.content || initialArticle.summary || '');
        setOriginalContent(initialArticle.original_content || '');
        setTags(initialArticle.tags || '');
        setStatus(initialArticle.status);
    }, [initialArticle]);

    // Update the preview article object whenever form fields change
    useEffect(() => {
        setArticle(prev => ({
            ...prev,
            title,
            content,
            summary: content.length > 200 ? content.substring(0, 200) + '...' : content,
            tags,
            status
        }));
    }, [title, content, tags, status]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const newSummary = content.length > 200 ? content.substring(0, 200) + '...' : content;
            const updatedArticle = { ...article, title, content, summary: newSummary, tags, status };
            await onSave(updatedArticle);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRegenerate = async () => {
        if (!confirm('Esto reescribirá el título y el contenido usando IA. ¿Continuar?')) return;
        setIsRegenerating(true);
        try {
            const regenerated = await onRegenerate();
            // Update local state with new data
            setTitle(regenerated.title);
            setContent(regenerated.content || regenerated.summary || '');
            setTags(regenerated.tags || '');
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleRefine = async (instruction: string) => {
        setIsRefining(true);
        try {
            const refinedContent = await onRefine(instruction, content);
            setContent(refinedContent);
            setShowRefineMenu(false);
            setCustomInstruction('');
        } finally {
            setIsRefining(false);
        }
    };

    const handleScrape = async () => {
        if (!confirm('Esto reemplazará el contenido actual con el texto original. ¿Continuar?')) return;
        setIsScraping(true);
        try {
            const scraped = await onScrape();
            setOriginalContent(scraped.original_content || '');
            // Optionally update content too if that's desired behavior, 
            // but usually we just want to have the original available for reference
        } finally {
            setIsScraping(false);
        }
    };

    const handleAudit = async () => {
        setIsAuditing(true);
        try {
            const report = await onAudit();
            setAuditReport(report);
        } finally {
            setIsAuditing(false);
        }
    };

    const handleRegenerateWithAudit = async (report: string) => {
        setIsRefining(true);
        try {
            const refinedContent = await onRegenerateWithAudit(report);
            setContent(refinedContent);
        } finally {
            setIsRefining(false);
        }
    };

    const handleAddToKB = async () => {
        setIsAddingToKB(true);
        try {
            await onAddToKnowledgeBase(content, tags);
            alert('Añadido a la base de conocimientos correctamente');
        } catch (error) {
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

    const refineOptions = [
        "Corregir gramática y estilo",
        "Hacer más conciso",
        "Tono más formal",
        "Simplificar lenguaje"
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/curator" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        &larr; Volver al Panel
                    </Link>
                    <h1 className="text-xl font-bold dark:text-white">Editor de Publicación</h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Column: Editor Form */}
                <div className="w-1/2 p-6 overflow-y-auto border-r dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="space-y-6 max-w-2xl mx-auto">

                        {/* AI Tools Toolbar */}
                        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <button
                                onClick={handleAudit}
                                disabled={isAuditing}
                                className="px-3 py-1 text-sm bg-red-100 text-red-800 border border-red-200 rounded hover:bg-red-200 disabled:opacity-50 flex items-center gap-1 font-bold"
                            >
                                {isAuditing ? 'Auditando...' : '🕵️ AUDITAR'}
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setShowRefineMenu(!showRefineMenu)}
                                    disabled={isRefining}
                                    className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50 flex items-center gap-1"
                                >
                                    {isRefining ? 'Refinando...' : '✨ Refinar'}
                                </button>
                                {showRefineMenu && (
                                    <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20 border dark:border-gray-600 p-2">
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
                                                placeholder="Instrucción..."
                                                value={customInstruction}
                                                onChange={(e) => setCustomInstruction(e.target.value)}
                                                className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white mb-1"
                                                onKeyDown={(e) => e.key === 'Enter' && customInstruction && handleRefine(customInstruction)}
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
                                onClick={handleRegenerate}
                                disabled={isRegenerating}
                                className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50"
                            >
                                {isRegenerating ? 'Regenerando...' : '↻ Regenerar'}
                            </button>

                            <button
                                onClick={handleAddToKB}
                                disabled={isAddingToKB}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50"
                            >
                                {isAddingToKB ? '...' : '📚 Agregar a KB'}
                            </button>
                        </div>

                        {/* Main Fields */}
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Título</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white text-lg font-semibold"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Tags</label>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="ej: política, economía"
                                className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                        </div>

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

                        {/* Content Editors */}
                        <div className="grid grid-cols-1 gap-4">
                            {/* Draft Content */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium dark:text-gray-300">Contenido (Borrador)</label>
                                    <button
                                        type="button"
                                        onClick={handleRecoverOriginal}
                                        disabled={!originalContent}
                                        className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                                    >
                                        ↺ Recuperar Original
                                    </button>
                                </div>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-96 px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm resize-none"
                                />
                            </div>

                            {/* Original Content (Collapsed or Secondary) */}
                            <div className="border-t pt-4 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Contenido Original (Referencia)</label>
                                    <button
                                        type="button"
                                        onClick={handleScrape}
                                        disabled={isScraping}
                                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
                                    >
                                        {isScraping ? 'Descargando...' : '📥 Traer de URL'}
                                    </button>
                                </div>
                                <textarea
                                    value={originalContent}
                                    readOnly
                                    className="w-full h-32 px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500 font-mono text-xs bg-gray-50 dark:bg-gray-900/50 resize-none"
                                />
                            </div>
                        </div>

                        {/* Audit Report */}
                        {auditReport && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-red-700 dark:text-red-400">Reporte de Auditoría</h3>
                                    <button onClick={() => setAuditReport(null)} className="text-xs text-red-500 hover:text-red-700">✕ Cerrar</button>
                                </div>
                                <div className="text-xs font-mono whitespace-pre-wrap mb-3 dark:text-red-200">{auditReport}</div>
                                <button
                                    onClick={() => handleRegenerateWithAudit(auditReport)}
                                    className="w-full py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                >
                                    Aplicar Correcciones
                                </button>
                            </div>
                        )}

                        {/* KB Suggestions */}
                        {knowledgeBaseSuggestions.length > 0 && (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <h3 className="font-bold text-yellow-800 dark:text-yellow-400 mb-2">Sugerencias KB</h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {knowledgeBaseSuggestions.map((item) => (
                                        <div key={item.id} className="text-xs p-2 bg-white dark:bg-gray-800 rounded border dark:border-gray-700">
                                            <div className="font-semibold mb-1">{item.tags}</div>
                                            <div className="line-clamp-2">{item.content}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Live Preview */}
                <div className="w-1/2 bg-gray-100 dark:bg-gray-900 p-8 overflow-y-auto flex flex-col items-center">
                    <h2 className="text-lg font-semibold text-gray-500 mb-4 uppercase tracking-wider">Vista Previa (En Vivo)</h2>

                    {/* Card Preview */}
                    <div className="w-full max-w-md mb-8">
                        <div className="text-xs text-gray-400 mb-2 text-center">Así se verá en la lista:</div>
                        <ArticleCard article={article} showEditButton={false} />
                    </div>

                    {/* Detail Preview (Simulated) */}
                    <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 min-h-[500px]">
                        <div className="text-xs text-gray-400 mb-6 text-center border-b pb-2">Así se verá el detalle del artículo:</div>

                        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">{article.title}</h1>

                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
                            <span className="font-semibold text-green-600 dark:text-green-400 uppercase">{article.source}</span>
                            <span>•</span>
                            <span>{new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>

                        <div className="prose dark:prose-invert max-w-none">
                            <div className="whitespace-pre-wrap">{article.content}</div>
                        </div>

                        {article.tags && (
                            <div className="mt-8 pt-4 border-t dark:border-gray-700">
                                <div className="flex flex-wrap gap-2">
                                    {article.tags.split(',').map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
