'use client';

import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';
import { useAuthViewModel } from '../../viewmodels/useAuthViewModel';
import { useLayoutViewModel } from '../../viewmodels/useLayoutViewModel';
import Navbar from '../../ui/Navbar';
import ArticlePool from './_components/ArticlePool';
import Canvas from './_components/Canvas';
import Properties from './_components/Properties';
import { Article } from '../../model';
import { client } from '../../../sanity/lib/client';

export type LayoutBlock = {
    id: string;
    type: 'heroBlock' | 'gridBlock' | 'listBlock';
    data: any; // Block specific data
};

export default function LayoutEditorPage() {
    const { user, logout } = useAuthViewModel();
    const { readyArticles, blocks, setBlocks, loading, saveLayout } = useLayoutViewModel();

    const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveBlockId(active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        console.log('DragEnd:', {
            activeId: active.id,
            activeType: active.data.current?.type,
            overId: over?.id
        });

        setActiveBlockId(null);

        if (!over) return;

        // Handling dropping an Article onto the Canvas (creating a new block)
        if (active.data.current?.type === 'article' && over.id === 'canvas') {
            const newBlock: LayoutBlock = {
                id: Math.random().toString(36).substr(2, 9),
                type: 'heroBlock', // Default to Hero
                data: {
                    article: active.data.current.article
                }
            };
            setBlocks([...blocks, newBlock]);
            return;
        }

        if (active.id !== over.id) {
            setBlocks((items: LayoutBlock[]) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    if (!user || user.role !== 'admin') {
        // Protected Route
        return <div className="p-8 text-center text-red-500">Acceso denegado</div>;
    }

    if (loading) return <div className="p-8 text-center">Cargando editor...</div>;

    return (
        <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
            <Navbar user={user} onLogout={logout} isCuratorMode={true} onToggleCuratorMode={() => { }} />
            <div className="bg-white border-b px-4 py-2 flex justify-end gap-2">
                <button onClick={() => saveLayout(false)} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 border dark:border-gray-600">
                    Guardar Borrador
                </button>
                <button onClick={() => saveLayout(true)} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 shadow-sm">
                    Publicar Portada
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    {/* Left Sidebar: Article Pool */}
                    <div className="w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
                        <ArticlePool articles={readyArticles} />
                    </div>

                    {/* Center: Canvas */}
                    <div className="flex-1 p-8 overflow-y-auto bg-gray-200 dark:bg-gray-900 border-l border-r dark:border-gray-700">
                        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                            <Canvas
                                blocks={blocks}
                                onSelectBlock={setSelectedBlockId}
                                selectedBlockId={selectedBlockId}
                                onLayoutChange={(newLayout) => {
                                    // Update blocks with new layout info
                                    setBlocks((prevBlocks: LayoutBlock[]) =>
                                        prevBlocks.map(block => {
                                            const layoutItem = newLayout.find((l: any) => l.i === block.id);
                                            if (layoutItem) {
                                                return {
                                                    ...block,
                                                    data: {
                                                        ...block.data,
                                                        layout: { x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h }
                                                    }
                                                };
                                            }
                                            return block;
                                        })
                                    );
                                }}
                            />
                        </SortableContext>
                    </div>

                    {/* Right Sidebar: Properties */}
                    <div className="w-80 bg-white dark:bg-gray-800 border-l dark:border-gray-700 p-4">
                        <Properties
                            block={blocks.find(b => b.id === selectedBlockId)}
                            onUpdate={(id: string, data: any) => {
                                setBlocks((bs: LayoutBlock[]) => bs.map(b => b.id === id ? { ...b, data } : b));
                            }}
                        />
                    </div>

                    <DragOverlay>
                        {/* Simple Drag Preview */}
                        {activeBlockId && activeBlockId.startsWith('article-') ? (
                            <div className="p-3 bg-white dark:bg-gray-700 rounded shadow-lg border border-blue-500 w-64">
                                Arrastrando Artículo...
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </main>
    );
}
