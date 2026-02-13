import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Bot, Moon, Sun, Menu, X, LogOut, LayoutDashboard, User, FileText, Folder, Image, Settings, MessageSquare, Mail, LayoutGrid, Link2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import NotificationDropdown from "@/components/ui/NotificationDropdown";

const ADMIN_NAV_ITEMS = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    {
        label: "Content",
        icon: Folder,
        children: [
            { label: "Project", href: "/admin/project", icon: Folder },
            { label: "Blog", href: "/admin/blog", icon: FileText },
            { label: "Journal", href: "/admin/journal", icon: BookOpen },
            { label: "Photo", href: "/admin/photo", icon: Image },
            { label: "Media", href: "/admin/media", icon: LayoutGrid },
        ]
    },
    {
        label: "Engagement",
        icon: MessageSquare,
        children: [
            { label: "Chatbot", href: "/admin/chat", icon: Bot },
            { label: "Shortlinks", href: "/admin/shortlinks", icon: Link2 },
            { label: "Comments", href: "/admin/comments", icon: MessageSquare },
            { label: "Contact", href: "/admin/contact", icon: Mail },
        ]
    },
    {
        label: "System",
        icon: Settings,
        children: [
            { label: "Profile", href: "/admin/profile", icon: User },
            { label: "Settings", href: "/admin/settings", icon: Settings },
        ]
    }
];

export default function AdminNavbar() {
    const { theme, setTheme } = useTheme();
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <nav className="border-b border-border bg-background backdrop-blur-3xl sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Left: Logo & Navigation */}
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link href="/admin/dashboard" className="font-mono text-lg font-bold flex items-center gap-1 hover:opacity-80 transition-opacity">
                        <span className="text-primary">Admin</span>
                        <span className="text-foreground">Panel</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {ADMIN_NAV_ITEMS.map((item, index) => (
                            <NavItem key={index} item={item} router={router} />
                        ))}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatarUrl || user.photoURL} alt={user.displayName || "User"} />
                                        <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal p-3">
                                    <div className="flex flex-col space-y-2">
                                        <p className="text-sm font-semibold leading-none">{user.displayName || "User"}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="my-1" />
                                <DropdownMenuItem asChild className="p-3 cursor-pointer focus:ring-0 focus:outline-none">
                                    <Link href="/" className="flex items-center gap-3">
                                        <LogOut className="h-4 w-4 rotate-180" />
                                        <span className="font-medium">Back to Site</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1" />
                                <DropdownMenuItem onClick={handleLogout} className="p-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 focus:ring-0 focus:outline-none">
                                    <div className="flex items-center gap-3">
                                        <LogOut className="h-4 w-4" />
                                        <span className="font-medium">Log out</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <NotificationDropdown />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="rounded-full"
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                    {/* Mobile Menu Trigger */}
                    <button
                        className="md:hidden p-2 hover:bg-accent rounded-md"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {
                isMobileMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5 max-h-[80vh] overflow-y-auto">
                        {ADMIN_NAV_ITEMS.map((item, index) => {
                            if (item.children) {
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-muted-foreground">
                                            {item.icon && <item.icon size={16} />}
                                            {item.label}
                                        </div>
                                        <div className="pl-6 space-y-1">
                                            {item.children.map((child) => {
                                                const ChildIcon = child.icon;
                                                const isActive = router.pathname.startsWith(child.href);
                                                return (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                                            }`}
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        <ChildIcon size={16} />
                                                        {child.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }

                            const Icon = item.icon;
                            const isActive = router.pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Icon size={16} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                )
            }
        </nav >
    );
}

function NavItem({ item, router }) {
    const Icon = item.icon;
    const [isOpen, setIsOpen] = useState(false);
    const isActive = item.children
        ? item.children.some(child => router.pathname.startsWith(child.href))
        : router.pathname.startsWith(item.href);

    if (item.children) {

        return (
            <div
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className={`flex items-center gap-2 px-3 py-2 h-auto text-sm font-medium transition-colors cursor-default ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                }`}
                        >
                            <Icon size={16} />
                            {item.label}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48" sideOffset={0}>
                        {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActive = router.pathname.startsWith(child.href);
                            return (
                                <DropdownMenuItem key={child.href} asChild>
                                    <Link
                                        href={child.href}
                                        className={`flex items-center gap-2 cursor-pointer ${isChildActive ? 'text-primary bg-primary/10' : ''}`}
                                    >
                                        <ChildIcon size={14} />
                                        {child.label}
                                    </Link>
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }

    return (
        <Link
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
        >
            <Icon size={16} />
            {item.label}
        </Link>
    );
}
