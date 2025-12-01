import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { useRouter } from 'next/router';
import { Search, Home, FileText, Folder, User, Settings, Image as ImageIcon, Sun, Moon, Laptop, Plus, LayoutDashboard, List } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';

export function CommandMenu() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const router = useRouter();
    const { user } = useAuth();
    const { setTheme } = useTheme();

    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command) => {
        setOpen(false);
        command();
    };

    const actions = [
        {
            group: 'Navigation',
            items: [
                { icon: <Home className="mr-2 h-4 w-4" />, label: 'Home', action: () => router.push('/') },
                { icon: <FileText className="mr-2 h-4 w-4" />, label: 'Blog', action: () => router.push('/blog') },
                { icon: <Folder className="mr-2 h-4 w-4" />, label: 'Projects', action: () => router.push('/project') },
                { icon: <ImageIcon className="mr-2 h-4 w-4" />, label: 'Gallery', action: () => router.push('/photo') },
                { icon: <FileText className="mr-2 h-4 w-4" />, label: 'Resume', action: () => router.push('/resume') },
                { icon: <User className="mr-2 h-4 w-4" />, label: 'About', action: () => router.push('/about') },
            ]
        },
        {
            group: 'Theme',
            items: [
                { icon: <Sun className="mr-2 h-4 w-4" />, label: 'Light', action: () => setTheme('light') },
                { icon: <Moon className="mr-2 h-4 w-4" />, label: 'Dark', action: () => setTheme('dark') },
                { icon: <Laptop className="mr-2 h-4 w-4" />, label: 'System', action: () => setTheme('system') },
            ]
        }
    ];

    if (user && user.role === 'ADMIN') {
        actions.push({
            group: 'Admin',
            items: [
                { icon: <LayoutDashboard className="mr-2 h-4 w-4" />, label: 'Dashboard', action: () => router.push('/admin/dashboard') },
                { icon: <List className="mr-2 h-4 w-4" />, label: 'Manage Blogs', action: () => router.push('/admin/blog') },
                { icon: <Plus className="mr-2 h-4 w-4" />, label: 'New Blog', action: () => router.push('/admin/blog/new') },
                { icon: <List className="mr-2 h-4 w-4" />, label: 'Manage Projects', action: () => router.push('/admin/project') },
                { icon: <Plus className="mr-2 h-4 w-4" />, label: 'New Project', action: () => router.push('/admin/project/new') },
            ]
        });
    }

    const filteredActions = actions.map(group => ({
        ...group,
        items: group.items.filter(item =>
            item.label.toLowerCase().includes(search.toLowerCase())
        )
    })).filter(group => group.items.length > 0);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="p-0 overflow-hidden max-w-lg">
                <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <input
                        className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Type a command or search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2">
                    {filteredActions.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground text-center">No results found.</p>
                    ) : (
                        filteredActions.map((group, i) => (
                            <div key={i} className="mb-2">
                                <h4 className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{group.group}</h4>
                                {group.items.map((item, j) => (
                                    <div
                                        key={j}
                                        onClick={() => runCommand(item.action)}
                                        className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground cursor-pointer"
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
                <div className="border-t p-2 text-xs text-muted-foreground flex justify-end px-4">
                    <span className="opacity-70">Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">Esc</kbd> to close</span>
                </div>
            </DialogContent>
        </Dialog>
    );
}
