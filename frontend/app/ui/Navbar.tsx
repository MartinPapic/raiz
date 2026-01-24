'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';

// Define a local interface or import if needed. 
// For flexibility, we'll accept any user object that has basics, 
// as Auth0 user and custom user might differ slightly, but we mainly need name/role.
interface NavbarProps {
    user?: any;
    onLogout?: () => void;
    // Legacy props
    isCuratorMode?: boolean;
    onToggleCuratorMode?: () => void;
}

export default function Navbar({ user: propUser, onLogout }: NavbarProps) {
    const pathname = usePathname();
    const { user: auth0User, isLoading } = useUser();

    // Determine effective user
    const user = propUser || auth0User;

    // Explicitly hide Navbar on Sanity Studio which has its own layout
    if (pathname?.startsWith('/studio')) {
        return null;
    }

    const categories = [
        { name: 'Economía', href: '/seccion/economia' },
        { name: 'Política', href: '/seccion/politica' },
        { name: 'Cultura', href: '/seccion/cultura' },
        { name: 'Tecnología', href: '/seccion/tecnologia' },
        { name: 'Medio Ambiente', href: '/seccion/medio-ambiente' },
        { name: 'Opinión', href: '/seccion/opinion' },
        { name: 'Panoramas', href: '/seccion/panoramas' },
        { name: 'Regional', href: '/seccion/regional' },
        { name: 'Destacados', href: '/seccion/destacados' },
    ];

    // Determine role (Auth0 user might store role in metadata or just check if propUser provided it)
    // If we are strictly relying on the propUser for role-checking (which comes from our custom backend/viewmodel),
    // we should use that. For public navbar, we assume 'guest' unless propUser says 'admin'.
    // If auth0User is present but no propUser, we might not know the role yet unless we fetch it.
    // However, public site doesn't show admin links usually. 
    // Admin links will appear if `user.role === 'admin'`.
    const isAdmin = user?.role === 'admin' || user?.['https://raiz.com/roles']?.includes('admin'); // Fallback for Auth0 claim if exists

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            window.location.href = '/auth/logout';
        }
    };

    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top Bar */}
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <span className="text-3xl font-bold font-serif text-green-700 dark:text-green-500 group-hover:text-green-800 transition-colors">
                                Raíz
                            </span>
                        </Link>
                        <span className="hidden md:block w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2"></span>
                        <span className="text-xs font-medium uppercase tracking-widest text-gray-500 dark:text-gray-400 hidden md:block">
                            Medio Inteligente Sostenible
                        </span>
                    </div>

                    {/* Right Side: Auth & Admin */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <span className="text-sm text-gray-700 dark:text-gray-300 hidden lg:inline">
                                    {user.name || user.username || user.email}
                                </span>

                                {isAdmin && (
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href="/lector"
                                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-200 transition-colors"
                                        >
                                            Lector
                                        </Link>
                                        <Link
                                            href="/studio"
                                            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 transition-colors"
                                        >
                                            CMS
                                        </Link>
                                    </div>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="text-sm font-medium text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                >
                                    Salir
                                </button>
                            </>
                        ) : (
                            // Public Login Link (Currently hidden per requirements "0.- Login ... sin excepción" / "4. Eliminar disponibilidad de login")
                            // Requirement 4 says "Eliminar disponibilidad de login, sólo para admin en dirección, sin botón."
                            // So we render NOTHING here for guests.
                            null
                        )}
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="border-t border-gray-100 dark:border-gray-800 overflow-x-auto py-3 hide-scrollbar">
                    <ul className="flex items-center justify-center space-x-8 min-w-max px-4">
                        {/* Static Links - Removed per request */}

                        {categories.map((category) => (
                            <li key={category.href}>
                                <Link
                                    href={category.href}
                                    className={`text-sm font-bold uppercase tracking-wide transition-colors ${pathname === category.href
                                        ? 'text-green-700 dark:text-green-400'
                                        : 'text-gray-600 hover:text-green-700 dark:text-gray-400 dark:hover:text-green-300'
                                        }`}
                                >
                                    {category.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
