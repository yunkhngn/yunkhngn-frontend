import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/template/Default/Layout';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Smile, Image as ImageIcon, X, Loader2, Plus, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { ICON_MAP, DEFAULT_MOODS } from '@/lib/moods';
import api from '@/lib/api/client';
import { toast } from 'sonner';
import Image from 'next/image';



function JournalEntry({ entry, moodInfo }) {
    const MoodIcon = ICON_MAP[moodInfo?.icon] || Smile;
    const createdAt = new Date(entry.createdAt);
    const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true, locale: vi });
    const fullDate = format(createdAt, "HH:mm", { locale: vi }); // Only time for timeline items
    const [viewingImage, setViewingImage] = useState(null);

    return (
        <article className="group relative pl-8 pb-8 last:pb-0">
            {/* Timeline Line */}
            <div className="absolute left-[3px] top-3 bottom-0 w-[2px] bg-border group-last:bottom-auto group-last:h-full"></div>

            {/* Timeline Dot */}
            <div className={`absolute left-0 top-3 w-2 h-2 rounded-full ring-4 ring-background ${moodInfo?.color ? moodInfo.color.replace('text-', 'bg-') : 'bg-primary'}`}></div>

            <div className="bg-card/40 backdrop-blur-sm border border-border/60 rounded-2xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                {/* Header with Avatar */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-muted relative shrink-0">
                            <Image
                                src="https://github.com/yunkhngn.png"
                                alt="yun.khngn"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">yun.khngn</span>
                                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted/50 ${moodInfo?.color}`}>
                                    <MoodIcon className="h-3 w-3" />
                                    <span className="text-[10px] font-medium">{moodInfo?.label}</span>
                                </div>
                            </div>
                            <time className="text-xs text-muted-foreground" title={format(createdAt, "d MMM yyyy HH:mm", { locale: vi })}>
                                {fullDate} • {timeAgo}
                            </time>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="prose prose-sm dark:prose-invert max-w-none mb-3 pl-11">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                </div>

                {/* Image Grid */}
                {entry.images && entry.images.length > 0 && (
                    <div className={`grid gap-2 mb-3 rounded-xl overflow-hidden pl-11 ${entry.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {entry.images.map((img, idx) => (
                            <div
                                key={idx}
                                className={`relative bg-muted cursor-zoom-in ${entry.images.length === 1 ? 'aspect-auto max-h-[400px]' : 'aspect-square'}`}
                                onClick={() => setViewingImage(img)}
                            >
                                <Image
                                    src={img}
                                    alt={`Image ${idx + 1}`}
                                    fill={entry.images.length > 1}
                                    width={entry.images.length === 1 ? 800 : undefined}
                                    height={entry.images.length === 1 ? 600 : undefined}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/30 pl-11">
                        {entry.tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs rounded-full font-normal px-2.5 py-0.5">
                                #{tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <Dialog open={!!viewingImage} onOpenChange={() => setViewingImage(null)}>
                <DialogContent className="max-w-[90vw] md:max-w-4xl p-0 bg-transparent border-none shadow-none flex items-center justify-center">
                    {viewingImage && (
                        <div className="relative w-full max-h-[90vh]">
                            <button
                                onClick={() => setViewingImage(null)}
                                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors z-50 md:hidden"
                            >
                                <X className="h-8 w-8" />
                            </button>
                            <Image
                                src={viewingImage}
                                alt="View"
                                width={1200}
                                height={800}
                                className="object-contain w-full h-full rounded-md"
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </article>
    );
}

function ComposeModal({ moods, onSuccess }) {
    const [content, setContent] = useState('');
    const [mood, setMood] = useState('coding');
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + imageFiles.length > 4) {
            toast.error("Maximum 4 images allowed");
            return;
        }
        const newFiles = [...imageFiles, ...files];
        setImageFiles(newFiles);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newFiles = [...imageFiles];
        newFiles.splice(index, 1);
        setImageFiles(newFiles);
        const newPreviews = [...imagePreviews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
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
        if (!content.trim() && imageFiles.length === 0) return;
        setIsSubmitting(true);
        try {
            const uploadedUrls = [];
            if (imageFiles.length > 0) {
                const { data: { signature, timestamp, cloudName, apiKey } } = await api.post('/gallery/upload-signature', { folder: 'journal' });
                for (const file of imageFiles) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('api_key', apiKey);
                    formData.append('timestamp', timestamp);
                    formData.append('signature', signature);
                    formData.append('folder', 'journal');
                    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
                    if (!cloudinaryRes.ok) throw new Error('Image upload failed');
                    const data = await cloudinaryRes.json();
                    uploadedUrls.push(data.secure_url);
                }
            }

            await api.post('/journals', { content, mood, tags, images: uploadedUrls });

            setContent('');
            setImageFiles([]);
            setImagePreviews([]);
            setTags([]);
            setIsOpen(false);
            toast.success("Posted!");
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Failed to post. Are you logged in?");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedMoodInfo = moods.find(m => m.key === mood) || moods[0];
    const MoodIcon = ICON_MAP[selectedMoodInfo?.icon] || Smile;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="icon" className="rounded-full h-10 w-10 shadow-lg fixed bottom-8 right-8 md:static md:shadow-none md:h-9 md:w-auto md:px-4 md:rounded-md z-50">
                    <Plus className="h-5 w-5 md:mr-2" />
                    <span className="hidden md:inline">New Entry</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Journal Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 relative border border-border">
                            <Image src="https://github.com/yunkhngn.png" alt="Avatar" fill className="object-cover" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What's on your mind?"
                                className="w-full bg-transparent border-none outline-none resize-none text-foreground text-sm min-h-[100px] p-0 focus:ring-0"
                                autoFocus
                            />

                            {imagePreviews.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {imagePreviews.map((url, i) => (
                                        <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-border group">
                                            <Image src={url} alt="Preview" fill className="object-cover" />
                                            <button onClick={() => removeImage(i)} className="absolute top-1 right-1 p-0.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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

                            <div className="flex items-center justify-between border-t pt-3">
                                <div className="flex items-center gap-2">
                                    <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-primary transition-colors">
                                        <ImageIcon className="h-5 w-5" />
                                    </button>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageSelect} />

                                    <div className="relative group">
                                        <button className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${selectedMoodInfo.color} bg-muted/50 hover:bg-muted`}>
                                            <MoodIcon className="h-4 w-4" />
                                            {selectedMoodInfo.label}
                                        </button>
                                        <div className="absolute top-full left-0 mt-2 p-2 bg-popover border rounded-xl shadow-lg grid grid-cols-4 gap-1 w-64 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
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

                                <Button onClick={handleSubmit} disabled={(!content.trim() && imageFiles.length === 0) || isSubmitting} size="sm" className="rounded-full">
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
                                </Button>
                            </div>
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

    const fetchData = async () => {
        try {
            const resEntries = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/journals`);
            if (!resEntries.ok) throw new Error('Failed to fetch entries');
            const dataEntries = await resEntries.json();
            setEntries(dataEntries);

            const resSettings = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
            if (resSettings.ok) {
                const settings = await resSettings.json();
                const moodSetting = settings.find(s => s.settingTitle === 'journal_moods');
                if (moodSetting && moodSetting.content) {
                    const parsed = JSON.parse(moodSetting.content);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setMoods(parsed);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-serif">
                    Thoughts & Notes
                </h1>
                <p className="text-muted-foreground max-w-lg text-lg">
                    Short thoughts, ideas, TIL, and daily code snippets. Or just anything that comes to mind.
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
                {moods.map((m) => {
                    const Icon = ICON_MAP[m.icon] || Smile;
                    return (
                        <button
                            key={m.key}
                            onClick={() => setSelectedMood(selectedMood === m.key ? null : m.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedMood === m.key
                                ? 'bg-primary text-primary-foreground shadow-md'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Icon className={`h-3 w-3 ${selectedMood === m.key ? '' : m.color}`} />
                            {m.label}
                        </button>
                    );
                })}
            </div>

            {/* Header Action: Compose Button (Modal Trigger) */}
            {user && (
                <div className="mb-8 flex justify-end">
                    <ComposeModal moods={moods} onSuccess={fetchData} />
                </div>
            )}

            {/* Timeline Feed */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <JournalSkeleton key={i} />)}
                </div>
            ) : sortedDates.length > 0 ? (
                <div className="space-y-10 relative">
                    {/* Global Timeline Line for continuity (optional, but per-group looks better) */}

                    {sortedDates.map(date => (
                        <div key={date}>
                            {/* Date Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider bg-background pr-4 z-10 sticky top-16">
                                    {format(new Date(date), 'EEEE, d MMMM yyyy', { locale: vi })}
                                </span>
                                <div className="h-px flex-1 bg-border/50" />
                            </div>

                            {/* Entries for this date */}
                            <div className="space-y-0">
                                {groupedEntries[date].map(entry => {
                                    const moodInfo = moods.find(m => m.key === entry.mood) || moods[0];
                                    return (
                                        <JournalEntry key={entry.id} entry={entry} moodInfo={moodInfo} />
                                    );
                                })}
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
