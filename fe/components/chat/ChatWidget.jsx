import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Chào cậu! Tớ là Khoa GPT. Cậu muốn hỏi gì về projects hay kinh nghiệm của tớ không? ^^' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: JSON.stringify(messages.slice(-10)) // Send last 10 messages for context
                })
            });

            if (!res.ok) throw new Error('Failed to fetch response');

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! I seem to have lost connection to my brain. Please try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-24 sm:right-8">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] shadow-2xl rounded-2xl overflow-hidden border border-border/50 bg-background/80 backdrop-blur-xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-border/50 bg-primary/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <div className="w-2 h-2 absolute top-0 right-0 bg-green-500 rounded-full animate-pulse" />
                                    <div className="p-0.5 bg-primary/10 rounded-full overflow-hidden w-9 h-9 border border-primary/20">
                                        <img src="https://github.com/yunkhngn.png" alt="Khoa AI" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Khoa AI</h3>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Khoa GPT</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => setIsOpen(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
                            {messages.map((msg, idx) => (
                                <div key={idx} className={cn("flex gap-3 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-border/50",
                                        msg.role === 'user' ? "bg-muted" : "bg-primary/10"
                                    )}>
                                        {msg.role === 'user' ? <img src="/image/cat.jpg" alt="User" className="w-full h-full object-cover" /> : <img src="https://github.com/yunkhngn.png" alt="AI" className="w-full h-full object-cover" />}
                                    </div>
                                    <div className={cn(
                                        "rounded-2xl px-4 py-2 text-sm shadow-sm",
                                        msg.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted/50 rounded-tl-sm border border-border/50"
                                    )}>
                                        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                            <ReactMarkdown>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                                        <img src="https://github.com/yunkhngn.png" alt="AI" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-2 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-3 border-t border-border/50 bg-background/50">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me anything..."
                                    className="w-full bg-muted/50 border-none rounded-full py-2.5 pl-4 pr-12 text-sm focus:ring-1 focus:ring-primary/50 transition-all outline-none"
                                    disabled={isLoading}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-1 w-8 h-8 rounded-full"
                                >
                                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3 ml-0.5" />}
                                </Button>
                            </div>
                            <div className="text-[10px] text-center text-muted-foreground/50 mt-2">
                                AI can make mistakes. Please verify important info.
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300",
                    isOpen ? "bg-destructive text-destructive-foreground rotate-90" : "bg-primary text-primary-foreground"
                )}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
            </motion.button>
        </div>
    );
}
