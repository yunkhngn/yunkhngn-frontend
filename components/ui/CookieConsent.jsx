import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AnimatePresence, m as motion } from 'framer-motion';

export default function CookieConsent() {
    const [showConsent, setShowConsent] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            // Use setTimeout to avoid synchronous state update warning, though in this case it's actually fine as it's checking storage.
            // Better yet, just set it directly if we want, but for hydration mismatch avoidance, useEffect is good.
            // The warning "Calling setState synchronously within an effect" usually applies when it triggers immediate re-render loops or is anti-pattern.
            // Here it's just setting initial state based on storage.
            // To satisfy linter, we can wrap in requestAnimationFrame or just ignore if it was a false positive, but let's use a small timeout to be safe and smooth.
            const timer = setTimeout(() => setShowConsent(true), 100);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookie_consent', 'true');
        setShowConsent(false);
    };

    return (
        <AnimatePresence>
            {showConsent && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-50"
                >
                    <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-muted-foreground text-center sm:text-left">
                            <p>
                                We use cookies to enhance your browsing experience and analyze our traffic.
                                By clicking &quot;Accept&quot;, you consent to our use of cookies.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={acceptCookies}>
                                Accept
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
