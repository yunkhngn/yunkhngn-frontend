import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { ArrowUp, MessageCircle, Maximize, Minimize, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useFocusMode } from '@/contexts/FocusModeContext';
import ChatWindow from '@/components/chat/ChatWidget';
import { AnimatePresence, motion } from 'framer-motion';

import { useRouter } from 'next/router';

export default function FloatingControls() {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [showScrollTop, setShowScrollTop] = useState(false);
    const { isFocusMode, toggleFocusMode, setIsFocusMode } = useFocusMode();
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Only show Focus Mode on Blog Detail and Project Detail pages
    const shouldShowFocusToggle = router.pathname === '/blog/[slug]' || router.pathname === '/project/[id]';

    // Reset Focus Mode when navigating away from supported pages
    useEffect(() => {
        if (!shouldShowFocusToggle && isFocusMode) {
            setIsFocusMode(false);
        }
    }, [router.pathname, shouldShowFocusToggle, isFocusMode, setIsFocusMode]);

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
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    size="icon"
                    className={`w-14 h-14 rounded-full shadow-xl transition-all duration-300 ${isChatOpen ? 'bg-destructive text-destructive-foreground rotate-90' : 'bg-primary text-primary-foreground'}`}
                    title="Chat with AI"
                    aria-label="Chat with AI"
                >
                    {isChatOpen ? <X size={24} /> : <MessageCircle size={24} />}
                </Button>
            </div>

            {/* Chat Window */}
            <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </>
    );
}
