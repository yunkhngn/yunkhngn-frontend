import { useState, useEffect } from 'react';
import AdminLayout from '@/components/template/Admin/Layout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Trash2, Search, Smile, X, Send, Settings, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/Badge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/Dialog";
import { ICON_MAP, DEFAULT_MOODS, COLOR_OPTIONS } from '@/lib/moods';

export default function AdminJournal() {
    const { user } = useAuth();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Dynamic Moods State
    const [moods, setMoods] = useState(DEFAULT_MOODS);
    const [isMoodManagerOpen, setIsMoodManagerOpen] = useState(false);
    const [editingMood, setEditingMood] = useState(null); // null = creating new

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
        fetchMoods();
    }, [user]);

    const fetchMoods = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
            const moodSetting = res.data.find(s => s.settingTitle === 'journal_moods');
            if (moodSetting && moodSetting.content) {
                try {
                    const parsed = JSON.parse(moodSetting.content);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setMoods(parsed);
                        // Ensure selected mood exists
                        if (!parsed.find(m => m.key === mood)) {
                            setMood(parsed[0]?.key || 'happy');
                        }
                        return;
                    }
                } catch (e) {
                    console.error("Failed to parse mood settings", e);
                }
            }
            // Fallback to defaults
            setMoods(DEFAULT_MOODS);
        } catch (error) {
            console.error("Failed to fetch settings", error);
        }
    };

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

    const saveMoods = async (newMoods) => {
        try {
            const token = await user.getIdToken();
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
                settingTitle: 'journal_moods',
                content: JSON.stringify(newMoods)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMoods(newMoods);
            toast.success('Moods updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update moods');
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
            // Keep current selected mood
            setIsComposeOpen(false);
            toast.success('Journal entry posted!');
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

    const selectedMoodOption = moods.find(m => m.key === mood) || moods[0];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
                        <p className="text-muted-foreground">Micro-blog & daily thoughts</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsMoodManagerOpen(true)}>
                            <Settings className="mr-2 h-4 w-4" /> Manage Moods
                        </Button>
                        <Button onClick={() => setIsComposeOpen(!isComposeOpen)}>
                            {isComposeOpen ? (
                                <><X className="mr-2 h-4 w-4" /> Close</>
                            ) : (
                                <><Plus className="mr-2 h-4 w-4" /> New Entry</>
                            )}
                        </Button>
                    </div>
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
                            placeholder="What's on your mind?"
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
                                <div className="flex items-center gap-1 bg-muted rounded-lg p-1 overflow-x-auto max-w-[200px] sm:max-w-md scrollbar-hide">
                                    {moods.map((m) => {
                                        const Icon = ICON_MAP[m.icon] || Smile;
                                        return (
                                            <button
                                                key={m.key}
                                                type="button"
                                                onClick={() => setMood(m.key)}
                                                className={`p-1.5 rounded-md transition-all shrink-0 ${mood === m.key ? 'bg-background shadow-sm' : 'hover:bg-background/50'
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
                                    className="h-8 w-24 sm:w-32 text-xs"
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
                            const moodInfo = moods.find(m => m.key === entry.mood) || moods[0];
                            const MoodIcon = ICON_MAP[moodInfo?.icon] || Smile;
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
                                                    {moodInfo?.label || entry.mood}
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

                <MoodManagerModal
                    isOpen={isMoodManagerOpen}
                    onClose={() => setIsMoodManagerOpen(false)}
                    moods={moods}
                    onSave={saveMoods}
                />
            </div>
        </AdminLayout>
    );
}

function MoodManagerModal({ isOpen, onClose, moods, onSave }) {
    const [localMoods, setLocalMoods] = useState(moods);
    const [editing, setEditing] = useState(null); // { key, label, icon, color } or null (list view)

    useEffect(() => {
        setLocalMoods(moods);
        setEditing(null);
    }, [moods, isOpen]);

    const handleSaveList = () => {
        onSave(localMoods);
        onClose();
    };

    const handleDelete = (key) => {
        if (localMoods.length <= 1) {
            toast.error("Must have at least one mood");
            return;
        }
        setLocalMoods(localMoods.filter(m => m.key !== key));
    };

    const handleEditSave = (mood) => {
        const existingIndex = localMoods.findIndex(m => m.key === mood.key);
        if (existingIndex >= 0) {
            // Update
            const newMoods = [...localMoods];
            newMoods[existingIndex] = mood;
            setLocalMoods(newMoods);
        } else {
            // Add new
            setLocalMoods([...localMoods, mood]);
        }
        setEditing(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{editing ? (editing.isNew ? 'New Mood' : 'Edit Mood') : 'Manage Moods'}</DialogTitle>
                </DialogHeader>

                {editing ? (
                    <MoodEditor
                        initialData={editing}
                        onSave={handleEditSave}
                        onCancel={() => setEditing(null)}
                        existingKeys={localMoods.map(m => m.key)}
                    />
                ) : (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {localMoods.map(mood => {
                                const Icon = ICON_MAP[mood.icon] || Smile;
                                return (
                                    <div key={mood.key} className="flex items-center justify-between p-2 border rounded-md bg-card">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-md bg-muted ${mood.color}`}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <span className="font-medium text-sm">{mood.label}</span>
                                            <span className="text-xs text-muted-foreground font-mono">({mood.key})</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditing(mood)}>
                                                <Settings className="h-3 w-3" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(mood.key)}>
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <Button className="w-full" variant="outline" onClick={() => setEditing({ isNew: true, key: '', label: '', icon: 'Smile', color: 'text-yellow-500' })}>
                            <Plus className="mr-2 h-4 w-4" /> Add Custom Mood
                        </Button>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button onClick={handleSaveList}>Save Changes</Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function MoodEditor({ initialData, onSave, onCancel, existingKeys }) {
    const [data, setData] = useState({ ...initialData });
    const [keyError, setKeyError] = useState('');

    useEffect(() => {
        if (data.isNew && data.label) {
            // Auto-generate key from label if new
            const slug = data.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            if (!data.keyChanged) {
                setData(prev => ({ ...prev, key: slug }));
            }
        }
    }, [data.label]);

    const handleSave = () => {
        if (!data.label || !data.key) return;
        if (data.isNew && existingKeys.includes(data.key)) {
            setKeyError('Key already exists');
            return;
        }
        onSave(data);
    };

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Label</label>
                    <Input
                        value={data.label}
                        onChange={(e) => setData({ ...data, label: e.target.value })}
                        placeholder="e.g. Excited"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Key (ID)</label>
                    <Input
                        value={data.key}
                        onChange={(e) => setData({ ...data, key: e.target.value, keyChanged: true })}
                        placeholder="excited"
                        disabled={!data.isNew}
                    />
                    {keyError && <p className="text-xs text-destructive">{keyError}</p>}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 h-40 overflow-y-auto p-2 border rounded-md bg-muted/20">
                    {Object.keys(ICON_MAP).map(iconKey => {
                        const Icon = ICON_MAP[iconKey];
                        return (
                            <button
                                key={iconKey}
                                type="button"
                                onClick={() => setData({ ...data, icon: iconKey })}
                                className={`p-2 rounded-md hover:bg-background transition-all flex items-center justify-center ${data.icon === iconKey ? 'bg-background shadow-md ring-2 ring-primary' : ''}`}
                                title={iconKey}
                            >
                                <Icon className={`h-5 w-5 ${data.color}`} />
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map(c => (
                        <button
                            key={c.value}
                            type="button"
                            onClick={() => setData({ ...data, color: c.value })}
                            className={`w-8 h-8 rounded-full ${c.bg} hover:opacity-80 transition-all ${data.color === c.value ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                            title={c.label}
                        >
                            {data.color === c.value && <Check className="h-4 w-4 text-white mx-auto" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2 p-4 border rounded-md bg-muted/30 flex items-center justify-center gap-3">
                <span className="text-sm text-muted-foreground">Preview:</span>
                <Badge variant="outline" className="pl-1 pr-3 py-1 flex items-center gap-1.5 text-sm font-normal">
                    <div className={`p-1 rounded-full bg-muted-foreground/10 ${data.color}`}>
                        {(() => {
                            const Icon = ICON_MAP[data.icon] || Smile;
                            return <Icon className="h-4 w-4" />;
                        })()}
                    </div>
                    {data.label || 'Mood Label'}
                </Badge>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={onCancel}>Back</Button>
                <Button onClick={handleSave} disabled={!data.label || !data.key}>
                    Save Mood
                </Button>
            </div>
        </div>
    );
}
