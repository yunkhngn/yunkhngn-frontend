import { useState } from 'react';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

            const data = await res.json();

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
                        <p className="text-sm text-zinc-400 mt-1">{message}</p>
                        <button
                            onClick={() => setStatus('idle')}
                            className="mt-4 text-xs text-zinc-500 hover:text-zinc-300 underline"
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
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative flex items-center bg-black border border-zinc-800 rounded-lg p-1 pr-1.5 focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition shadow-xl">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-zinc-200 placeholder-zinc-500 px-3 py-2"
                                    disabled={status === 'loading'}
                                />
                                <button
                                    type="submit"
                                    disabled={status === 'loading' || !email}
                                    className="bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md p-2 transition-colors"
                                >
                                    {status === 'loading' ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                        {status === 'error' && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute top-full left-0 mt-2 text-xs text-red-500"
                            >
                                {message}
                            </motion.p>
                        )}
                        <p className="mt-3 text-[10px] text-zinc-500 text-center">
                            No spam. Unsubscribe at any time.
                        </p>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    );
}
