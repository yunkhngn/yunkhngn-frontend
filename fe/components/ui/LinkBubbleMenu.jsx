import React, { useState, useEffect, useCallback } from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Link as LinkIcon, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LinkBubbleMenu({ editor }) {
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');
    const [showInput, setShowInput] = useState(false);

    // Initialize state when menu shows
    useEffect(() => {
        if (editor && editor.isActive('link')) {
            // Only update if not already editing to preserve user input
            if (!showInput) {
                const href = editor.getAttributes('link').href || '';
                setUrl(href);

                // Get the text content of the link
                const { from, to } = editor.state.selection;
                if (from !== to) {
                    const textContent = editor.state.doc.textBetween(from, to, ' ');
                    setText(textContent);
                } else {
                    // Try to find the link node range
                    // This is a bit complex in Tiptap, so for now we might leave text empty 
                    // or user has to select text first.
                    // But if it's an existing link, we typically want to edit its text.
                }
                setShowInput(true);
            }
        } else {
            setShowInput(false);
        }
    }, [editor, editor?.state?.selection]);

    const setLink = useCallback(() => {
        if (!url) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            // If text is provided, we might want to replace the selected text
            // But changing text of a mark is tricky.
            // Simplest is to extend range, insert text, then apply link.

            if (text) {
                editor.chain().focus().extendMarkRange('link')
                    .command(({ tr, state, dispatch }) => {
                        if (dispatch) {
                            tr.insertText(text);
                        }
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
