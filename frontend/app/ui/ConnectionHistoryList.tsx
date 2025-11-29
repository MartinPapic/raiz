import React from 'react';

interface FeedHistoryItem {
    id: number;
    source_name: string;
    status: string;
    articles_count: number;
    fetched_at: string;
    details?: string;
}

interface ConnectionHistoryListProps {
    history: FeedHistoryItem[];
}

export default function ConnectionHistoryList({ history }: ConnectionHistoryListProps) {
    if (history.length === 0) return null;

    return (
        <div className="mt-6 pt-4 border-t dark:border-gray-700">
            <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                📜 Historial de Conexiones
            </h4>
            <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left">
                    <thead>
                        <tr className="border-b dark:border-gray-700">
                            <th className="py-2 font-medium text-gray-500">Fuente</th>
                            <th className="py-2 font-medium text-gray-500">Fecha</th>
                            <th className="py-2 font-medium text-gray-500">Arts.</th>
                            <th className="py-2 font-medium text-gray-500">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {history.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="py-2 font-medium">{item.source_name}</td>
                                <td className="py-2 text-gray-500">
                                    {new Date(item.fetched_at).toLocaleString()}
                                </td>
                                <td className="py-2">{item.articles_count}</td>
                                <td className="py-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${item.status === 'success'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
