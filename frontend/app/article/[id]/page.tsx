'use client';

import { useParams } from 'next/navigation';
import ArticleDetailView from '../../views/ArticleDetailView';
import Navbar from '../../ui/Navbar';
import { useAuthViewModel } from '../../viewmodels/useAuthViewModel';

export default function ArticlePage() {
    const params = useParams();
    const id = typeof params?.id === 'string' ? parseInt(params.id) : 0;

    console.log('ArticlePage params:', params, 'id:', id);
    const { user, logout } = useAuthViewModel();

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar
                user={user}
                onLogout={logout}
                isCuratorMode={false}
                onToggleCuratorMode={() => { }}
            />
            {id > 0 ? (
                <ArticleDetailView articleId={id} />
            ) : (
                <div className="p-8 text-center text-red-500">ID de artículo inválido</div>
            )}
        </main>
    );
}
