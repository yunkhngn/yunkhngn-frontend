import { useEditor, EditorContent, BubbleMenu, ReactNodeViewRenderer } from '@tiptap/react';
import { useEffect, useState } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import CodeBlockComponent from './CodeBlockComponent';
import { LinkPopover } from './LinkPopover';
import { LinkBubbleMenu } from './LinkBubbleMenu';
import ImageNodeView from './ImageNodeView';
import { Spotify } from '../extensions/Spotify';
import { AppleMusic } from '../extensions/AppleMusic';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import {
    Bold, Italic, Strikethrough, Code, List, ListOrdered, Quote,
    Undo, Redo, Image as ImageIcon, Link as LinkIcon, Heading1, Heading2, Heading3, Trash2, Youtube as YoutubeIcon, Minus,
    Maximize, Minimize
} from 'lucide-react';
import { cn } from '@/lib/utils';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';

const lowlight = createLowlight(common);

const MenuBar = ({ editor, addImage, addYoutube, hideEmbeds, isFullscreen, toggleFullscreen }) => {
    if (!editor) return null;

    return (
        <div className={cn(
            "border-b p-2 flex flex-wrap gap-1 sticky top-0 bg-background/95 backdrop-blur z-20 transition-all",
            isFullscreen ? "px-4" : "rounded-t-md"
        )}>
            <Button
                type="button"
                variant="ghost" size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(editor.isActive('bold') && 'bg-muted')}
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost" size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(editor.isActive('italic') && 'bg-muted')}
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost" size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn(editor.isActive('strike') && 'bg-muted')}
            >
                <Strikethrough className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 my-auto" />
            <Button
                type="button"
                variant="ghost" size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn(editor.isActive('heading', { level: 1 }) && 'bg-muted')}
            >
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost" size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn(editor.isActive('heading', { level: 2 }) && 'bg-muted')}
            >
                <Heading2 className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost" size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={cn(editor.isActive('heading', { level: 3 }) && 'bg-muted')}
            >
                <Heading3 className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 my-auto" />
            <Button
                type="button"
                variant="ghost" size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(editor.isActive('bulletList') && 'bg-muted')}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost" size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(editor.isActive('orderedList') && 'bg-muted')}
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 my-auto" />
            <Button
                type="button"
                variant="ghost" size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={cn(editor.isActive('codeBlock') && 'bg-muted')}
            >
                <Code className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost" size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(editor.isActive('blockquote') && 'bg-muted')}
            >
                <Quote className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost" size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
                <Minus className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 my-auto" />
            <LinkPopover editor={editor}>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(editor.isActive('link') && 'bg-muted')}
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>
            </LinkPopover>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={addImage}
            >
                <ImageIcon className="h-4 w-4" />
            </Button>
            {!hideEmbeds && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={addYoutube}
                    className={cn(editor.isActive('youtube') && 'bg-muted')}
                >
                    <YoutubeIcon className="h-4 w-4" />
                </Button>
            )}
            <div className="flex-1" />

            {/* Undo/Redo Group */}
            <div className="flex bg-muted/30 rounded-md p-0.5">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Undo className="h-3.5 w-3.5" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Redo className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Fullscreen Toggle */}
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={toggleFullscreen}
                className="ml-1"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
        </div>
    );
};

