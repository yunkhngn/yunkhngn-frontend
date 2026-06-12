import { useState } from 'react';
import { readNestJson } from '@/lib/api/readJson';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';

export default function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await readNestJson(res);

            if (res.ok) {
                setStatus('success');
                setEmail('');
                setMessage('Thanks for subscribing! Please check your email.');
            } else {
                setStatus('error');
                setMessage(data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Network error. Please try again.');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-foreground">Newsletter</h2>
            <AnimatePresence mode='wait'>
                {status === 'success' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center justify-center p-6 bg-green-500/10 border border-green-500/20 rounded-xl text-center"
                    >
                        <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                        <h3 className="text-lg font-semibold text-green-500">Subscribed!</h3>
                        <p className="text-sm text-zinc-500 mt-1">{message}</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="mt-4 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline"
                        >
                            Subscribe another email
                        </button>
                    </motion.div>
                ) : (
                    <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleSubmit}
                        className="relative"
                    >
                        <div className="relative group">
                            {/* Glow effect - stronger in dark mode */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 dark:opacity-30 dark:group-hover:opacity-70"></div>

                            <div className="relative flex items-center bg-background border border-border rounded-lg p-1 pr-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition shadow-sm dark:bg-black dark:border-zinc-800">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground px-3 py-3"
                                    disabled={status === 'loading'}
                                />
                                <button
                                    type="submit"
                                    disabled={status === 'loading' || !email}
                                    className="bg-zinc-200 dark:bg-zinc-800 text-foreground hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md p-2 m-1 transition-colors"
                                >
                                    {status === 'loading' ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                        {status === 'error' && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute top-full left-0 mt-2 text-xs text-destructive"
                            >
                                {message}
                            </motion.p>
                        )}
                        <p className="mt-3 text-[10px] text-muted-foreground text-center">
                            No spam. Unsubscribe at any time.
                        </p>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
