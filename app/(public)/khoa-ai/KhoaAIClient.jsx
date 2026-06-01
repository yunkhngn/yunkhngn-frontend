'use client';

import { useState, useRef, useEffect } from 'react';
import { readCachedSettings } from '@/lib/settingsCache';
import { motion } from 'framer-motion';
import HeroBackground from '@/components/home/HeroBackground';
import { readNestJson } from '@/lib/api/readJson';
import Link from 'next/link';
import Image from 'next/image';
import { Send, Loader2, Bot, Facebook, Instagram, Github } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/Textarea';
import TarotCards from '@/components/chat/TarotCards';

export default function KhoaAIClient() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Chào cậu! Tớ là Khoa Nguyễn. Cậu muốn hỏi gì về tớ, projects hay kinh nghiệm của tớ không? Feel free to ask ^^!' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [forbiddenWords, setForbiddenWords] = useState([]);
    const [avatarUrl, setAvatarUrl] = useState(() => readCachedSettings()?.avatar || 'https://github.com/yunkhngn.png');

    const lastSentTime = useRef(0);
    const lastMessageContent = useRef('');
    const messagesEndRef = useRef(null);

    const MAX_WORD_COUNT = 100;
    const RATE_LIMIT_MS = 3000;

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    useEffect(() => {
        const controller = new AbortController();
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
                    signal: controller.signal,
                });
                if (res.ok) {
                    const data = await readNestJson(res);
                    const forbiddenSetting = data.find(s => s.settingTitle === 'chat_forbidden_words');
                    if (forbiddenSetting && forbiddenSetting.content) {
                        const words = forbiddenSetting.content.split(/[,\n]+/).map(w => w.trim().toLowerCase()).filter(Boolean);
                        setForbiddenWords(words);
                    }
                    const avatarSetting = data.find(s => s.settingTitle === 'avatar');
                    if (avatarSetting?.content) setAvatarUrl(avatarSetting.content);
                }
            } catch (error) {
                if (error?.name === 'AbortError') return;
                console.error("Failed to fetch chat settings", error);
            }
        };
        fetchSettings();
        return () => controller.abort();
    }, []);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        const wordCount = userMessage.split(/\s+/).length;
        if (wordCount > MAX_WORD_COUNT) {
            toast.error(`Message is too long! Please keep it under ${MAX_WORD_COUNT} words.`);
            return;
        }

        const now = Date.now();
        if (now - lastSentTime.current < RATE_LIMIT_MS) {
            toast.warning("You are sending messages too fast. Please slow down.");
            return;
        }

        if (userMessage === lastMessageContent.current) {
            toast.warning("You just sent this message. Please say something new.");
            return;
        }

        const lowerCaseMessage = userMessage.toLowerCase();
        const foundForbiddenWord = forbiddenWords.find(word => lowerCaseMessage.includes(word));
        if (foundForbiddenWord) {
            toast.error("Your message contains prohibited words. Please be polite.");
            return;
        }

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
                    history: JSON.stringify(messages.slice(-10))
                })
            });

            if (!res.ok) throw new Error('Failed to fetch response');

            const data = await readNestJson(res);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response,
                imageUrl: data.imageUrl || null,
                tarotCards: data.tarotCards || null
            }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Oops! Mất kết nối tới não tớ rồi cậu ơi. Thử lại sau nhé!' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };
    return (
        <div className="h-[calc(100dvh-64px)] w-full flex relative overflow-hidden bg-background">

            {/* Left Side - Chat Area (70%) */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 lg:flex-[7] flex flex-col relative bg-background border-r border-border z-10"
            >
                {/* Header */}
                <div className="flex-none border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border shrink-0">
                            <Image src={avatarUrl} alt="Khoa AI" fill sizes="40px" className="object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="font-semibold text-sm">Khoa Nguyễn</h2>
                            <p className="text-[10px] text-muted-foreground tracking-wider uppercase flex items-center gap-1">
                                <Bot className="w-3 h-3 text-primary" /> Phiên bản AI đang trực tuyến
                            </p>
                        </div>
                    </div>
                    {/* Fake action icons like Messenger */}
                    <div className="flex items-center gap-4 text-primary px-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:opacity-80"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:opacity-80"><polygon points="23 7 16 12 23 17 23 7" /><rect width="15" height="14" x="1" y="5" rx="2" ry="2" /></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:opacity-80"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto min-h-0 w-full flex flex-col scroll-smooth">
                    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4 pb-0">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={cn("flex gap-4 w-full", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>

                                {/* Avatar */}
                                <div className="shrink-0 relative w-8 h-8 rounded-sm overflow-hidden border border-border/50">
                                    {msg.role === 'user' ? (
                                        <Image src="/image/cat.jpg" alt="You" fill sizes="32px" className="object-cover" />
                                    ) : (
                                        <Image src={avatarUrl} alt="Khoa AI" fill sizes="32px" className="object-cover" />
                                    )}
                                </div>

                                {/* Message Content */}
                                <div className={cn(
                                    "flex flex-col gap-2 max-w-[85%] sm:max-w-[75%]",
                                    msg.role === 'user' ? "items-end" : "items-start"
                                )}>
                                    <span className="text-xs font-semibold text-muted-foreground px-1">
                                        {msg.role === 'user' ? 'You' : 'Khoa AI'}
                                    </span>
                                    <div className={cn(
                                        "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                                        msg.role === 'user'
                                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                                            : "bg-muted/50 rounded-tl-sm border border-border"
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
                                                <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer" className="block mt-4">
                                                    <Image
                                                        src={msg.imageUrl}
                                                        alt="Generated content"
                                                        width={500}
                                                        height={500}
                                                        className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity border border-border"
                                                        unoptimized
                                                    />
                                                </a>
                                            )}
                                            {msg.tarotCards && (
                                                <TarotCards cards={msg.tarotCards} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-4 w-full flex-row">
                                <div className="shrink-0 relative w-8 h-8 rounded-sm overflow-hidden border border-border/50">
                                    <Image src={avatarUrl} alt="Khoa AI" fill sizes="32px" className="object-cover" />
                                </div>
                                <div className="flex flex-col gap-2 items-start">
                                    <span className="text-xs font-semibold text-muted-foreground px-1">Khoa AI</span>
                                    <div className="bg-muted/50 rounded-2xl rounded-tl-sm border border-border px-4 py-4 flex items-center gap-1.5 h-[44px]">
                                        <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Invisible Spacer to push content above the input box */}
                        <div ref={messagesEndRef} className="h-40"></div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="flex-none bg-background border-t border-border p-4">
                    <div className="w-full max-w-4xl mx-auto relative">
                        <form onSubmit={handleSubmit} className="relative flex flex-col w-full bg-muted/30 border border-border rounded-2xl shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 transition-all">

                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Message Khoa AI..."
                                className="min-h-[52px] max-h-[150px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 py-3.5 pl-4 pr-12 text-sm leading-relaxed scrollbar-thin"
                                disabled={isLoading}
                                rows={1}
                            />

                            <div className="absolute right-1.5 bottom-1.5">
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!input.trim() || isLoading}
                                    className={cn(
                                        "w-9 h-9 rounded-xl transition-all",
                                        input.trim() ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground/50 hover:bg-muted-foreground/30"
                                    )}
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                                </Button>
                            </div>
                        </form>

                        <div className="text-center mt-2 flex items-center justify-between px-1">
                            <span className="text-[10px] text-muted-foreground/60 font-medium">
                                AI có thể mắc lỗi.
                            </span>
                            {input.split(/\s+/).length > 1 && (
                                <span className={cn(
                                    "text-[10px] font-mono",
                                    input.split(/\s+/).filter(Boolean).length > MAX_WORD_COUNT ? "text-destructive" : "text-muted-foreground/40"
                                )}>
                                    {input.split(/\s+/).filter(Boolean).length}/{MAX_WORD_COUNT}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Right Side - Messenger Details Sidebar (30%) */}
            <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="hidden lg:flex lg:flex-[3] max-w-[400px] flex-col overflow-y-auto bg-muted/5 z-0 border-l border-border relative"
            >
                <HeroBackground subtle />
                {/* Profile Info */}
                <div className="flex flex-col items-center text-center p-8 border-b border-border">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border shadow-sm mb-4">
                        <Image src={avatarUrl} alt="Khoa AI" fill sizes="96px" className="object-cover" />
                    </div>
                    <h2 className="font-bold text-xl mb-1">Khoa Nguyễn</h2>
                    <p className="text-xs text-muted-foreground mb-6">yun.khngn • Phiên bản AI</p>

                    <div className="flex gap-6">
                        <a href="https://facebook.com/yunkhngn" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                                <Facebook className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground">Facebook</span>
                        </a>
                        <a href="https://instagram.com/yun.khngn" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                                <Instagram className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground">Instagram</span>
                        </a>
                        <a href="https://github.com/yunkhngn" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                                <Github className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground">GitHub</span>
                        </a>
                    </div>
                </div>

                {/* Fake Accordions */}
                <div className="p-3 flex flex-col gap-1">
                    <div className="px-3 py-3 rounded-lg hover:bg-muted/50 cursor-pointer flex items-center justify-between transition-colors">
                        <span className="text-sm font-medium">Tùy chỉnh đoạn chat</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                    <div className="px-3 py-3 rounded-lg hover:bg-muted/50 cursor-pointer flex items-center justify-between transition-colors">
                        <span className="text-sm font-medium">File phương tiện, file và liên kết</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                    <div className="px-3 py-3 rounded-lg hover:bg-muted/50 cursor-pointer flex items-center justify-between transition-colors">
                        <span className="text-sm font-medium">Quyền riêng tư & hỗ trợ</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                </div>
            </motion.div>

        </div>
    );
}
