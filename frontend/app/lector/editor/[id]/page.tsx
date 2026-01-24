'use client';

import { use } from 'react';
import LectorEditorView from '../../../views/LectorEditorView';
import { useLectorEditorViewModel } from '../../../viewmodels/useLectorEditorViewModel';

export default function LectorEditorPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params);
    const articleId = id;

    const viewModel = useLectorEditorViewModel(articleId);

    if (viewModel.loading) {
        return <div className="flex justify-center items-center h-screen">Cargando editor...</div>;
    }

    if (!viewModel.article) {
        return <div className="flex justify-center items-center h-screen">Artículo no encontrado</div>;
    }

    return (
        <LectorEditorView
            // Pass the entire ViewModel as props or destructure
            // Destructuring is cleaner for the View interface
            article={viewModel.article}

            // Form State
            title={viewModel.title}
            setTitle={viewModel.setTitle}
            content={viewModel.content}
            setContent={viewModel.setContent}
            originalContent={viewModel.originalContent}
            tags={viewModel.tags}
            setTags={viewModel.setTags}
            status={viewModel.status}
            setStatus={viewModel.setStatus}

            // UI State
            isSaving={viewModel.isSaving}
            isRegenerating={viewModel.isRegenerating}
            isRefining={viewModel.isRefining}
            isScraping={viewModel.isScraping}
            isAuditing={viewModel.isAuditing}
            isAddingToKB={viewModel.isAddingToKB}
            auditReport={viewModel.auditReport}
            setAuditReport={viewModel.setAuditReport}
            showRefineMenu={viewModel.showRefineMenu}
            setShowRefineMenu={viewModel.setShowRefineMenu}
            customInstruction={viewModel.customInstruction}
            setCustomInstruction={viewModel.setCustomInstruction}
            regenerateInstruction={viewModel.regenerateInstruction}
            setRegenerateInstruction={viewModel.setRegenerateInstruction}

            // Data
            knowledgeBaseSuggestions={viewModel.kbSuggestions}

            // Actions
            onSave={viewModel.handleSave}
            onCancel={viewModel.handleCancel}
            onRegenerate={viewModel.handleRegenerate}
            onRefine={viewModel.handleRefine}
            onScrape={viewModel.handleScrape}
            onAudit={viewModel.handleAudit}
            onRegenerateWithAudit={viewModel.handleRegenerateWithAudit}
            onAddToKnowledgeBase={viewModel.handleAddToKB}
            onRecoverOriginal={viewModel.handleRecoverOriginal}
        />
    );
}
