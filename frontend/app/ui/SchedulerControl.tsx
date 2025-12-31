import { useSchedulerViewModel } from '../viewmodels/useSchedulerViewModel';

export default function SchedulerControl() {
    const { status, loading, startScheduler, stopScheduler, runNow, refreshStatus } = useSchedulerViewModel();

    if (!status) return null;

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-4 border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>⏰</span> Ingesta Automática
                </h3>
                <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${status.running ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {status.running ? 'Activo' : 'Detenido'}
                    </span>
                </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
                {status.next_run_time ? (
                    <p>Próxima ejecución: {new Date(status.next_run_time).toLocaleString()}</p>
                ) : (
                    <p>Esperando inicio...</p>
                )}
            </div>

            <div className="flex gap-2 pt-2">
                {status.running ? (
                    <button
                        onClick={stopScheduler}
                        disabled={loading}
                        className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 disabled:opacity-50"
                    >
                        Detener
                    </button>
                ) : (
                    <button
                        onClick={startScheduler}
                        disabled={loading}
                        className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50"
                    >
                        Iniciar
                    </button>
                )}

                <button
                    onClick={runNow}
                    disabled={loading}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 disabled:opacity-50 ml-auto"
                >
                    Ejecutar Ahora
                </button>

                <button
                    onClick={refreshStatus}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    title="Actualizar estado"
                >
                    ↻
                </button>
            </div>
        </div>
    );
}
