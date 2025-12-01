'use client';

import Link from 'next/link';
import { User } from '../viewmodels/useAuthViewModel';

interface NavbarProps {
    user: User | null;
    onLogout: () => void;
    // Props kept for compatibility but unused or forced
    isCuratorMode?: boolean;
    onToggleCuratorMode?: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
    return (
        <header className="bg-white dark:bg-gray-800 shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-3xl font-bold text-green-600 dark:text-green-400">
                        Raíz
                    </Link>
                    <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline-block">
                        Medio Inteligente Sostenible
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Hola, <strong>{user.username}</strong> ({user.role})
                            </span>

                            {user.role === 'admin' && (
                                <>
                                    <Link
                                        href="/admin/users"
                                        className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                    >
                                        Usuarios
                                    </Link>
                                    <Link
                                        href="/curator"
                                        className="px-3 py-1 rounded-md text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 transition-colors"
                                    >
                                        Curador
                                    </Link>
                                </>
                            )}

                            <button
                                onClick={onLogout}
                                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                                Salir
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                        >
                            Ingresar
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
