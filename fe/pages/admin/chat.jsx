import AdminLayout from "@/components/template/Admin/Layout";
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";
import { Send, Bot, User, Loader2, Sparkles, Trash2, Languages, Zap, PenTool, BarChart3 } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function AdminChat() {
    const { user } = useAuth();
    // Initialize with NO visible messages to show Welcome Screen first
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('vi');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const savedLang = localStorage.getItem('chat_language');
        if (savedLang) {
            setLanguage(savedLang);
        }
    }, []);

    const handleLanguageChange = (value) => {
        setLanguage(value);
        localStorage.setItem('chat_language', value);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        // Add user message immediately
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const token = await user.getIdToken();

            // Prepare history: map current visible messages + system prompt if needed (handled by backend)
            const history = messages.map(m => ({
                role: m.role,
                content: m.content
            }));

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMessage,
                    history: history,
                    language: language
                })
            });

            if (!res.ok) throw new Error('Failed to send message');

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'model', content: data.response }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', content: 'Sorry, I encountered an error processing your request.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearChat = () => {
        setMessages([]);
    };

    const FeatureCard = ({ icon: Icon, title, description }) => (
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );

    return (
        <AdminLayout title="AI Chatbot">
            <div className="h-[calc(100vh-8rem)] flex flex-col relative">

                {/* Header Controls (Absolute top-right or integrated) */}
                <div className="absolute top-0 right-0 z-10 flex items-center gap-2 p-4">
                    <Select value={language} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-[140px] bg-background/80 backdrop-blur-sm">
                            <Languages className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="vi">Tiếng Việt</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                    </Select>
                    {messages.length > 0 && (
                        <Button variant="outline" onClick={handleClearChat} size="icon" className="bg-background/80 backdrop-blur-sm">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
                    <div className="max-w-4xl mx-auto min-h-full flex flex-col">

                        {messages.length === 0 ? (
                            /* Welcome State */
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-10">
                                <div className="space-y-2 max-w-2xl">
                                    <div className="relative mb-8">
                                        <div className="h-24 w-24 mx-auto bg-gradient-to-tr from-blue-100 via-purple-100 to-blue-50 dark:from-blue-900/40 dark:via-purple-900/40 dark:to-blue-900/40 rounded-full flex items-center justify-center shadow-sm">
                                            <Bot className="h-10 w-10 text-blue-600 dark:text-blue-400 fill-blue-600/20" />
                                        </div>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                                        Good Morning, {user?.displayName?.split(' ')[0] || 'Admin'}
                                    </h1>
                                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                                        How Can I <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Assist You Today?</span>
                                    </h1>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left">
                                    <FeatureCard
                                        icon={BarChart3}
                                        title="Content Analysis"
                                        description="Analyze your blogs and projects to find trends and gaps."
                                    />
                                    <FeatureCard
                                        icon={PenTool}
                                        title="Writing Assistant"
                                        description="Draft new blog posts or polish existing content."
                                    />
                                    <FeatureCard
                                        icon={Zap}
                                        title="System Insights"
                                        description="Ask about your database stats and recent activities."
                                    />
                                </div>
                            </div>
                        ) : (
                            /* Chat History */
                            <div className="space-y-6 pb-24 pt-10">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.role === 'model' && (
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-100 via-purple-100 to-blue-50 dark:from-blue-900/40 dark:via-purple-900/40 dark:to-blue-900/40 flex items-center justify-center flex-shrink-0 shadow-sm border border-white/20">
                                                <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 fill-blue-600/20" />
                                            </div>
                                        )}

                                        <div
                                            className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-card border'
                                                }`}
                                        >
                                            {msg.role === 'model' ? (
                                                <div className="prose dark:prose-invert text-sm max-w-none">
                                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            )}
                                        </div>

                                        {msg.role === 'user' && (
                                            <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0 shadow-sm border border-gray-200 dark:border-gray-700">
                                                {user?.photoURL ? (
                                                    <img
                                                        src={user.photoURL}
                                                        alt={user.displayName || 'User'}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-primary flex items-center justify-center">
                                                        <User className="h-5 w-5 text-primary-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex gap-4 justify-start">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <Bot className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="bg-card border rounded-2xl p-4 flex items-center shadow-sm">
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                            <span className="ml-2 text-sm text-muted-foreground">Thinking...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Input Area */}
                <div className="p-4 md:p-8 pt-0">
                    <div className="max-w-4xl mx-auto">
                        <form
                            onSubmit={handleSend}
                            className="relative flex items-center p-2 bg-background border-2 border-primary/20 focus-within:border-primary rounded-2xl shadow-lg transition-all duration-300"
                        >
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me anything..."
                                disabled={loading}
                                className="flex-1 border-none shadow-none focus-visible:ring-0 text-base py-6 px-4 bg-transparent"
                            />
                            <Button
                                type="submit"
                                disabled={loading || !input.trim()}
                                size="icon"
                                className="h-10 w-10 rounded-xl mr-1"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                <span className="sr-only">Send</span>
                            </Button>
                        </form>
                        <div className="text-center mt-2">
                            <p className="text-xs text-muted-foreground">
                                System Chatbot may display inaccurate info, so please double check the response.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
