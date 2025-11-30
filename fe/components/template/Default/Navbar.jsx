import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Search, Moon, Sun, Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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

const NAV_ITEMS = [
    { label: "Projects", href: "/projects" },
    { label: "Blog", href: "/blog" },
    { label: "Photo", href: "/photo" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
];

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const { user, signOut } = useAuth();
    const [mounted, setMounted] = useState(false);
    const [text, setText] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

    return (
        <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
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
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors">
                        <Search size={20} />
                    </button>

                    {user ? (
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
                                    <Link href="/dashboard" className="flex items-center gap-3">
                                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Dashboard</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1" />
                                <DropdownMenuItem onClick={signOut} className="p-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 focus:ring-0 focus:outline-none">
                                    <div className="flex items-center gap-3">
                                        <LogOut className="h-4 w-4" />
                                        <span className="font-medium">Log out</span>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button asChild variant="ghost" className="hidden sm:flex">
                            <Link href="/login">Log In</Link>
                        </Button>
                    )}

                    {/* Theme Toggle Button (Purple) */}



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
                    <Link
                        href="/login"
                        className="text-sm font-medium hover:text-primary transition-colors py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Log In
                    </Link>
                </div>
            )}
        </nav>
    );
}