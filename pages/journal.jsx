import { useState, useEffect, useRef, useCallback } from 'react';
import { readNestJson } from '@/lib/api/readJson';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/template/Default/Layout';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Smile, Image as ImageIcon, X, Loader2, Plus, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import ReactMarkdown from 'react-markdown';
import {
    MoreVertical,
    Heart,
    MessageCircle,
    Copy,
    Trash2,
    Edit3,
    BookOpen
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ICON_MAP, DEFAULT_MOODS } from '@/lib/moods';
import api from '@/lib/api/client';
import { toast } from 'sonner';
import Image from 'next/image';
import { getOptimizedUrl, getBlurUrl } from '@/lib/cloudinary';



function JournalEntry({ entry, moodInfo, moods, avatarUrl, onEdit, onDelete, onReaction, onViewImage, onReply, isReply = false }) {
    const { user, signInAnonymously } = useAuth();
    const isOwner = user?.role === 'ADMIN';
    const [isReacting, setIsReacting] = useState(false);

    // Derive mood info if not provided directly (for replies)
    const currentMoodInfo = moodInfo || (moods && moods.find(m => m.key === entry.mood)) || DEFAULT_MOODS[0];

    const handleCopy = () => {
        navigator.clipboard.writeText(entry.content);
        toast.success("Copied to clipboard");
    }

    const handleReaction = async () => {
        setIsReacting(true);
        try {
            let currentUser = user;
            if (!currentUser) {
                try {
                    const result = await signInAnonymously();
                    currentUser = result.user;
                } catch (error) {
                    console.error("Anonymous login failed", error);
                    toast.error("Login failed");
                    setIsReacting(false);
                    return;
                }
            }

            if (currentUser) {
                await onReaction(entry.id, 'heart');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsReacting(false);
        }
    }

    const hasReacted = entry.reactions?.some(r => r.uid === user?.uid);
    const reactionCount = entry.reactions?.length || 0;

    return (
        <article className={`group relative ${isReply ? 'mt-4' : 'pl-8 pb-8 last:pb-0'}`}>
            {/* Timeline connector - only for top level */}
            {!isReply && <div className="absolute left-[15px] top-[30px] bottom-0 w-px bg-border group-last:hidden" />}

            {/* Timeline dot - only for top level */}
            {!isReply && (
                <div className={`absolute left-0 top-[2px] w-[30px] h-[30px] rounded-full border-2 border-background flex items-center justify-center shrink-0 z-10 ${currentMoodInfo.bg || 'bg-muted'}`}>
                    {(() => {
                        const Icon = ICON_MAP[currentMoodInfo.icon] || Smile;
                        return <Icon className={`h-4 w-4 ${currentMoodInfo.color}`} />;
                    })()}
                </div>
            )}

            <div className={`backdrop-blur-sm border rounded-2xl p-5 transition-all duration-300 ${isReply
                ? 'bg-muted/30 border-border/40'
                : 'bg-card/40 border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5'
                }`}>
                {/* Header with Avatar and Actions */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-muted relative shrink-0">
                            <Image
                                src={avatarUrl || "https://github.com/yunkhngn.png"}
                                alt="yun.khngn"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">yun.khngn</span>
                                {currentMoodInfo.key !== 'happy' && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
                                        is feeling {currentMoodInfo.label.toLowerCase()}
                                    </span>
                                )}
                            </div>
                            <time className="text-[10px] text-muted-foreground/80 block">
                                {format(new Date(entry.createdAt), "HH:mm • d MMM, yyyy")}
                            </time>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {isOwner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleCopy}>
                                        <Copy className="mr-2 h-4 w-4" /> Copy text
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onEdit(entry)}>
                                        <Edit3 className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDelete(entry.id)} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                {/* Content with Markdown */}
                <div className="prose prose-sm dark:prose-invert max-w-none mb-3 break-words text-foreground/90 leading-relaxed font-light">
                    <ReactMarkdown>{entry.content}</ReactMarkdown>
                </div>

                {/* Images Grid (Masonry-like) */}
                {entry.images && entry.images.length > 0 && (
                    <div className={`grid gap-2 mb-4 ${entry.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {entry.images.map((img, idx) => {
                            const blurUrl = getBlurUrl(img);
                            return (
                                <div
                                    key={idx}
                                    className={`relative rounded-xl overflow-hidden border border-border/50 bg-muted aspect-[4/3] ${entry.images.length === 3 && idx === 0 ? 'col-span-2 aspect-[2/1]' : ''
                                        }`}
                                    onClick={() => onViewImage && onViewImage(img)}
                                >
                                    <Image
                                        src={getOptimizedUrl(img, { width: 600 })}
                                        alt={`Attachment ${idx + 1}`}
                                        fill
                                        className="object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                                        placeholder={blurUrl ? 'blur' : 'empty'}
                                        blurDataURL={blurUrl}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer: Tags and Interactions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-2">
                    <div className="flex flex-wrap gap-1.5">
                        {entry.tags && entry.tags.map((tag, i) => (
                            <span key={i} className="text-[10px] text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 px-2 text-xs gap-1.5 hover:bg-muted ${hasReacted ? 'text-red-500 hover:text-red-600 hover:bg-red-500/10' : 'text-muted-foreground'}`}
                            onClick={handleReaction}
                            disabled={isReacting}
                        >
                            <Heart className={`h-3.5 w-3.5 ${hasReacted ? 'fill-current' : ''}`} />
                            {reactionCount > 0 && reactionCount}
                        </Button>

                        {user?.role === 'ADMIN' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs gap-1.5 text-muted-foreground hover:bg-muted"
                                onClick={() => onReply && onReply(entry)}
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                                {entry.replies?.length > 0 && entry.replies.length}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Recursive Replies */}
            {entry.replies && entry.replies.length > 0 && (
                <div className="pl-6 mt-4 space-y-4 border-l-2 border-border/40">
                    {entry.replies.map(reply => (
                        <JournalEntry
                            key={reply.id}
                            entry={reply}
                            moods={moods}
                            avatarUrl={avatarUrl}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onReaction={onReaction}
                            onViewImage={onViewImage}
                            onReply={onReply}
                            isReply={true}
                        />
                    ))}
                </div>
            )}
        </article>
    );
}
function ComposeModal({ moods, onSuccess, avatarUrl, initialData, isOpen, onClose, parentId }) {
    const isEditing = !!initialData;
    const [content, setContent] = useState('');
    const [mood, setMood] = useState('coding');
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    // Sync attachments with initialData
    // Also reset state when modal opens/closes or initialData/parentId changes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setContent(initialData.content || '');
                setMood(initialData.mood || 'coding');
                setTags(initialData.tags || []);
                setAttachments(initialData.images?.map(url => ({ url, isNew: false })) || []);
            } else {
                setContent('');
                setMood('coding');
                setTags([]);
                setAttachments([]);
            }
        }
    }, [isOpen, initialData, parentId]); // Added parentId to dependencies

    const handleAttachmentSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + attachments.length > 4) {
            toast.error("Max 4 images");
            return;
        }
        const newAttachments = files.map(file => ({
            url: URL.createObjectURL(file),
            file,
            isNew: true
        }));
        setAttachments([...attachments, ...newAttachments]);
    };

    const removeAttachment = (index) => {
        const newAtts = [...attachments];
        if (newAtts[index].isNew) URL.revokeObjectURL(newAtts[index].url);
        newAtts.splice(index, 1);
        setAttachments(newAtts);
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

    const removeTag = (tag) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleSubmit = async () => {
        const hasContent = content.trim().length > 0;
        const hasImages = attachments.length > 0;

        if (!hasContent && !hasImages) return;

        setIsSubmitting(true);
        try {
            const uploadedUrls = [];

            // 1. Keep existing URLs
            const existingUrls = attachments.filter(a => !a.isNew).map(a => a.url);
            uploadedUrls.push(...existingUrls);

            // 2. Upload new files
            const newFiles = attachments.filter(a => a.isNew).map(a => a.file);

            if (newFiles.length > 0) {
                const { data: { signature, timestamp, cloudName, apiKey } } = await api.get('/gallery/signature', { params: { folder: 'journal' } });

                for (const file of newFiles) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('api_key', apiKey);
                    formData.append('timestamp', timestamp);
                    formData.append('signature', signature);
                    formData.append('folder', 'journal');

                    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
                    if (!res.ok) throw new Error('Upload failed');
                    const data = await res.json();
                    uploadedUrls.push(data.secure_url);
                }
            }

            const payload = { content, mood, tags, images: uploadedUrls, parentId };

            if (isEditing) {
                await api.patch(`/journals/${initialData.id}`, payload);
                toast.success("Entry updated!");
            } else {
                await api.post('/journals', payload);
                toast.success("Posted!");
            }

            setContent('');
            setAttachments([]);
            setTags([]);
            onClose();
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save entry");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedMoodInfo = moods.find(m => m.key === mood) || moods[0];
    const MoodIcon = ICON_MAP[selectedMoodInfo?.icon] || Smile;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Trigger is handled by parent now, or we allow button inside?
                Actually parent manages state. We don't need Trigger here if isOpen is controlled.
                But user wants "New Entry" button.
                Let's move "New Entry" button out to parent JournalPage to keep it clean.
             */}
            <DialogContent className="w-[95vw] h-[90vh] sm:max-w-none md:w-[800px] md:h-[500px] flex flex-col p-0 gap-0 overflow-hidden rounded-xl">
                <DialogHeader className="p-4 pb-2">
                    <DialogTitle>
                        {isEditing ? 'Edit Entry' : parentId ? 'Reply to Entry' : 'Create Journal Entry'}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-4">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 relative border border-border">
                            <Image src={avatarUrl || "https://github.com/yunkhngn.png"} alt="Avatar" fill className="object-cover" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={parentId ? "Add a reply..." : "What's on your mind?"}
                                className="w-full bg-transparent border-none outline-none resize-none text-foreground text-sm min-h-[200px] p-0 focus:ring-0"
                                autoFocus
                            />

                            {attachments.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                                    {attachments.map((att, i) => (
                                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-border group">
                                            <Image src={att.url} alt="Preview" fill className="object-cover" />
                                            <button onClick={() => removeAttachment(i)} className="absolute top-1 right-1 p-0.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs gap-1 font-normal cursor-pointer" onClick={() => removeTag(tag)}>
                                            #{tag} <X className="h-3 w-3" />
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-3 border-t bg-background/95 backdrop-blur z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-primary transition-colors">
                                <ImageIcon className="h-5 w-5" />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleAttachmentSelect} />

                            <div className="relative group">
                                <button className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${selectedMoodInfo.color} bg-muted/50 hover:bg-muted`}>
                                    <MoodIcon className="h-4 w-4" />
                                    {selectedMoodInfo.label}
                                </button>
                                <div className="absolute bottom-full left-0 mb-2 p-2 bg-popover border rounded-xl shadow-lg grid grid-cols-4 gap-1 w-64 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                    {moods.map(m => {
                                        const Icon = ICON_MAP[m.icon] || Smile;
                                        return (
                                            <button key={m.key} onClick={() => setMood(m.key)} className={`p-2 rounded-lg hover:bg-muted flex flex-col items-center gap-1 ${mood === m.key ? 'bg-muted' : ''}`}>
                                                <Icon className={`h-4 w-4 ${m.color}`} />
                                                <span className="text-[10px] truncate w-full text-center">{m.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="#tag" className="bg-transparent border-none outline-none text-xs w-16 placeholder:text-muted-foreground/50 focus:w-24 transition-all ml-2" />
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`text-xs ${content.trim().split(/\s+/).filter(Boolean).length > 200 ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                                {content.trim().split(/\s+/).filter(Boolean).length}/200
                            </span>
                            <Button
                                onClick={handleSubmit}
                                disabled={(!content.trim() && attachments.length === 0) || isSubmitting || content.trim().split(/\s+/).filter(Boolean).length > 200}
                                size="sm"
                                className="rounded-full"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? "Save" : "Post")}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function JournalSkeleton() {
    return (
        <div className="pl-8 pb-8 relative">
            <div className="absolute left-[3px] top-3 bottom-0 w-[2px] bg-border/50"></div>
            <div className="absolute left-0 top-3 w-2 h-2 rounded-full bg-border"></div>
            <div className="bg-card/40 border border-border/60 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    );
}

export default function JournalPage() {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMood, setSelectedMood] = useState(null);
    const [moods, setMoods] = useState(DEFAULT_MOODS);
    const [avatarUrl, setAvatarUrl] = useState("https://github.com/yunkhngn.png");

    // Edit/Delete/Reply State
    const [editingEntry, setEditingEntry] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null); // Add replying state
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [viewingImage, setViewingImage] = useState(null);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const hasMoreRef = useRef(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Helper to keep ref in sync with state
    const updateHasMore = (value) => {
        setHasMore(value);
        hasMoreRef.current = value;
    };

    const fetchSettings = useCallback(async () => {
        try {
            const resSettings = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
            if (resSettings.ok) {
                const settings = await readNestJson(resSettings);
                const moodSetting = settings.find(s => s.settingTitle === 'journal_moods');
                if (moodSetting && moodSetting.content) {
                    const parsed = JSON.parse(moodSetting.content);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setMoods(parsed);
                    }
                }
                const avatarSetting = settings.find(s => s.settingTitle === 'avatar');
                if (avatarSetting && avatarSetting.content) setAvatarUrl(avatarSetting.content);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    }, []);

    const fetchEntries = useCallback(async (pageNum, overwrite = false) => {
        if (!hasMoreRef.current && !overwrite) return;

        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            const resEntries = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/journals?page=${pageNum}&limit=10`);
            if (!resEntries.ok) throw new Error('Failed to fetch entries');
            const data = await readNestJson(resEntries);

            setEntries(prev => overwrite ? data.data : [...prev, ...data.data]);
            updateHasMore(data.page < data.totalPages);
            setPage(data.page);
        } catch (error) {
            console.error('Error fetching entries:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
        fetchEntries(1, true);
    }, [fetchSettings, fetchEntries]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500) {
                if (!loading && !loadingMore && hasMore) {
                    fetchEntries(page + 1);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, loadingMore, hasMore, page, fetchEntries]);

    const handleEdit = (entry) => {
        setEditingEntry(entry);
        setReplyingTo(null); // Clear replying state when editing
        setIsComposeOpen(true);
    };

    const handleReply = (entry) => {
        setReplyingTo(entry);
        setEditingEntry(null); // Clear editing state when replying
        setIsComposeOpen(true);
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/journals/${deleteId}`);
            fetchEntries(1, true);
            toast.success("Entry deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete");
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        }
    };

    const handleReaction = async (id, type) => {
        try {
            await api.post(`/journals/${id}/reactions`, { type });
            // For reaction, we could just re-fetch page 1 or do an optimistic update,
            // but since a re-fetch can reset infinite scroll if not careful, we should 
            // optimistically update the state instead.
            const updateReactionsRecursive = (items) => {
                return items.map(e => {
                    if (e.id === id) {
                        const existing = e.reactions?.findIndex(r => r.uid === user?.uid);
                        let newReactions = [...(e.reactions || [])];
                        if (existing >= 0) newReactions.splice(existing, 1);
                        else newReactions.push({ uid: user?.uid, type });
                        return { ...e, reactions: newReactions };
                    }
                    if (e.replies && e.replies.length > 0) {
                        return { ...e, replies: updateReactionsRecursive(e.replies) };
                    }
                    return e;
                });
            };
            setEntries(prev => updateReactionsRecursive(prev));
        } catch (error) {
            console.error(error);
            toast.error("Failed to react");
        }
    };

    const filteredEntries = selectedMood
        ? entries.filter(e => e.mood === selectedMood)
        : entries;

    // Group entries by date for Timeline view
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
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-serif">
                    Thoughts & Notes
                </h1>
                <p className="text-muted-foreground max-w-lg text-lg">
                    Short thoughts, ideas, TIL, and daily code snippets. Or just anything that comes to mind.
                </p>

                {user && (
                    <div className="pt-4">
                        <Button
                            onClick={() => {
                                setEditingEntry(null);
                                setReplyingTo(null); // Clear replying state when creating new entry
                                setIsComposeOpen(true);
                            }}
                            className="rounded-full shadow-lg h-12 px-6 text-base"
                        >
                            <Plus className="mr-2 h-5 w-5" /> Write Something
                        </Button>
                    </div>
                )}
            </div>

            <ComposeModal
                isOpen={isComposeOpen}
                onClose={() => {
                    setIsComposeOpen(false);
                    setEditingEntry(null);
                    setReplyingTo(null); // Clear all related states on close
                }}
                initialData={editingEntry}
                parentId={replyingTo?.parentId || replyingTo?.id} // Pass root parentId for replies
                moods={moods}
                onSuccess={() => fetchEntries(1, true)}
                avatarUrl={avatarUrl}
            />        {/* Filter */}
            <div className="flex flex-wrap gap-2 mb-12 justify-center">
                <Button
                    variant={selectedMood === null ? "default" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setSelectedMood(null)}
                >
                    All
                </Button>
                {moods.map(m => {
                    const Icon = ICON_MAP[m.icon] || Smile;
                    return (
                        <Button
                            key={m.key}
                            variant={selectedMood === m.key ? "default" : "outline"}
                            size="sm"
                            className={`rounded-full gap-1.5 ${selectedMood === m.key ? '' : 'hover:bg-muted'}`}
                            onClick={() => setSelectedMood(selectedMood === m.key ? null : m.key)}
                        >
                            <Icon className={`h-3.5 w-3.5 ${selectedMood === m.key ? '' : m.color}`} />
                            {m.label}
                        </Button>
                    );
                })}
            </div>

            {/* Timeline */}
            {loading ? (
                <div className="space-y-8">
                    {[1, 2, 3].map(i => <JournalSkeleton key={i} />)}
                </div>
            ) : sortedDates.length > 0 ? (
                <div className="space-y-10 relative">
                    {/* Timeline Main Line */}
                    <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border/40 z-0"></div>

                    {sortedDates.map(date => (
                        <div key={date} className="relative z-10">
                            {/* Date Header */}
                            <div className="flex items-center gap-4 mb-6 sticky top-20 bg-background/80 backdrop-blur-md py-2 z-20">
                                <div className="w-[30px] flex justify-center shrink-0">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background"></div>
                                </div>
                                <h3 className="text-lg font-bold font-serif">
                                    {format(new Date(date), "EEEE, d MMMM yyyy", { locale: vi })}
                                </h3>
                            </div>

                            <div className="space-y-0">
                                {groupedEntries[date].map(entry => {
                                    const moodInfo = moods.find(m => m.key === entry.mood) || moods[0];
                                    return (
                                        <JournalEntry
                                            key={entry.id}
                                            entry={entry}
                                            moodInfo={moodInfo}
                                            moods={moods} // Pass moods for recursive replies
                                            avatarUrl={avatarUrl}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onReaction={handleReaction}
                                            onViewImage={setViewingImage}
                                            onReply={handleReply} // Pass onReply handler
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">My Journal is empty</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                        Start capturing your daily thoughts, code snippets, and moments.
                    </p>
                    {user && (
                        <Button onClick={() => setIsComposeOpen(true)} className="rounded-full">
                            <Plus className="mr-2 h-4 w-4" /> Create First Entry
                        </Button>
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Entry"
                description="Are you sure you want to delete this journal entry? This action cannot be undone."
            />

            {/* View Image Modal */}
            <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
                <DialogContent className="max-w-[95vw] h-auto p-0 bg-transparent border-none shadow-none flex items-center justify-center outline-none my-auto">
                    {viewingImage && (
                        <div className="relative flex items-center justify-center">
                            <button
                                onClick={() => setViewingImage(null)}
                                className="absolute top-2 right-2 md:-right-10 md:-top-10 text-white/70 hover:text-white transition-colors z-50 bg-black/50 md:bg-transparent rounded-full p-1.5 md:p-0 backdrop-blur-sm md:backdrop-blur-none"
                            >
                                <X className="h-5 w-5 md:h-8 md:w-8" />
                            </button>
                            <Image
                                src={getOptimizedUrl(viewingImage, { width: 1920 })}
                                alt="View"
                                width={1200}
                                height={800}
                                className="w-auto h-auto max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
                                placeholder={getBlurUrl(viewingImage) ? 'blur' : 'empty'}
                                blurDataURL={getBlurUrl(viewingImage)}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

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
