import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { ArrowUp, MessageCircle, Maximize, Minimize, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useFocusMode } from '@/contexts/FocusModeContext';
import dynamic from 'next/dynamic';

const ChatWindow = dynamic(() => import('@/components/chat/ChatWidget'), { ssr: false });
import { AnimatePresence, motion } from 'framer-motion';

import { usePathname } from 'next/navigation';

export default function FloatingControls() {
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const { isFocusMode, toggleFocusMode, setIsFocusMode } = useFocusMode();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMounted, setChatMounted] = useState(false);

    const shouldShowFocusToggle =
        /^\/blog\/[^/]+$/.test(pathname || '') || /^\/project\/[^/]+$/.test(pathname || '');

    useEffect(() => {
        if (!shouldShowFocusToggle && isFocusMode) {
            setIsFocusMode(false);
        }
    }, [pathname, shouldShowFocusToggle, isFocusMode, setIsFocusMode]);

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
        <>
            <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50 items-center">

                {/* Scroll to Top Button */}
                <AnimatePresence>
                    {showScrollTop && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5, y: 20 }}
                        >
                            <Button
                                onClick={scrollToTop}
                                size="icon"
                                className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-md border border-border/50 text-foreground shadow-lg hover:bg-muted transition-all"
                                title="Scroll to top"
                                aria-label="Scroll to top"
                            >
                                <ArrowUp size={20} />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Focus Mode Toggle */}
                {shouldShowFocusToggle && (
                    <Button
                        onClick={toggleFocusMode}
                        size="icon"
                        className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-md border border-border/50 text-foreground shadow-lg hover:bg-muted transition-all"
                        title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                        aria-label={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                    >
                        {isFocusMode ? <Minimize size={20} /> : <Maximize size={20} />}
                    </Button>
                )}

                {/* Chat Toggle */}
                <Button
                    onClick={() => { setChatMounted(true); setIsChatOpen(!isChatOpen); }}
                    size="icon"
                    className={`w-14 h-14 rounded-full shadow-xl transition-all duration-300 ${isChatOpen ? 'bg-destructive text-destructive-foreground rotate-90' : 'bg-primary text-primary-foreground'}`}
                    title="Chat with AI"
                    aria-label="Chat with AI"
                >
                    {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
                </Button>
            </div>

            {/* Chat Window — mounted on first open so its markdown stack loads on demand */}
            {chatMounted && <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
        </>
    );
}
