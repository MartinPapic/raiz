'use client';

import { Article } from '../model';
import ArticleCard from '../ui/ArticleCard';
import Link from 'next/link';

interface CuratorEditorViewProps {
    article: Article;

    // Form State
    title: string;
    setTitle: (value: string) => void;
    content: string;
    setContent: (value: string) => void;
    originalContent: string;
    tags: string;
    setTags: (value: string) => void;
    status: 'draft' | 'published' | 'archived';
    setStatus: (value: 'draft' | 'published' | 'archived') => void;

    // UI State
    isSaving: boolean;
    isRegenerating: boolean;
    isRefining: boolean;
    isScraping: boolean;
    isAuditing: boolean;
    isAddingToKB: boolean;
    auditReport: string | null;
    setAuditReport: (value: string | null) => void;
    showRefineMenu: boolean;
    setShowRefineMenu: (value: boolean) => void;
    customInstruction: string;
    setCustomInstruction: (value: string) => void;
    regenerateInstruction: string;
    setRegenerateInstruction: (value: string) => void;

    // Data
    knowledgeBaseSuggestions: any[];

    // Actions
    onSave: () => Promise<void>;
    onCancel: () => void;
    onRegenerate: () => Promise<void>;
    onRefine: (instruction: string) => Promise<void>;
    onScrape: () => Promise<void>;
    onAudit: () => Promise<void>;
    onRegenerateWithAudit: (report: string) => Promise<void>;
    onAddToKnowledgeBase: () => Promise<void>;
    onRecoverOriginal: () => void;
}

export default function CuratorEditorView({
    article,
    title, setTitle,
    content, setContent,
    originalContent,
    tags, setTags,
    status, setStatus,
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
    knowledgeBaseSuggestions,
    onSave,
    onCancel,
    onRegenerate,
    onRefine,
    onScrape,
    onAudit,
    onRegenerateWithAudit,
    onAddToKnowledgeBase,
    onRecoverOriginal
}: CuratorEditorViewProps) {

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
                        onClick={onSave}
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
                                onClick={onAudit}
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
                                                onClick={() => onRefine(option)}
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
                                                onKeyDown={(e) => e.key === 'Enter' && customInstruction && onRefine(customInstruction)}
                                            />
                                            <button
                                                onClick={() => customInstruction && onRefine(customInstruction)}
                                                className="w-full text-center text-xs bg-purple-600 text-white py-1 rounded hover:bg-purple-700"
                                            >
                                                Ir
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={onAddToKnowledgeBase}
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
                                        onClick={onRecoverOriginal}
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

                            {/* Regenerate Section */}
                            <div className="flex items-center gap-2 py-2">
                                <input
                                    type="text"
                                    placeholder="Instrucción para regenerar..."
                                    value={regenerateInstruction}
                                    onChange={(e) => setRegenerateInstruction(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                />
                                <button
                                    onClick={onRegenerate}
                                    disabled={isRegenerating}
                                    className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isRegenerating ? 'Regenerando...' : '↻ Regenerar'}
                                </button>
                            </div>

                            {/* Original Content (Collapsed or Secondary) */}
                            <div className="border-t pt-4 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Contenido Original (Referencia)</label>
                                    <button
                                        type="button"
                                        onClick={onScrape}
                                        disabled={isScraping}
                                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50"
                                    >
                                        {isScraping ? 'Descargando...' : '📥 Traer de URL'}
                                    </button>
                                </div>
                                <textarea
                                    value={originalContent}
                                    readOnly
                                    className="w-full h-96 px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500 font-mono text-xs bg-gray-50 dark:bg-gray-900/50 resize-none"
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
                                    onClick={() => onRegenerateWithAudit(auditReport)}
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
