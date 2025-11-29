'use client';

import { useState } from 'react';
import { useSourceViewModel } from '../viewmodels/useSourceViewModel';

export default function SourceList() {
    const { sources, loading, addSource, deleteSource } = useSourceViewModel();
    const [newSource, setNewSource] = useState({ name: '', url: '', feed_url: '' });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await addSource(newSource);
        if (success) {
            setNewSource({ name: '', url: '', feed_url: '' });
        } else {
            alert('Error adding source');
        }
    };

    return (
        <div className="mt-4 border-t pt-4 dark:border-gray-700">
            <h4 className="font-medium mb-2">Fuentes RSS</h4>

            <ul className="space-y-2 mb-4">
                {sources.map(source => (
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

            <form onSubmit={handleAdd} className="grid gap-2 sm:grid-cols-4">
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
                <input
                    type="url"
                    placeholder="URL Feed RSS"
                    value={newSource.feed_url}
                    onChange={e => setNewSource({ ...newSource, feed_url: e.target.value })}
                    className="px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
                    required
                />
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
