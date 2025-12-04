import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { Search, Moon, Sun, Menu, X, LogOut, LayoutDashboard, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import NotificationDropdown from "@/components/ui/NotificationDropdown";

const NAV_ITEMS = [
    { label: "Project", href: "/project" },
    { label: "Blog", href: "/blog" },
    { label: "Photo", href: "/photo" },
    { label: "About Me", href: "/about" },
    { label: "Contact", href: "/contact" },
];

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [text, setText] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const fullText = 'yun.khngn';

    // Avoid hydration mismatch & Start typing effect
    useEffect(() => {
        setMounted(true);

        let i = 0;
        const typingInterval = setInterval(() => {
            if (i < fullText.length) {
                setText(fullText.slice(0, i + 1));
                i++;
            } else {
                clearInterval(typingInterval);
            }
        }, 50); // Typing speed

        return () => clearInterval(typingInterval);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <nav className="border-b border-border bg-background backdrop-blur-3xl sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                {/* Left: Logo & Navigation */}
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link href="/" className="font-mono text-lg font-bold flex items-center gap-1 hover:opacity-80 transition-opacity">
                        <span className="text-primary">&gt;</span>
                        <span className="text-foreground min-w-[100px]">{text}</span>
                        <span className="text-primary animate-pulse">_</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm font-medium hover:text-primary transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 md:gap-4">
                    {/* Desktop Search Box - Hidden on mobile */}
                    <form onSubmit={handleSearch} className="hidden md:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                            <Input
                                type="search"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-9 w-64"
                            />
                        </div>
                    </form>

                    {/* Mobile Search Button - Hidden on desktop */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="md:hidden p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors"
                        aria-label="Search"
                    >
                        <Search size={20} />
                    </button>

                    {user && user.role === 'ADMIN' && (
                        <NotificationDropdown />
                    )}

                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="hidden md:flex relative h-10 w-10 rounded-full">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage
                                            src={user.isAnonymous ? "https://cataas.com/cat" : (user.avatarUrl || user.photoURL)}
                                            alt={user.displayName || "User"}
                                        />
                                        <AvatarFallback>
                                            {user.isAnonymous ? "😺" : (user.displayName?.[0] || user.email?.[0] || "U")}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {user.isAnonymous ? "Anonymous" : (user.displayName || "User")}
                                        </p>
                                        {user.isAnonymous ? (
                                            <p className="text-xs leading-none text-muted-foreground">
                                                Temporary visitor account
                                            </p>
                                        ) : user.email && (
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user.email}
                                            </p>
                                        )}
                                    </div>
                                </DropdownMenuLabel>
                                {!user.isAnonymous && <DropdownMenuSeparator />}
                                {!user.isAnonymous && user.role === 'ADMIN' && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin/dashboard" className="cursor-pointer">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Dashboard</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                {!user.isAnonymous && user.role === 'ADMIN' && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin/settings" className="cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            <span>Site Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {!user && (
                        <Button asChild variant="ghost" className="hidden sm:flex">
                            <Link href="/login">Log In</Link>
                        </Button>
                    )}

                    {/* Buy Me a Coffee */}
                    <a
                        href="https://www.buymeacoffee.com/yunkhngn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:flex hover:scale-105 transition-transform"
                    >
                        <Image
                            src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                            alt="Buy Me A Coffee"
                            width={130}
                            height={36}
                            className="h-9 w-auto"
                            unoptimized
                        />
                    </a>

                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="hidden md:flex p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors"
                        aria-label="Toggle theme"
                    >
                        {mounted && theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

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
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-border p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium hover:text-primary transition-colors py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <hr className="border-border" />
                    {!user && (
                        <Link
                            href="/login"
                            className="text-sm font-medium hover:text-primary transition-colors py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Log In
                        </Link>
                    )}

                    {/* Mobile User Actions */}
                    <div className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium">Theme</span>
                        <button
                            onClick={toggleTheme}
                            className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors"
                        >
                            {mounted && theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>

                    {user && (
                        <>
                            <hr className="border-border" />
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 py-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatarUrl || user.photoURL} />
                                        <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{user.displayName}</span>
                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                    </div>
                                </div>
                                {user.role === 'ADMIN' && (
                                    <>
                                        <Link href="/admin/dashboard" className="text-sm hover:text-primary py-1" onClick={() => setIsMobileMenuOpen(false)}>
                                            Dashboard
                                        </Link>
                                        <Link href="/admin/settings" className="text-sm hover:text-primary py-1" onClick={() => setIsMobileMenuOpen(false)}>
                                            Settings
                                        </Link>
                                    </>
                                )}
                                <button
                                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                    className="text-sm text-red-600 hover:text-red-700 text-left py-1"
                                >
                                    Log out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Search Dialog */}
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Search</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSearch} className="mt-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                            <Input
                                type="search"
                                placeholder="Search blogs, projects, photos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-12"
                                autoFocus
                            />
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsSearchOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!searchQuery.trim()}>
                                Search
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </nav>
    );
}