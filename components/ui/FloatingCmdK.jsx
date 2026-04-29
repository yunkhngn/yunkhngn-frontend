'use client';

export default function FloatingCmdK() {
    return (
        <div className="fixed bottom-8 left-6 z-50 flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl border bg-background/40 backdrop-blur-md shadow-sm text-sm text-muted-foreground pointer-events-none select-none">
                <span>Press</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
                <span>to search</span>
            </div>
        </div>
    );
}
