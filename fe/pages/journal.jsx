import { useState, useEffect } from 'react';
import Layout from '@/components/template/Default/Layout';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Smile, Coffee, Code, Zap, Heart, Flame, Moon, Sun, CloudRain, Music, Sparkles, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

const MOOD_MAP = {
    happy: { icon: Smile, label: 'Vui vẻ', color: 'text-yellow-500' },
    coffee: { icon: Coffee, label: 'Cà phê', color: 'text-amber-600' },
    coding: { icon: Code, label: 'Coding', color: 'text-green-500' },
    productive: { icon: Zap, label: 'Productive', color: 'text-blue-500' },
    love: { icon: Heart, label: 'Yêu đời', color: 'text-pink-500' },
    fire: { icon: Flame, label: 'On Fire', color: 'text-orange-500' },
    tired: { icon: Moon, label: 'Mệt', color: 'text-indigo-400' },
    chill: { icon: Sun, label: 'Chill', color: 'text-yellow-400' },
    rainy: { icon: CloudRain, label: 'Buồn', color: 'text-slate-400' },
    music: { icon: Music, label: 'Music', color: 'text-purple-500' },
    inspired: { icon: Sparkles, label: 'Cảm hứng', color: 'text-cyan-400' },
    reading: { icon: BookOpen, label: 'Đọc sách', color: 'text-emerald-500' },
};

function JournalEntry({ entry }) {
    const mood = MOOD_MAP[entry.mood] || MOOD_MAP.happy;
    const MoodIcon = mood.icon;
    const createdAt = new Date(entry.createdAt);
    const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true, locale: vi });
    const fullDate = format(createdAt, "d MMM yyyy 'lúc' HH:mm", { locale: vi });

    return (
        <article className="group relative">
            {/* Timeline dot */}
            <div className="absolute -left-[29px] top-3 w-3 h-3 rounded-full border-2 border-primary bg-background group-hover:bg-primary transition-colors hidden md:block" />

            <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg bg-muted ${mood.color}`}>
                            <MoodIcon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{mood.label}</span>
                    </div>
                    <time className="text-xs text-muted-foreground" title={fullDate}>
                        {timeAgo}
                    </time>
                </div>

                {/* Content */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                </div>

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/30">
                        {entry.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs rounded-full font-normal px-2.5 py-0.5">
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}

function JournalSkeleton() {
    return (
        <div className="bg-card/50 border border-border/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-7 rounded-lg" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    );
}

export default function JournalPage() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMood, setSelectedMood] = useState(null);

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/journals`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setEntries(data);
            } catch (error) {
                console.error('Error fetching journal entries:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEntries();
    }, []);

    const filteredEntries = selectedMood
        ? entries.filter(e => e.mood === selectedMood)
        : entries;

    // Group entries by date
    const groupedEntries = filteredEntries.reduce((groups, entry) => {
        const date = format(new Date(entry.createdAt), 'yyyy-MM-dd');
        if (!groups[date]) groups[date] = [];
        groups[date].push(entry);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));

    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
            {/* Hero */}
            <div className="flex flex-col items-center text-center mb-16 space-y-4">
                <div className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
                    Daily Journal
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-serif">
                    Thoughts & Notes
                </h1>
                <p className="text-muted-foreground max-w-lg text-lg">
                    Những suy nghĩ ngắn, ý tưởng, TIL, và chuyện code hàng ngày.
                </p>
            </div>

            {/* Mood Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
                <button
                    onClick={() => setSelectedMood(null)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedMood === null
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Tất cả
                </button>
                {Object.entries(MOOD_MAP).map(([key, { icon: Icon, label, color }]) => (
                    <button
                        key={key}
                        onClick={() => setSelectedMood(selectedMood === key ? null : key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedMood === key
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Icon className={`h-3 w-3 ${selectedMood === key ? '' : color}`} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Timeline Feed */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <JournalSkeleton key={i} />
                    ))}
                </div>
            ) : sortedDates.length > 0 ? (
                <div className="space-y-10">
                    {sortedDates.map(date => (
                        <div key={date}>
                            {/* Date Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-px flex-1 bg-border" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {format(new Date(date), 'EEEE, d MMMM yyyy', { locale: vi })}
                                </span>
                                <div className="h-px flex-1 bg-border" />
                            </div>

                            {/* Entries for this date */}
                            <div className="md:border-l-2 md:border-border md:ml-3 md:pl-6 space-y-4">
                                {groupedEntries[date].map(entry => (
                                    <JournalEntry key={entry.id} entry={entry} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">Chưa có gì ở đây cả...</p>
                    <p className="text-muted-foreground/60 text-sm mt-1">Hãy quay lại sau nhé!</p>
                </div>
            )}
        </div>
    );
}

JournalPage.getLayout = function getLayout(page) {
    return (
        <Layout
            title="Journal - Khoa Nguyễn"
            description="Suy nghĩ, ý tưởng, và chuyện code hàng ngày của Khoa Nguyễn."
        >
            {page}
        </Layout>
    );
};
