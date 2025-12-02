import React, { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Link as LinkIcon, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LinkPopover({ editor, children }) {
    const [url, setUrl] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen && editor) {
            const previousUrl = editor.getAttributes('link').href;
            const newUrl = previousUrl || '';
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (url !== newUrl) setUrl(newUrl);
        }
    }, [isOpen, editor]);

    const setLink = () => {
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
        setIsOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setLink();
        }
    };

    return (
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger asChild>
                {children}
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className="z-50 w-72 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-popover p-2 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                    sideOffset={5}
                >
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <LinkIcon className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Paste link..."
                                className="h-8 w-full rounded-md bg-muted/50 pl-7 pr-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                                autoFocus
                            />
                        </div>
                        <button
                            onClick={setLink}
                            className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                            <Check className="h-4 w-4" />
                        </button>
                    </div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
