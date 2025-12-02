import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { ArrowUp } from 'lucide-react';
import Script from 'next/script';
import { Button } from '@/components/ui/Button';

export default function FloatingControls() {
    const { theme, setTheme } = useTheme();
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
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

    return (
        <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50 items-end">
            {/* Scroll to Top Button */}
            <Button onClick={scrollToTop}
                className={`w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all duration-300 transform ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
                aria-label="Scroll to top"
            >
                <ArrowUp size={20} />
            </Button>
        </div>
    );
}
