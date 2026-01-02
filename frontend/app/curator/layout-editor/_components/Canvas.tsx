'use client';

import { useDroppable } from '@dnd-kit/core';
import RGL from 'react-grid-layout';
import { LayoutBlock } from '../page';
import HeroBlock from '../../../ui/blocks/HeroBlock';
import GridBlock from '../../../ui/blocks/GridBlock';
import ListBlock from '../../../ui/blocks/ListBlock';
import OpinionBlock from '../../../ui/blocks/OpinionBlock';
import TickerBlock from '../../../ui/blocks/TickerBlock';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useEffect, useState, useRef } from 'react';

// @ts-ignore - WidthProvider is a default export pattern
const GridLayout = RGL;

// Layout item interface matching react-grid-layout
interface LayoutItem {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minH?: number;
    minW?: number;
}

interface CanvasProps {
    blocks: LayoutBlock[];
    onSelectBlock: (id: string | null) => void;
    selectedBlockId: string | null;
    onLayoutChange?: (layout: LayoutItem[]) => void;
}

// Default layout configurations for different block types
const getDefaultLayout = (block: LayoutBlock, index: number): LayoutItem => {
    switch (block.type) {
        case 'heroBlock':
            return { i: block.id, x: 0, y: index * 4, w: 12, h: 4, minH: 3, minW: 6 };
        case 'gridBlock':
            return { i: block.id, x: 0, y: index * 3, w: 12, h: 3, minH: 2, minW: 4 };
        case 'listBlock':
            return { i: block.id, x: 0, y: index * 2, w: 6, h: 4, minH: 2, minW: 3 };
        default:
            return { i: block.id, x: 0, y: index * 2, w: 6, h: 2, minH: 1, minW: 2 };
    }
};

export default function Canvas({ blocks, onSelectBlock, selectedBlockId, onLayoutChange }: CanvasProps) {
    const { setNodeRef: setDroppableRef } = useDroppable({
        id: 'canvas',
    });

    // Custom Width Provider Logic
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(1240);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                // Subtracting padding (approx 32px-64px depending on breakpoint)
                // Using contentBoxSize or clientWidth
                const newWidth = entry.contentRect.width;
                // Adjust for padding if measuring the wrapper that includes padding
                // The wrapper has p-4 sm:px-6 lg:px-8
                // But contentRect of the wrapper *excludes* padding? No, contentRect corresponds to width.
                // Wait, if I attach ref to the OUTER div, contentRect should be the inner width?
                // Let's rely on clientWidth of the container minus padding calculation or just Ref the inner part?
                // Simpler: Ref the div that WRAPS the Display, OR just take the width and subtract manually.
                // Let's use `entry.contentRect.width` which corresponds to the content box.
                if (newWidth > 0 && Math.abs(newWidth - width) > 10) {
                    setWidth(newWidth - 2); // Small buffer
                }
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    // Compose refs
    const setRefs = (element: HTMLElement | null) => {
        setDroppableRef(element);
        // @ts-ignore
        containerRef.current = element;
    };


    // Generate layout from blocks
    const layout: LayoutItem[] = blocks.map((block, index) => {
        // Use stored layout if available, otherwise generate default
        if (block.data?.layout) {
            return { i: block.id, ...block.data.layout };
        }
        return getDefaultLayout(block, index);
    });

    const handleLayoutChange = (newLayout: LayoutItem[]) => {
        if (onLayoutChange) {
            onLayoutChange(newLayout);
        }
    };

    return (
        <div
            ref={setRefs}
            className="min-h-[800px] w-full max-w-7xl mx-auto bg-gray-50 dark:bg-black shadow-lg rounded-lg border border-gray-200 dark:border-gray-800 p-4 sm:px-6 lg:px-8 py-10"
            onClick={() => onSelectBlock(null)}
        >
            {/* STATIC HEADER MOCKUP (Non-Editable Context) */}
            <div className="opacity-75 pointer-events-none select-none mb-12 space-y-10 border-b border-dashed border-gray-300 pb-8">
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                        Raíz — Comunicación Sostenible para Latinoamérica
                    </h1>
                    <p className="max-w-3xl text-lg text-gray-600 dark:text-gray-300">
                        Noticias y análisis sobre sostenibilidad, curadas por personas y
                        asistidas por inteligencia artificial responsable.
                    </p>
                </div>
                <div className="w-full h-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center px-4 text-gray-400">
                    🔍 Buscar...
                </div>
            </div>

            {blocks.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                    <p className="text-lg">📰 El lienzo está vacío</p>
                    <p className="text-sm mt-2">Arrastra artículos desde el pool izquierdo</p>
                </div>
            )}

            {blocks.length > 0 && mounted && (
                <GridLayout
                    className="layout"
                    layout={layout}
                    cols={12}
                    rowHeight={60}
                    width={width}
                    // @ts-ignore - Layout type mismatch between versions
                    onLayoutChange={handleLayoutChange}
                    draggableHandle=".drag-handle"
                    isResizable={true}
                    isDraggable={true}
                    compactType="vertical"
                    preventCollision={false}
                >
                    {blocks.map(block => {
                        const isSelected = block.id === selectedBlockId;
                        const Component = resolveBlockComponent(block.type);

                        return (
                            <div
                                key={block.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectBlock(block.id);
                                }}
                                className={`relative transition-all duration-200 border-2 rounded-lg overflow-hidden bg-white dark:bg-gray-900 ${isSelected
                                    ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-lg'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                                    }`}
                            >
                                {/* Drag Handle */}
                                <div className="drag-handle absolute top-0 left-0 right-0 h-6 bg-gray-100 dark:bg-gray-800 flex items-center justify-center cursor-move border-b border-gray-200 dark:border-gray-700 z-10">
                                    <span className="text-xs text-gray-500">⋮⋮ {block.type.replace('Block', '')}</span>
                                </div>

                                {/* Block Content */}
                                <div className="pt-6 h-full overflow-auto">
                                    <Component data={block.data} />
                                </div>

                                {/* Resize indicator */}
                                {isSelected && (
                                    <div className="absolute bottom-1 right-1 text-xs text-blue-500 bg-white/80 px-1 rounded">
                                        ↘ resize
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </GridLayout>
            )}
        </div>
    );
}

function resolveBlockComponent(type: string) {
    switch (type) {
        case 'heroBlock': return HeroBlock;
        case 'gridBlock': return GridBlock;
        case 'listBlock': return ListBlock;
        case 'opinionBlock': return OpinionBlock;
        case 'tickerBlock': return TickerBlock;
        default: return () => <div className="p-4 text-gray-400">Unknown Block Type</div>;
    }
}

