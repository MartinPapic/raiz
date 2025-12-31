'use client';

import { useState } from 'react';
import { useSourceViewModel } from '../viewmodels/useSourceViewModel';

export default function SourceList() {
    const { sources, loading, addSource, deleteSource } = useSourceViewModel();
    const [newSource, setNewSource] = useState({ name: '', url: '', feed_url: '', type: 'rss' as 'rss' | 'scraping' });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await addSource(newSource);
        if (success) {
            setNewSource({ name: '', url: '', feed_url: '', type: 'rss' });
        } else {
            alert('Error adding source');
        }
    };

    return (
        <div className="mt-4 border-t pt-4 dark:border-gray-700">
            {/* Scrapings Conocidos Section */}
            <div className="mb-6">
                <h4 className="font-medium mb-2 text-blue-600 dark:text-blue-400">Scrapings Conocidos</h4>
                <ul className="space-y-2 mb-4">
                    {sources.filter(s => s.type === 'scraping').map(source => (
                        <li key={source.id} className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800">
                            <div>
                                <span className="font-medium">{source.name}</span>
                                <span className="text-xs text-gray-500 ml-2">{source.url}</span>
                            </div>
                            <button
                                onClick={() => deleteSource(source.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                            >
                                Eliminar
                            </button>
                        </li>
                    ))}
                    {sources.filter(s => s.type === 'scraping').length === 0 && (
                        <p className="text-sm text-gray-500 italic">No hay scrapings configurados.</p>
                    )}
                </ul>
            </div>

            {/* RSS Feeds Section */}
            <div className="mb-6">
                <h4 className="font-medium mb-2 text-green-600 dark:text-green-400">Fuentes RSS</h4>
                <ul className="space-y-2 mb-4">
                    {sources.filter(s => s.type !== 'scraping').map(source => (
                        <li key={source.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded">
                            <div>
                                <span className="font-medium">{source.name}</span>
                                <span className="text-xs text-gray-500 ml-2">{source.url}</span>
                            </div>
                            <button
                                onClick={() => deleteSource(source.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                            >
                                Eliminar
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <form onSubmit={handleAdd} className="grid gap-2 sm:grid-cols-5 items-end">
                <div className="flex flex-col">
                    <label className="text-xs text-gray-500 mb-1">Tipo</label>
                    <select
                        value={newSource.type}
                        onChange={e => setNewSource({ ...newSource, type: e.target.value as 'rss' | 'scraping' })}
                        className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600 text-sm h-[34px]"
                    >
                        <option value="rss">RSS Feed</option>
                        <option value="scraping">Scraping</option>
                    </select>
                </div>
                <input
                    type="text"
                    placeholder="Nombre"
                    value={newSource.name}
                    onChange={e => setNewSource({ ...newSource, name: e.target.value })}
                    className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
                    required
                />
                <input
                    type="url"
                    placeholder="URL Sitio"
                    value={newSource.url}
                    onChange={e => setNewSource({ ...newSource, url: e.target.value })}
                    className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
                    required
                />
                <div className="flex flex-col">
                    <label className="text-xs text-gray-500 mb-1">URL Feed RSS / Scraping</label>
                    <input
                        type="url"
                        placeholder={newSource.type === 'rss' ? "URL del Feed" : "URL Principal"}
                        value={newSource.feed_url}
                        onChange={e => setNewSource({ ...newSource, feed_url: e.target.value })}
                        className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600 h-[34px]"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? '...' : 'Agregar'}
                </button>
            </form>
        </div>
    );
}
