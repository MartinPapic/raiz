'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Page Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8">
            <div className="max-w-3xl w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border border-red-200 dark:border-red-900">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Application Error (Debug Mode)</h2>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-100 dark:border-red-800 mb-6 overflow-auto">
                    <h3 className="font-bold mb-2">Error Message:</h3>
                    <pre className="whitespace-pre-wrap text-sm font-mono text-red-700 dark:text-red-300">
                        {error.message || "Unknown Error"}
                    </pre>

                    {error.digest && (
                        <p className="mt-4 text-xs text-gray-500">Digest: {error.digest}</p>
                    )}
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={
                            // Attempt to recover by trying to re-render the segment
                            () => reset()
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 transition"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        </div>
    );
}
