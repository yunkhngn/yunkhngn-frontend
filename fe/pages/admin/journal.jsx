import { useState, useEffect } from 'react';
import AdminLayout from '@/components/template/Admin/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Search, Smile, Coffee, Code, Zap, Heart, Flame, Moon, Sun, CloudRain, Music, Sparkles, BookOpen, X, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import axios from 'axios';

const MOOD_OPTIONS = [
    { key: 'happy', icon: Smile, label: 'Vui vẻ', color: 'text-yellow-500' },
    { key: 'coffee', icon: Coffee, label: 'Cà phê', color: 'text-amber-600' },
    { key: 'coding', icon: Code, label: 'Coding', color: 'text-green-500' },
    { key: 'productive', icon: Zap, label: 'Productive', color: 'text-blue-500' },
    { key: 'love', icon: Heart, label: 'Yêu đời', color: 'text-pink-500' },
    { key: 'fire', icon: Flame, label: 'On Fire', color: 'text-orange-500' },
    { key: 'tired', icon: Moon, label: 'Mệt', color: 'text-indigo-400' },
    { key: 'chill', icon: Sun, label: 'Chill', color: 'text-yellow-400' },
    { key: 'rainy', icon: CloudRain, label: 'Buồn', color: 'text-slate-400' },
    { key: 'music', icon: Music, label: 'Music', color: 'text-purple-500' },
    { key: 'inspired', icon: Sparkles, label: 'Cảm hứng', color: 'text-cyan-400' },
    { key: 'reading', icon: BookOpen, label: 'Đọc sách', color: 'text-emerald-500' },
];

export default function AdminJournal() {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Compose state
    const [content, setContent] = useState('');
    const [mood, setMood] = useState('coding');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComposeOpen, setIsComposeOpen] = useState(false);

    // Delete modal
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchEntries();
    }, [user]);

    const fetchEntries = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/journals`);
            setEntries(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch journal entries');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            const token = await user.getIdToken();
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/journals`,
                { content: content.trim(), mood, tags },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setEntries([res.data, ...entries]);
            setContent('');
            setTags([]);
            setTagInput('');
            setMood('coding');
            setIsComposeOpen(false);
            toast.success('Journal entry posted! 🎉');
        } catch (error) {
            console.error(error);
            toast.error('Failed to post entry');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const token = await user.getIdToken();
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/journals/${deleteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEntries(entries.filter(e => e.id !== deleteId));
            toast.success('Entry deleted');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete entry');
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        }
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            const newTag = tagInput.trim().replace('#', '');
            if (!tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const filteredEntries = entries.filter(entry =>
        entry.content?.toLowerCase().includes(search.toLowerCase()) ||
        entry.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

    const selectedMoodOption = MOOD_OPTIONS.find(m => m.key === mood);

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
                        <p className="text-muted-foreground">Micro-blog & daily thoughts</p>
                    </div>
                    <Button onClick={() => setIsComposeOpen(!isComposeOpen)}>
                        {isComposeOpen ? (
                            <><X className="mr-2 h-4 w-4" /> Close</>
                        ) : (
                            <><Plus className="mr-2 h-4 w-4" /> New Entry</>
                        )}
                    </Button>
                </div>

                {/* Compose */}
                {isComposeOpen && (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-card border rounded-2xl p-5 space-y-4 animate-in slide-in-from-top-2 shadow-sm"
                    >
                        {/* Content textarea */}
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's on your mind? 💭"
                            className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/50 text-base min-h-[100px] focus:ring-0"
                            autoFocus
                        />

                        {/* Tags display */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {tags.map(tag => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="text-xs flex items-center gap-1 pr-1 cursor-pointer hover:bg-destructive/10"
                                        onClick={() => removeTag(tag)}
                                    >
                                        #{tag}
                                        <X className="h-3 w-3" />
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t pt-4 gap-4">
                            {/* Left: Mood + Tags */}
                            <div className="flex items-center gap-2 flex-1 flex-wrap">
                                {/* Mood selector */}
                                <div className="flex items-center gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
                                    {MOOD_OPTIONS.map((m) => {
                                        const Icon = m.icon;
                                        return (
                                            <button
                                                key={m.key}
                                                type="button"
                                                onClick={() => setMood(m.key)}
                                                className={`p-1.5 rounded-md transition-all ${mood === m.key ? 'bg-background shadow-sm' : 'hover:bg-background/50'
                                                    }`}
                                                title={m.label}
                                            >
                                                <Icon className={`h-4 w-4 ${m.color}`} />
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Tag input */}
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    placeholder="Add tag (Enter)"
                                    className="h-8 w-32 text-xs"
                                />
                            </div>

                            {/* Right: Selected mood & Submit */}
                            <div className="flex items-center gap-3 shrink-0">
                                {selectedMoodOption && (
                                    <span className="text-xs text-muted-foreground hidden sm:inline">
                                        Feeling: {selectedMoodOption.label}
                                    </span>
                                )}
                                <Button
                                    type="submit"
                                    disabled={!content.trim() || isSubmitting}
                                    size="sm"
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    {isSubmitting ? 'Posting...' : 'Post'}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search entries..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{entries.length} entries total</span>
                    <span>•</span>
                    <span>{filteredEntries.length} shown</span>
                </div>

                {/* Entries list */}
                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : filteredEntries.length > 0 ? (
                    <div className="space-y-3">
                        {filteredEntries.map(entry => {
                            const moodInfo = MOOD_OPTIONS.find(m => m.key === entry.mood);
                            const MoodIcon = moodInfo?.icon || Smile;
                            const createdAt = new Date(entry.createdAt);
                            const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true, locale: vi });
                            const fullDate = format(createdAt, "d MMM yyyy 'lúc' HH:mm", { locale: vi });

                            return (
                                <div
                                    key={entry.id}
                                    className="group bg-card border rounded-xl p-4 hover:shadow-sm transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            {/* Mood & Time */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <MoodIcon className={`h-4 w-4 ${moodInfo?.color || ''}`} />
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {moodInfo?.label || 'Unknown'}
                                                </span>
                                                <span className="text-xs text-muted-foreground/50">•</span>
                                                <time className="text-xs text-muted-foreground" title={fullDate}>
                                                    {timeAgo}
                                                </time>
                                            </div>

                                            {/* Content */}
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{entry.content}</p>

                                            {/* Tags */}
                                            {entry.tags && entry.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {entry.tags.map((tag, i) => (
                                                        <Badge key={i} variant="outline" className="text-xs rounded-full font-normal">
                                                            #{tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                            onClick={() => handleDelete(entry.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        {search ? 'No matching entries found.' : 'No entries yet. Write your first thought!'}
                    </div>
                )}

                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Delete Entry"
                    description="Are you sure you want to delete this journal entry? This action cannot be undone."
                />
            </div>
        </AdminLayout>
    );
}
