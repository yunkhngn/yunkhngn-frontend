import React, { useState, useEffect, useCallback } from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Link as LinkIcon, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LinkBubbleMenu({ editor }) {
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');
    const [showInput, setShowInput] = useState(false);

    // Update url and text when selection changes or link state changes
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (editor && editor.isActive('link')) {
            const newUrl = editor.getAttributes('link').href || '';
            if (url !== newUrl) setUrl(newUrl);

            // Get selected text or full text of the link
            const { from, to } = editor.state.selection;
            const textContent = editor.state.doc.textBetween(from, to, ' ');
            if (text !== textContent) setText(textContent);

            setShowInput(true);
        } else {
            setShowInput(false);
            if (url !== '') setUrl('');
            if (text !== '') setText('');
        }
    }, [editor, editor?.state?.selection, url, text]);

    const setLink = useCallback(() => {
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            // If text is provided and different from current selection, we need to replace content
            if (text) {
                editor.chain().focus().extendMarkRange('link')
                    .command(({ tr }) => {
                        tr.insertText(text);
                        return true;
                    })
                    .setLink({ href: url })
                    .run();
            } else {
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            }
        }
        setShowInput(false);
    }, [editor, url, text]);

    const unsetLink = useCallback(() => {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        setShowInput(false);
    }, [editor]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setLink();
        }
        if (e.key === 'Escape') {
            setShowInput(false);
        }
    };

    if (!editor) return null;

    return (
        <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100, placement: 'bottom' }}
            shouldShow={({ editor, from, to }) => {
                // If cursor is on a link, only show if it starts with http/https
                if (editor.isActive('link')) {
                    const href = editor.getAttributes('link').href;
                    return href && /^https?:\/\//i.test(href);
                }

                return false;
            }}
        >
            <div className={cn(
                "flex flex-col gap-1 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-popover p-3 shadow-md transition-all",
                showInput ? "w-[90vw] max-w-xs sm:max-w-sm md:w-96" : "w-auto"
            )}>
                {showInput ? (
                    <>
                        <div className="relative flex items-center">
                            <span className="absolute left-2 text-xs font-mono text-muted-foreground">Txt</span>
                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Link text..."
                                className="h-8 w-full rounded-md bg-muted/50 pl-8 pr-2 font-mono text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                            />
                        </div>
                        <div className="relative flex items-center">
                            <LinkIcon className="absolute left-2 h-3.5 w-3.5 text-muted-foreground" />
                            <input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Paste link..."
                                className="h-8 w-full rounded-md bg-muted/50 pl-8 pr-2 font-mono text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-1 mt-1">
                            {editor.isActive('link') && (
                                <button
                                    onClick={unsetLink}
                                    className="flex h-7 px-2 items-center justify-center rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-xs font-mono"
                                >
                                    Unlink
                                </button>
                            )}
                            <button
                                onClick={setLink}
                                className="flex h-7 px-3 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-mono"
                            >
                                Save
                            </button>
                        </div>
                    </>
                ) : (
                    <button
                        onClick={() => {
                            setShowInput(true);
                            const previousUrl = editor.getAttributes('link').href;
                            setUrl(previousUrl || '');

                            // Try to get selected text
                            const { from, to } = editor.state.selection;
                            const textContent = editor.state.doc.textBetween(from, to, ' ');
                            setText(textContent);
                        }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <LinkIcon className="h-4 w-4" />
                        <span className="font-mono text-xs">Link</span>
                    </button>
                )}
            </div>
        </BubbleMenu>
    );
}
