import React from 'react';
import { Source } from '../data/sourceRepository';

interface SuccessfulSourceListProps {
    sources: Source[];
    onSelectSource: (url: string, name: string) => void;
}

export default function SuccessfulSourceList({ sources, onSelectSource }: SuccessfulSourceListProps) {
    if (sources.length === 0) return null;

    return (
        <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                ✨ Conexiones Exitosas Recientes
            </h4>
            <div className="flex flex-wrap gap-2">
                {sources.map((source) => (
                    <button
                        key={source.id}
                        onClick={() => onSelectSource(source.feed_url, source.name)}
                        className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-md hover:bg-green-100 transition-colors dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                        title={source.url}
                    >
                        {source.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
