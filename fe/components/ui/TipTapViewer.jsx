import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useEffect } from 'react';

const lowlight = createLowlight(common);

export default function TipTapViewer({ content }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({ openOnClick: true }), // Allow clicking links in viewer
            CodeBlockLowlight.configure({ lowlight }),
        ],
        content: content || '',
        editable: false, // Read-only
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none p-4 outline-none',
            },
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && content) {
            // Only update if content is different to avoid loops/resets, 
            // though for a viewer it's less critical than an editor.
            // But since we pass content to useEditor, this might not be strictly needed 
            // unless content changes after mount.
            if (editor.getHTML() !== content && JSON.stringify(editor.getJSON()) !== content) {
                // Content can be JSON string or HTML string. 
                // If it's a JSON string, we should parse it if useEditor doesn't handle stringified JSON automatically (it usually handles object or HTML string).
                try {
                    const json = JSON.parse(content);
                    editor.commands.setContent(json);
                } catch (e) {
                    editor.commands.setContent(content);
                }
            }
        }
    }, [content, editor]);

    if (!editor) return null;

    return <EditorContent editor={editor} />;
}
