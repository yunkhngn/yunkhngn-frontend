import { useState, useRef, useEffect } from 'react';
import { readNestJson } from '@/lib/api/readJson';
import Link from 'next/link';
import Image from 'next/image';
import { X, Send, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatWindow({ isOpen, onClose }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Chào cậu! Tớ là Khoa Nguyễn. Cậu muốn hỏi gì về tớ, projects hay kinh nghiệm của tớ không? Feel free to ask ^^!' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [forbiddenWords, setForbiddenWords] = useState([]);

    // Safety & Anti-spam refs
    const lastSentTime = useRef(0);
    const lastMessageContent = useRef('');

    const MAX_WORD_COUNT = 100;
    const RATE_LIMIT_MS = 3000; // 3 seconds
    const scrollRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current && isOpen) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // Fetch forbidden words settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
                if (res.ok) {
                    const data = await readNestJson(res);
                    const forbiddenSetting = data.find(s => s.settingTitle === 'chat_forbidden_words');
                    if (forbiddenSetting && forbiddenSetting.content) {
                        // Support comma or newline separated
                        const words = forbiddenSetting.content.split(/[,\n]+/).map(w => w.trim().toLowerCase()).filter(Boolean);
                        setForbiddenWords(words);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch chat settings", error);
            }
        };

        if (isOpen) {
            fetchSettings();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();

        // 1. Check Word Limit
        const wordCount = userMessage.split(/\s+/).length;
        if (wordCount > MAX_WORD_COUNT) {
            toast.error(`Message is too long! Please keep it under ${MAX_WORD_COUNT} words. (Current: ${wordCount})`);
            return;
        }

        // 2. Anti-Spam: Rate Limiting
        const now = Date.now();
        if (now - lastSentTime.current < RATE_LIMIT_MS) {
            toast.warning("You are sending messages too fast. Please slow down.");
            return;
        }

        // 3. Anti-Spam: Duplicate Message
        if (userMessage === lastMessageContent.current) {
            toast.warning("You just sent this message. Please say something new.");
            return;
        }

        // 4. Forbidden Words Filter
        const lowerCaseMessage = userMessage.toLowerCase();
        const foundForbiddenWord = forbiddenWords.find(word => lowerCaseMessage.includes(word));
        if (foundForbiddenWord) {
            toast.error("Your message contains prohibited words. Please be polite.");
            return;
        }

        // Passed all checks
        lastSentTime.current = now;
        lastMessageContent.current = userMessage;

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

            const data = await readNestJson(res);
            setMessages(prev => [...prev, { role: 'assistant', content: data.response, imageUrl: data.imageUrl || null }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! Mất kết nối tới não tớ rồi cậu ơi. Thử lại sau nhé!' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        width: isExpanded ? 'calc(100vw - 2rem)' : undefined,
                        height: isExpanded ? 'calc(100vh - 2rem)' : undefined,
                        right: isExpanded ? '1rem' : undefined,
                        bottom: isExpanded ? '1rem' : undefined,
                    }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                        "fixed z-[70] shadow-2xl rounded-2xl overflow-hidden border border-border/50 bg-background/80 backdrop-blur-xl flex flex-col transition-all duration-300",
                        isExpanded ? "w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] right-4 bottom-4 md:right-8 md:bottom-8" : "bottom-24 right-4 sm:right-8 w-[calc(100vw-2rem)] sm:w-[400px] h-[550px] max-h-[70vh]"
                    )}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-border/50 bg-primary/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="w-2 h-2 absolute top-0 right-0 bg-green-500 rounded-full animate-pulse" />
                                <div className="relative p-0.5 bg-primary/10 rounded-full overflow-hidden w-9 h-9 border border-primary/20">
                                    <Image src="https://github.com/yunkhngn.png" alt="Khoa AI" fill sizes="36px" className="object-cover" />
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">Khoa Nguyễn</h3>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Khoa Phiên bản AI</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted" onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Collapse" : "Expand"}>
                                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={cn("flex gap-3 max-w-[85%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                                <div className={cn(
                                    "relative w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-border/50",
                                    msg.role === 'user' ? "bg-muted" : "bg-primary/10"
                                )}>
                                    {msg.role === 'user' ? <Image src="/image/cat.jpg" alt="User" fill sizes="32px" className="object-cover" /> : <Image src="https://github.com/yunkhngn.png" alt="AI" fill sizes="32px" className="object-cover" />}
                                </div>
                                <div className={cn(
                                    "rounded-2xl px-4 py-2 text-sm shadow-sm",
                                    msg.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted/50 rounded-tl-sm border border-border/50"
                                )}>
                                    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                        <ReactMarkdown
                                            components={{
                                                a: ({ node, href, children, ...props }) => {
                                                    const isInternal = href && (href.startsWith('/') || href.startsWith('#'));
                                                    if (isInternal) {
                                                        return (
                                                            <Link href={href} className="text-blue-500 hover:underline" {...props}>
                                                                {children}
                                                            </Link>
                                                        );
                                                    }
                                                    return (
                                                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" {...props}>
                                                            {children}
                                                        </a>
                                                    );
                                                }
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                        {msg.imageUrl && (
                                            <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className="block mt-2">
                                                <Image
                                                    src={msg.imageUrl}
                                                    alt="Generated image"
                                                    width={400}
                                                    height={400}
                                                    className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity border border-border/50"
                                                    unoptimized
                                                />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="relative w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                                    <Image src="https://github.com/yunkhngn.png" alt="AI" fill sizes="32px" className="object-cover" />
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
                    <form onSubmit={handleSubmit} className="p-3 border-t border-border/50 bg-background/50 relative">
                        {input.length > 30 && (
                            <div className={cn(
                                "absolute -top-6 right-4 text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md border",
                                input.split(/\s+/).length > MAX_WORD_COUNT ? "bg-destructive/20 text-destructive border-destructive/50 animate-pulse" : "bg-muted/50 text-muted-foreground border-border/50"
                            )}>
                                {input.split(/\s+/).filter(Boolean).length}/{MAX_WORD_COUNT} words
                            </div>
                        )}
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
                            Khoa GPT can make mistakes. Please verify important info. He&apos;s smart but dumb!
                        </div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
