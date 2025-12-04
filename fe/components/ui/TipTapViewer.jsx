import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useEffect, useState } from 'react';
import { ImagePreviewModal } from './ImagePreviewModal';
import CodeBlockComponent from './CodeBlockComponent';
import { Spotify } from '../extensions/Spotify';

const lowlight = createLowlight(common);

export default function TipTapViewer({ content }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
                blockquote: {
                    HTMLAttributes: {
                        class: 'editor-quote',
                    },
                },
            }),
            Image,
            Link.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        class: {
                            default: null,
                            renderHTML: (attributes) => {
                                // Only add .editor-link class if href starts with http/https
                                if (attributes.href && /^https?:\/\//i.test(attributes.href)) {
                                    return {
                                        class: 'editor-link',
                                    };
                                }
                                return {};
                            },
                        },
                    };
                },
            }).configure({
                openOnClick: true,
            }),
            Youtube.configure({
                controls: true,
                nocookie: true,
                HTMLAttributes: {
                    class: 'w-full max-w-3xl aspect-video rounded-2xl shadow-lg mx-auto my-6',
                },
            }),
            Spotify.configure({
                HTMLAttributes: {
                    class: 'w-full md:w-1/2 rounded-2xl shadow-lg mx-auto block',
                },
            }),
            CodeBlockLowlight.extend({
                addNodeView() {
                    return ReactNodeViewRenderer(CodeBlockComponent);
                },
            }).configure({ lowlight }),
        ],
        content: content || '',
        editable: false, // Read-only
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none p-4 outline-none [&_img]:rounded-3xl [&_img]:border-4 [&_img]:border-dashed [&_img]:border-muted-foreground/20 [&_img]:p-2 [&_img]:w-[100%] [&_img]:block [&_iframe]:max-w-3xl [&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-2xl [&_iframe]:shadow-lg [&_iframe]:mx-auto [&_iframe]:my-6',
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

    const [previewImage, setPreviewImage] = useState(null);
    const [previewCaption, setPreviewCaption] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleContentClick = (e) => {
        if (e.target.tagName === 'IMG') {
            setPreviewImage(e.target.src);
            setPreviewCaption(e.target.alt);
            setIsModalOpen(true);
        }
    };

    if (!editor) return null;

    return (
        <>
            <div onClick={handleContentClick} className="cursor-pointer">
                <EditorContent editor={editor} />
            </div>
            <ImagePreviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                imageSrc={previewImage}
                caption={previewCaption}
            />
        </>
    );
}
