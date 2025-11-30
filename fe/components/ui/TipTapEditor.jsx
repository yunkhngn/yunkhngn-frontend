import { useEditor, EditorContent } from '@tiptap/react';
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

    return (
        <div className="border-b p-2 flex flex-wrap gap-1 sticky top-0 bg-background z-10">
            <Button
                variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(editor.isActive('bold') && 'bg-muted')}
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(editor.isActive('italic') && 'bg-muted')}
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn(editor.isActive('strike') && 'bg-muted')}
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 my-auto" />
            <Button
                variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn(editor.isActive('heading', { level: 1 }) && 'bg-muted')}
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn(editor.isActive('heading', { level: 2 }) && 'bg-muted')}
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 my-auto" />
            <Button
                variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(editor.isActive('bulletList') && 'bg-muted')}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(editor.isActive('orderedList') && 'bg-muted')}
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 my-auto" />
            <Button
                variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={cn(editor.isActive('codeBlock') && 'bg-muted')}
            >
                <Code className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost" size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(editor.isActive('blockquote') && 'bg-muted')}
            >
                <Quote className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 my-auto" />
            <Button variant="ghost" size="sm" onClick={setLink} className={cn(editor.isActive('link') && 'bg-muted')}>
                <LinkIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={addImage}>
                <ImageIcon className="h-4 w-4" />
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()}>
                <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()}>
                <Redo className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default function TipTapEditor({ content, onChange, onImageUpload }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({ openOnClick: false }),
            CodeBlockLowlight.configure({ lowlight }),
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            onChange(JSON.stringify(editor.getJSON()));
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none p-4 min-h-[300px] outline-none',
            },
        },
    });

    // Update content if it changes externally (e.g. loading a project)
    // Note: This needs careful handling to avoid loops/cursor jumps.
    // For simplicity, we might only set content on initial load or if editor is empty.
    // A better approach is to use a key on the component to force re-mount when project changes.

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
