export default function ContactoPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-gray-900 py-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold font-serif text-gray-900 dark:text-white mb-8 text-center">
                    Contacto
                </h1>

                <div className="prose prose-lg dark:prose-invert mx-auto mb-12">
                    <p className="text-center text-gray-600 dark:text-gray-300">
                        ¿Tienes alguna denuncia, sugerencia o comentario? Queremos escucharte.
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-sm">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Correo Electrónico</h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                <a href="mailto:contacto@diarioraiz.cl" className="text-green-600 hover:text-green-700">contacto@diarioraiz.cl</a>
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Redes Sociales</h3>
                            <div className="flex gap-4">
                                {/* Placeholders for social links */}
                                <a href="#" className="text-gray-500 hover:text-green-600 transition-colors">Instagram</a>
                                <a href="#" className="text-gray-500 hover:text-green-600 transition-colors">Twitter (X)</a>
                                <a href="#" className="text-gray-500 hover:text-green-600 transition-colors">LinkedIn</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
