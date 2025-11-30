import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Search, Moon, Sun, Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
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
                    <Link href="/" className="text-xl font-bold font-heading text-primary flex items-center gap-2">
                        <span className="border-2 border-primary px-1 rounded-sm">code</span>
                        <span>yunkhngn</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <NavDropdown title="Catalog">
                            <DropdownMenuItem asChild>
                                <Link href="/projects" className="cursor-pointer w-full">Projects</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/gallery" className="cursor-pointer w-full">Gallery</Link>
                            </DropdownMenuItem>
                        </NavDropdown>

                        <NavDropdown title="Resources">
                            <DropdownMenuItem asChild>
                                <Link href="/blog" className="cursor-pointer w-full">Blog</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/snippets" className="cursor-pointer w-full">Snippets</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/tags" className="cursor-pointer w-full">Tags</Link>
                            </DropdownMenuItem>
                        </NavDropdown>

                        <NavDropdown title="Community">
                            <DropdownMenuItem asChild>
                                <Link href="/about" className="cursor-pointer w-full">About Me</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/contact" className="cursor-pointer w-full">Contact</Link>
                            </DropdownMenuItem>
                        </NavDropdown>

                        <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                            Pricing
                        </Link>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors">
                        <Search size={20} />
                    </button>

                    <Link href="/login" className="hidden sm:block text-sm font-medium hover:text-primary transition-colors">
                        Log In
                    </Link>

                    {/* Theme Toggle Button (Purple) */}
                    <Button
                        onClick={toggleTheme}
                        className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-md transition-all flex items-center gap-2"
                    >
                        {mounted && theme === 'dark' ? (
                            <>
                                <Sun size={16} />
                                <span>Light Mode</span>
                            </>
                        ) : (
                            <>
                                <Moon size={16} />
                                <span>Dark Mode</span>
                            </>
                        )}
                    </Button>

                    {/* Mobile Menu Trigger */}
                    <button className="md:hidden p-2 hover:bg-accent rounded-md">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
}

function NavDropdown({ title, children }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors outline-none">
                {title}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}