'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify, Heading2, Heading3 } from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2 p-2 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
                title="Negrita"
            >
                <Bold size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
                title="Cursiva"
            >
                <Italic size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
                title="Título 2"
            >
                <Heading2 size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
                title="Título 3"
            >
                <Heading3 size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

            <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
                title="Izquierda"
            >
                <AlignLeft size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
                title="Centro"
            >
                <AlignCenter size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
                title="Derecha"
            >
                <AlignRight size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
                title="Justificado"
            >
                <AlignJustify size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
                title="Lista Puntos"
            >
                <List size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
                title="Lista Numerada"
            >
                <ListOrdered size={18} />
            </button>
        </div>
    );
};

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-2 text-sm',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        // We only want to update content if it's drastically different (initial load)
        // because setting content on every render resets cursor position.
        // TipTap handles internal state, so we don't need to re-set content unless props change from outside (e.g. scrape/regenerate).
    });

    // Handle content updates from parent (e.g. Scrape/Regenerate)
    // Careful: this might cause cursor jumps if typed too fast, but we need it for "Cancel" or "Regenerate".
    // A better approach is usually comparing content length or IDs, but for this MVP:
    if (editor && content !== editor.getHTML()) {
        // If the incoming content is significantly different, set it (e.g. initial load or regenerate)
        // Check if focused to avoid cursor jump issues during typing
        if (!editor.isFocused) {
            editor.commands.setContent(content);
        }
    }

    return (
        <div className="border rounded-lg overflow-hidden border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor;
