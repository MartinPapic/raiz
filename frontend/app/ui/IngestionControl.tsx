'use client';

import { useState, useEffect } from 'react';

interface IngestionControlProps {
    onIngestComplete: () => void;
    prefill?: { url: string; source: string } | null;
}

export default function IngestionControl({ onIngestComplete, prefill }: IngestionControlProps) {
    const [url, setUrl] = useState('');
    const [source, setSource] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (prefill) {
            setUrl(prefill.url);
            setSource(prefill.source);
        }
    }, [prefill]);

    const handleIngest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const headers: any = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch('http://localhost:8000/ingest', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ feed_url: url, source_name: source }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(`¡Éxito! Se ingirieron ${data.count} artículos.`);
                setUrl('');
                setSource('');
                onIngestComplete();
            } else {
                setMessage(`Error: ${data.detail}`);
            }
        } catch (error) {
            setMessage('Error al conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 mb-8">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Agregar Nueva Fuente</h3>
            <form onSubmit={handleIngest} className="flex flex-col md:flex-row gap-3">
                <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Nombre de la Fuente (ej. BBC)"
                    className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                    required
                />
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="URL del Feed RSS"
                    className="flex-[2] px-3 py-2 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm whitespace-nowrap"
                >
                    {loading ? 'Procesando...' : 'Ingerir Feed'}
                </button>
            </form>
            {message && (
                <p className={`mt-2 text-xs ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}
