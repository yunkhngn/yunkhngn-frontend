import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Button } from '@/components/ui/Button';
import {
    Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote,
    Undo, Redo, Image as ImageIcon, Link as LinkIcon, Heading1, Heading2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const lowlight = createLowlight(common);

const MenuBar = ({ editor, addImage }) => {
    if (!editor) return null;

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const handleAction = (e, action) => {
        e.preventDefault();
        action();
    };

    return (
        <div className="border-b p-2 flex flex-wrap gap-1 sticky top-0 bg-background z-10">
            <Button
                type="button"
                variant="ghost" size="sm"
                onClick={(e) => handleAction(e, () => editor.chain().focus().toggleBold().run())}
                className={cn(editor.isActive('bold') && 'bg-muted')}
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost" size="sm"
                onClick={(e) => handleAction(e, () => editor.chain().focus().toggleItalic().run())}
                className={cn(editor.isActive('italic') && 'bg-muted')}
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost" size="sm"
                onClick={(e) => handleAction(e, () => editor.chain().focus().toggleStrike().run())}
                className={cn(editor.isActive('strike') && 'bg-muted')}
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 my-auto" />
            <Button
                type="button"
                variant="ghost" size="sm"
                onClick={(e) => handleAction(e, () => editor.chain().focus().toggleHeading({ level: 1 }).run())}
                className={cn(editor.isActive('heading', { level: 1 }) && 'bg-muted')}
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost" size="sm"
                onClick={(e) => handleAction(e, () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
                className={cn(editor.isActive('heading', { level: 2 }) && 'bg-muted')}
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 my-auto" />
            <Button
                type="button"
                variant="ghost" size="sm"
                onClick={(e) => handleAction(e, () => editor.chain().focus().toggleBulletList().run())}
                className={cn(editor.isActive('bulletList') && 'bg-muted')}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost" size="sm"
                onClick={(e) => handleAction(e, () => editor.chain().focus().toggleOrderedList().run())}
                className={cn(editor.isActive('orderedList') && 'bg-muted')}
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 my-auto" />
            <Button
                type="button"
                variant="ghost" size="sm"
                onClick={(e) => handleAction(e, () => editor.chain().focus().toggleCodeBlock().run())}
                className={cn(editor.isActive('codeBlock') && 'bg-muted')}
            >
                <Code className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost" size="sm"
                onClick={(e) => handleAction(e, () => editor.chain().focus().toggleBlockquote().run())}
                className={cn(editor.isActive('blockquote') && 'bg-muted')}
            >
                <Quote className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 my-auto" />
            <Button type="button" variant="ghost" size="sm" onClick={setLink} className={cn(editor.isActive('link') && 'bg-muted')}>
                <LinkIcon className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={addImage}>
                <ImageIcon className="h-4 w-4" />
            </Button>
            <div className="flex-1" />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => handleAction(e, () => editor.chain().focus().undo().run())}
                disabled={!editor.can().undo()}
            >
                <Undo className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => handleAction(e, () => editor.chain().focus().redo().run())}
                disabled={!editor.can().redo()}
            >
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    );
};

const parseContent = (content) => {
    if (typeof content === 'string') {
        try {
            const parsed = JSON.parse(content);
            // Ensure it's an object/array (TipTap JSON), not just a primitive string like "foo"
            if (typeof parsed === 'object' && parsed !== null) {
                return parsed;
            }
            return content;
        } catch (e) {
            return content;
        }
    }
    return content;
};

export default function TipTapEditor({ content, onChange, onImageUpload }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({ openOnClick: false }),
            CodeBlockLowlight.configure({ lowlight }),
        ],
        content: parseContent(content) || '',
        onUpdate: ({ editor }) => {
            onChange(JSON.stringify(editor.getJSON()));
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none p-4 min-h-[300px] outline-none',
            },
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (editor && content) {
            // Check if content needs update
            // We compare stringified JSON to avoid deep object comparison issues
            // But editor.getJSON() might differ slightly from content string (e.g. key order), 
            // so this check isn't perfect but prevents infinite loops if onChange updates content prop.
            // However, since we use JSON.stringify in onChange, it should be consistent.

            // If the editor is empty and content is provided, definitely update.
            // If editor has content, we need to be careful.
            // For "Edit Project", content is loaded async. Editor initializes empty. 
            // Then content prop updates. We MUST update editor.

            const currentJSON = JSON.stringify(editor.getJSON());
            if (content !== currentJSON && content !== '') {
                // Try to parse if it's a string
                const parsed = parseContent(content);
                // Only set if different (TipTap setContent usually handles diffing but let's be safe)
                // Actually setContent is fine.

                // Issue: If user types, onChange fires -> content prop updates -> useEffect fires.
                // If we setContent again, cursor might jump.
                // We should only setContent if the *incoming* content is significantly different 
                // AND it's likely from an external source (like initial load).
                // But we can't easily distinguish.

                // Workaround: Compare with a flag or just rely on the fact that 
                // if we type, editor state is ahead or same as content prop (due to React render cycle).
                // If we type 'a', editor has 'a'. onChange sends 'a'. content prop becomes 'a'.
                // useEffect sees content='a', editor='a'. No update.
                // If we load data: editor='', content='abc'. Update!

                // So the check `content !== currentJSON` should be sufficient to avoid loop 
                // IF the serialization is deterministic.

                editor.commands.setContent(parsed);
            }
        }
    }, [content, editor]);

    const addImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file && onImageUpload) {
                const url = await onImageUpload(file);
                if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                }
            }
        };
        input.click();
    };

    return (
        <div className="border rounded-md overflow-hidden bg-background">
            <MenuBar editor={editor} addImage={addImage} />
            <EditorContent editor={editor} />
        </div>
    );
}
