import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { ArrowUp, Moon, Sun } from 'lucide-react';

export default function FloatingControls() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        setMounted(true);

        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    if (!mounted) return null;

    return (
        <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className={`w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all duration-300 transform ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
                aria-label="Scroll to top"
            >
                <ArrowUp size={20} />
            </button>

            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full bg-[#F6E8D2] flex items-center justify-center text-[#42475B] hover:bg-primary hover:text-white transition-all duration-300 shadow-lg"
                aria-label="Toggle Theme"
            >
                {theme === 'dark' ? (
                    <Sun size={20} />
                ) : (
                    <Moon size={20} />
                )}
            </button>
        </div>
    );
}
