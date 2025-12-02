import React, { useState, useEffect, useCallback } from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Link as LinkIcon, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LinkBubbleMenu({ editor }) {
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');
    const [showInput, setShowInput] = useState(false);

    // Update url and text when selection changes or link state changes
    useEffect(() => {
        if (editor && editor.isActive('link')) {
            setUrl(editor.getAttributes('link').href || '');

            // Get selected text or full text of the link
            const { from, to } = editor.state.selection;
            const textContent = editor.state.doc.textBetween(from, to, ' ');

            // If selection is empty (cursor inside link), get the whole link text
            if (editor.state.selection.empty) {
                const { from, to } = editor.getAttributes('link'); // This doesn't give range
                // TipTap doesn't easily give mark range. 
                // We'll rely on current selection text if not empty, otherwise we might need extendMarkRange
                // But for now, let's just use what we have or empty if it's a new link
            }

            // Better approach: extend selection to mark range to get full text
            // But we don't want to change selection just by opening menu?
            // Actually, for editing text, we probably want to select the whole link.

            setText(textContent);
            setShowInput(true);
        } else {
            setShowInput(false);
            setUrl('');
            setText('');
        }
    }, [editor, editor?.state?.selection]);

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
                // Show if selection is not empty OR if cursor is on a link
                return !editor.state.selection.empty || editor.isActive('link');
            }}
        >
            <div className={cn(
                "flex flex-col gap-1 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-popover p-3 shadow-md transition-all",
                showInput ? "w-96" : "w-auto"
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
