import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Search, Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
    { label: "Projects", href: "/projects" },
    { label: "Blog", href: "/blog" },
    { label: "Photo", href: "/photo" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
];

export default function Navbar() {
    const { theme, setTheme } = useTheme();
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

                    <Button asChild variant="ghost" className="hidden sm:flex">
                        <Link href="/login">Log In</Link>
                    </Button>

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