const parseContent = (content, format) => {
    if (format === 'html') return content;
    if (typeof content === 'string') {
        try {
            const parsed = JSON.parse(content);
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

export default function TipTapEditor({ content, onChange, onImageUpload, format = 'json', hideEmbeds = false }) {
    const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Lock body scroll when in fullscreen
    useEffect(() => {
        if (typeof document !== 'undefined') {
            if (isFullscreen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [isFullscreen]);

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const extensions = [
        StarterKit.configure({
            codeBlock: false,
            blockquote: {
                HTMLAttributes: {
                    class: 'editor-quote',
                },
            },
        }),
        Image.extend({
            addNodeView() {
                return ReactNodeViewRenderer(ImageNodeView);
            },
        }).configure({
            inline: true,
            allowBase64: true,
        }),
        Link.extend({
            addAttributes() {
                return {
                    ...this.parent?.(),
                    class: {
                        default: null,
                        renderHTML: (attributes) => {
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
            openOnClick: false,
        }),
        Youtube.configure({
            controls: true,
            nocookie: true,
            HTMLAttributes: {
                class: 'w-full aspect-video rounded-2xl shadow-lg mx-auto',
            },
        }),
        Spotify.configure({
            HTMLAttributes: {
                class: 'w-full md:w-1/2 rounded-2xl shadow-lg mx-auto block',
            },
        }),
        AppleMusic.configure({
            HTMLAttributes: {
                class: 'w-full md:w-1/2 rounded-2xl shadow-lg mx-auto block',
            },
        }),
        CodeBlockLowlight.configure({
            lowlight,
            defaultLanguage: 'javascript',
        }).extend({
            addNodeView() {
                return ReactNodeViewRenderer(CodeBlockComponent);
            },
        }),
        BubbleMenuExtension.configure({
            pluginKey: 'bubbleMenu',
        }),
    ];

    const editor = useEditor({
        extensions: extensions,
        content: parseContent(content, format) || '',
        onUpdate: ({ editor }) => {
            if (format === 'html') {
                onChange(editor.getHTML());
            } else {
                onChange(JSON.stringify(editor.getJSON()));
            }
        },
        editorProps: {
            attributes: {
                // Modified classes:
                // 1. Added transition-all for smooth fullscreen toggle
                // 2. Conditional min-h based on fullscreen
                // 3. Removed max-w-none effectively in fullscreen via container
                class: cn(
                    'prose dark:prose-invert max-w-none p-4 outline-none',
                    '[&_img]:rounded-3xl [&_img]:border-2 [&_img]:border-dashed [&_img]:border-muted-foreground/20 [&_img]:p-2 [&_img]:max-w-[100%] [&_img]:mx-auto [&_img]:block',
                    'prose-headings:font-serif prose-p:leading-relaxed',
                    '[&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:rounded-2xl [&_iframe]:shadow-lg [&_iframe]:mx-auto',
                    isFullscreen ? 'min-h-screen max-w-screen-lg mx-auto py-8' : 'min-h-[300px]'
                ),
                style: 'font-family: Palatino, "Palatino Linotype", "Book Antiqua", serif; font-size: 1.2rem;',
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0];
                    const fileType = file.type;

                    // Only handle images
                    if (fileType.startsWith('image/')) {
                        event.preventDefault();

                        if (onImageUpload) {
                            onImageUpload(file).then(url => {
                                if (url) {
                                    const { schema } = view.state;
                                    const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                                    const node = schema.nodes.image.create({ src: url });
                                    const transaction = view.state.tr.insert(coordinates.pos, node);
                                    view.dispatch(transaction);
                                }
                            });
                        }
                        return true;
                    }
                }
                return false;
            },
            handlePaste: (view, event, slice) => {
                const items = Array.from(event.clipboardData?.items || []);
                const imageItem = items.find(item => item.type.startsWith('image/'));

                if (imageItem) {
                    event.preventDefault();
                    const file = imageItem.getAsFile();

                    if (file && onImageUpload) {
                        onImageUpload(file).then(url => {
                            if (url) {
                                const { schema } = view.state;
                                const node = schema.nodes.image.create({ src: url });
                                const transaction = view.state.tr.replaceSelectionWith(node);
                                view.dispatch(transaction);
                            }
                        });
                    }
                    return true;
                }
                return false;
            },
        },
        immediatelyRender: false,
    });

    // Cleanup editor on unmount to prevent domFromPos errors
    useEffect(() => {
        return () => {
            if (editor) {
                editor.destroy();
            }
        };
    }, [editor]);

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

            if (format === 'html') {
                if (editor.getHTML() !== content) {
                    editor.commands.setContent(content);
                }
            } else {
                const currentJSON = JSON.stringify(editor.getJSON());
                if (content !== currentJSON && content !== '') {
                    const parsed = parseContent(content, format);
                    editor.commands.setContent(parsed);
                }
            }
        }
    }, [content, editor, format]);

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

    const addYoutube = () => {
        setYoutubeDialogOpen(true);
    };

    const handleYoutubeSubmit = () => {
        if (youtubeUrl) {
            editor.commands.setYoutubeVideo({
                src: youtubeUrl,
                width: 640,
                height: 480,
            });
            setYoutubeUrl('');
            setYoutubeDialogOpen(false);
        }
    };

    return (
        <>
            <div className={cn(
                "bg-background transition-all duration-300 ease-in-out",
                isFullscreen
                    ? "fixed inset-0 z-50 h-[100dvh] w-screen flex flex-col"
                    : "border rounded-md" // Removed overflow-hidden here to allow sticky sticky actions
            )}>
                <MenuBar
                    editor={editor}
                    addImage={addImage}
                    addYoutube={addYoutube}
                    hideEmbeds={hideEmbeds}
                    isFullscreen={isFullscreen}
                    toggleFullscreen={toggleFullscreen}
                />

                <div className={cn(
                    "relative",
                    isFullscreen && "flex-1 overflow-y-auto bg-background/50"
                )}>
                    {editor && <LinkBubbleMenu editor={editor} />}
                    <EditorContent editor={editor} className={cn(isFullscreen && "min-h-full")} />
                </div>
            </div>

            {/* YouTube URL Dialog */}
            <Dialog open={youtubeDialogOpen} onOpenChange={setYoutubeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add YouTube Video</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Enter YouTube URL"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleYoutubeSubmit();
                                }
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setYoutubeDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleYoutubeSubmit} disabled={!youtubeUrl}>
                            Add Video
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
