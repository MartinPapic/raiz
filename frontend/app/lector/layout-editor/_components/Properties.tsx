import { LayoutBlock } from '../page';

interface PropertiesProps {
    block?: LayoutBlock;
    onUpdate: (id: string, data: any) => void;
}

export default function Properties({ block, onUpdate }: PropertiesProps) {
    if (!block) {
        return (
            <div className="text-center text-gray-500 py-12">
                Selecciona un bloque en el lienzo para editar sus propiedades.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="font-bold text-lg border-b pb-2 dark:border-gray-700">Propiedades: {block.type}</h3>

            {block.type === 'heroBlock' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Variante</label>
                        <select
                            value={block.data.layoutVariant || 'fullscreen'}
                            onChange={(e) => onUpdate(block.id, { ...block.data, layoutVariant: e.target.value })}
                            className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="fullscreen">Pantalla Completa</option>
                            <option value="split">Dividido</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Titular Personalizado</label>
                        <input
                            type="text"
                            value={block.data.customHeadline || ''}
                            onChange={(e) => onUpdate(block.id, { ...block.data, customHeadline: e.target.value })}
                            className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600"
                            placeholder="Sobrescribir título original..."
                        />
                    </div>
                </div>
            )}

            {block.type === 'gridBlock' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Variante de Diseño</label>
                        <select
                            value={block.data.layoutVariant || 'default'}
                            onChange={(e) => onUpdate(block.id, { ...block.data, layoutVariant: e.target.value })}
                            className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600"
                        >
                            <option value="default">Cuadrícula Estándar</option>
                            <option value="mosaic">Mosaico (Destacado Izq)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Título de Sección</label>
                        <input
                            type="text"
                            value={block.data.title || ''}
                            onChange={(e) => onUpdate(block.id, { ...block.data, title: e.target.value })}
                            className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                    </div>
                    {/* Only show columns option if not mosaic */
                        block.data.layoutVariant !== 'mosaic' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Columnas</label>
                                <div className="flex gap-2">
                                    {[2, 3].map(cols => (
                                        <button
                                            key={cols}
                                            onClick={() => onUpdate(block.id, { ...block.data, columns: cols })}
                                            className={`flex-1 py-2 border rounded ${block.data.columns === cols ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                                        >
                                            {cols}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                </div>
            )}
        </div>
    );
}
