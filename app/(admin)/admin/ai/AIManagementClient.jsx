'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { readNestJson } from '@/lib/api/readJson';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/Dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/Tabs";
import {
    Brain,
    Database,
    Key,
    UserCircle,
    Plus,
    Search,
    RefreshCw,
    Trash2,
    Edit3,
    CheckCircle2,
    XCircle,
    Loader2,
    Save,
    RotateCcw,
    Code2
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

// --- Default Persona fallback ---
const DEFAULT_PERSONA = {
    "identity": {
        "name": "Khoa Nguyễn",
        "handle": "yun.khngn",
        "roles": ["Software Engineer", "Graphic Designer", "Guitarist"],
        "birth_year": 2005,
        "mbti": "INTJ-A",
        "self_image": "A talented software engineering student..."
    },
    "voice_and_tone": {
        "addressing_style": { "default": "tớ / cậu" },
        "characteristics": ["Nói thẳng, ưu tiên ý chính", "Giọng thân thiện, hơi văn chương"],
    }
};

export default function AIManagementClient() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('knowledge');
    const [ragStats, setRagStats] = useState({ count: 0 });
    const [isReindexing, setIsReindexing] = useState(false);
    
    // Global Confirm Modal state
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => {},
        variant: "destructive"
    });

    const closeConfirm = () => setConfirmConfig(prev => ({ ...prev, isOpen: false }));

    const triggerConfirm = (config) => {
        setConfirmConfig({
            ...config,
            isOpen: true
        });
    };

    // Fetch RAG stats
    const fetchRagStats = async () => {
        try {
            const token = await user?.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/rag/stats`, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });
            if (res.ok) {
                const data = await readNestJson(res);
                if (data) setRagStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch RAG stats:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchRagStats();
        }
    }, [user]);

    const handleReindexAll = async () => {
        triggerConfirm({
            title: "Reindex All Knowledge",
            description: "This will re-sync all knowledge entries and blogs to the vector database. Continue?",
            variant: "default",
            onConfirm: async () => {
                closeConfirm();
                setIsReindexing(true);
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/knowledge/sync-all`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${user.accessToken}`
                        }
                    });
                    if (res.ok) {
                        toast.success('Reindexing started successfully');
                        setTimeout(fetchRagStats, 3000);
                    } else {
                        toast.error('Failed to start reindexing');
                    }
                } catch (error) {
                    toast.error('Error starting reindexing');
                } finally {
                    setIsReindexing(false);
                }
            }
        });
    };

    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Brain className="h-8 w-8 text-primary" />
                        AI Management
                    </h1>
                    <p className="text-muted-foreground">
                        Configure AI persona, knowledge base, and API keys.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Card className="px-3 py-2 flex items-center gap-2 bg-primary/5 border-primary/20 whitespace-nowrap">
                        <Database className="h-4 w-4 text-primary opacity-70" />
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Vector DB:</span>
                        <span className="text-sm font-mono font-bold text-primary">{ragStats.count} Docs</span>
                    </Card>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReindexAll}
                        disabled={isReindexing}
                        className="gap-2"
                    >
                        {isReindexing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        Reindex All
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="knowledge" className="gap-2 px-6">
                        <Database className="h-4 w-4" />
                        Knowledge Base
                    </TabsTrigger>
                    <TabsTrigger value="persona" className="gap-2 px-6">
                        <UserCircle className="h-4 w-4" />
                        Persona
                    </TabsTrigger>
                    <TabsTrigger value="api-keys" className="gap-2 px-6">
                        <Key className="h-4 w-4" />
                        API Keys
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="knowledge" className="space-y-4">
                    <KnowledgeTab user={user} triggerConfirm={triggerConfirm} closeConfirm={closeConfirm} />
                </TabsContent>

                <TabsContent value="persona">
                    <PersonaTab user={user} triggerConfirm={triggerConfirm} closeConfirm={closeConfirm} />
                </TabsContent>

                <TabsContent value="api-keys">
                    <ApiKeysTab user={user} triggerConfirm={triggerConfirm} closeConfirm={closeConfirm} />
                </TabsContent>
            </Tabs>

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                description={confirmConfig.description}
                onConfirm={confirmConfig.onConfirm}
                onClose={closeConfirm}
                variant={confirmConfig.variant}
            />
        </div>
    );
}

// --- Knowledge Base Tab ---
function KnowledgeTab({ user, triggerConfirm, closeConfirm }) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        category: 'general',
        content: ''
    });

    const [isJsonMode, setIsJsonMode] = useState(false);

    const fetchEntries = async () => {
        setLoading(true);
        try {
            const token = await user?.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/knowledge`, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });
            if (res.ok) {
                const data = await readNestJson(res);
                if (data) setEntries(data);
            }
        } catch (error) {
            toast.error('Failed to load knowledge entries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, []);

    const categories = useMemo(() => {
        const cats = new Set(entries.map(e => e.category));
        return ['All', ...Array.from(cats).sort()];
    }, [entries]);

    const filteredEntries = useMemo(() => {
        return entries.filter(e => {
            const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
                e.content.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [entries, search, selectedCategory]);

    const handleOpenAdd = () => {
        setEditingEntry(null);
        setFormData({ title: '', category: selectedCategory === 'All' ? 'general' : selectedCategory, content: '' });
        setIsJsonMode(false);
        setDialogOpen(true);
    };

    const handleOpenEdit = (entry) => {
        setEditingEntry(entry);
        setFormData({ title: entry.title, category: entry.category, content: entry.content });
        setIsJsonMode(false);
        setDialogOpen(true);
    };

    const toggleJsonMode = () => {
        if (!isJsonMode) {
            // Switching from Text to JSON
            try {
                const parsed = JSON.parse(formData.content);
                const formatted = JSON.stringify(parsed, null, 4);
                setFormData(prev => ({ ...prev, content: formatted }));
            } catch (e) {
                // Not valid JSON, just switch without formatting
            }
        }
        setIsJsonMode(!isJsonMode);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.content) {
            toast.error('Please fill in all fields');
            return;
        }

        setSaving(true);
        try {
            const url = editingEntry
                ? `${process.env.NEXT_PUBLIC_API_URL}/knowledge/${editingEntry.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/knowledge`;

            const res = await fetch(url, {
                method: editingEntry ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(editingEntry ? 'Entry updated' : 'Entry created');
                setDialogOpen(false);
                fetchEntries();
            } else {
                toast.error('Failed to save entry');
            }
        } catch (error) {
            toast.error('Error saving entry');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        triggerConfirm({
            title: "Delete Knowledge Entry",
            description: "Are you sure you want to delete this knowledge entry? It will be removed from the vector database as well.",
            variant: "destructive",
            onConfirm: async () => {
                closeConfirm();
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/knowledge/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${user.accessToken}`
                        }
                    });

                    if (res.ok) {
                        toast.success('Entry deleted');
                        fetchEntries();
                    } else {
                        toast.error('Failed to delete entry');
                    }
                } catch (error) {
                    toast.error('Error deleting entry');
                }
            }
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
            {/* Sidebar */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Categories</h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleOpenAdd}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex flex-col gap-1">
                    {categories.map(cat => (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? 'secondary' : 'ghost'}
                            className="justify-start text-sm font-medium"
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <Card className="p-0 overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="p-4 border-b border-border/50 flex flex-col md:flex-row justify-between gap-4 bg-muted/20">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search knowledge..."
                            className="pl-9 bg-background/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleOpenAdd} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Entry
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">Title</TableHead>
                                <TableHead>Preview</TableHead>
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead className="w-[120px] text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground opacity-50" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredEntries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                        No entries found in this category.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEntries.map((entry) => (
                                    <TableRow key={entry.id} className="group hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-medium align-top py-4">
                                            <div className="flex flex-col gap-1">
                                                <span>{entry.title}</span>
                                                <Badge variant="outline" className="w-fit text-[10px] py-0">{entry.category}</Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm py-4 align-top">
                                            <p className="line-clamp-2">{entry.content}</p>
                                        </TableCell>
                                        <TableCell className="py-4 align-top">
                                            {entry.synced ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1 hover:bg-emerald-500/20">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Synced
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 hover:bg-amber-500/20">
                                                    <XCircle className="h-3 w-3" />
                                                    Pending
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right py-4 align-top">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleOpenEdit(entry)}>
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(entry.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{editingEntry ? 'Edit Knowledge' : 'Add Knowledge'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <Input
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="e.g. skills, projects, personality"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter a descriptive title"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Content</label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleJsonMode}
                                    className={`h-7 px-2 gap-1.5 text-xs ${isJsonMode ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                                >
                                    <Code2 className="h-3.5 w-3.5" />
                                    {isJsonMode ? 'Format JSON' : 'Edit as JSON'}
                                </Button>
                            </div>
                            {isJsonMode ? (
                                <div className="rounded-md overflow-hidden border border-border shadow-inner bg-black/20">
                                    <Editor
                                        height="300px"
                                        defaultLanguage="json"
                                        value={formData.content}
                                        onChange={(val) => setFormData({ ...formData, content: val })}
                                        theme="vs-dark"
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 13,
                                            fontFamily: 'JetBrains Mono, Menlo, monospace',
                                            padding: { top: 10 },
                                            formatOnPaste: true,
                                            formatOnType: true,
                                            scrollBeyondLastLine: false,
                                            lineNumbers: 'on',
                                        }}
                                    />
                                </div>
                            ) : (
                                <Textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Describe the fact or knowledge piece..."
                                    className="min-h-[200px]"
                                />
                            )}
                            <p className="text-xs text-muted-foreground">This content will be indexed in the vector database for RAG.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="gap-2">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {editingEntry ? 'Update Entry' : 'Create Entry'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// --- Persona Tab ---
function PersonaTab({ user, triggerConfirm, closeConfirm }) {
    const [personaSetting, setPersonaSetting] = useState(null);
    const [editorValue, setEditorValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchPersona = async () => {
        setLoading(true);
        try {
            const token = await user?.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/admin`, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });
            if (res.ok) {
                const data = await readNestJson(res);
                if (data) {
                    const persona = data.find(s => s.settingTitle === 'ai_persona');
                    if (persona) {
                        setPersonaSetting(persona);
                        setEditorValue(persona.content);
                    } else {
                        setEditorValue(JSON.stringify(DEFAULT_PERSONA, null, 4));
                    }
                }
            }
        } catch (error) {
            toast.error('Failed to load persona');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPersona();
    }, []);

    const handleSave = async () => {
        try {
            // Validate JSON
            JSON.parse(editorValue);
        } catch (e) {
            toast.error('Invalid JSON format');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}`
                },
                body: JSON.stringify({
                    settingTitle: 'ai_persona',
                    content: editorValue
                })
            });

            if (res.ok) {
                toast.success('AI Persona updated successfully');
            } else {
                toast.error('Failed to update persona');
            }
        } catch (error) {
            toast.error('Error saving persona');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        triggerConfirm({
            title: "Reset Persona",
            description: "Are you sure you want to reset to the default persona? All current changes in the editor will be lost.",
            variant: "destructive",
            onConfirm: () => {
                setEditorValue(JSON.stringify(DEFAULT_PERSONA, null, 4));
                closeConfirm();
            }
        });
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" /></div>;

    return (
        <Card className="p-6 space-y-6 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">AI Persona Configuration</h3>
                    <p className="text-sm text-muted-foreground">Define how the AI assistant thinks, speaks, and behaves.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </Button>
                    <Button onClick={handleSave} size="sm" disabled={saving} className="gap-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Persona
                    </Button>
                </div>
            </div>

            <div className="rounded-md overflow-hidden border border-border shadow-inner bg-black/20">
                <Editor
                    height="600px"
                    defaultLanguage="json"
                    value={editorValue}
                    onChange={setEditorValue}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, Menlo, monospace',
                        padding: { top: 20 },
                        formatOnPaste: true,
                        formatOnType: true,
                        scrollBeyondLastLine: false,
                    }}
                />
            </div>

            <div className="p-4 bg-muted/30 rounded-md border border-border/50">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <Brain className="h-3 w-3" />
                    Tip: Use the persona to define Khoa's MBTI, voice characteristics, and instructed instructions for sensitive topics.
                </p>
            </div>
        </Card>
    );
}

// --- API Keys Tab (Ported from SettingsClient) ---
function ApiKeysTab({ user, triggerConfirm, closeConfirm }) {
    const [apiKeys, setApiKeys] = useState({ count: 0, keys: [] });
    const [newApiKey, setNewApiKey] = useState('');
    const [loading, setLoading] = useState(true);
    const [apiKeyLoading, setApiKeyLoading] = useState(false);

    const fetchApiKeys = async () => {
        setLoading(true);
        try {
            const token = await user?.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/api-keys`, {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });
            if (res.ok) {
                const data = await readNestJson(res);
                if (data) setApiKeys(data);
            }
        } catch (error) {
            console.error('Failed to fetch api keys:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApiKeys();
    }, []);

    const handleAddApiKey = async () => {
        if (!newApiKey.trim()) return;
        setApiKeyLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/api-keys/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}`
                },
                body: JSON.stringify({ key: newApiKey })
            });

            if (res.ok) {
                toast.success('API key added to pool');
                setNewApiKey('');
                fetchApiKeys();
            } else {
                toast.error('Failed to add API key');
            }
        } catch (error) {
            toast.error('Error adding API key');
        } finally {
            setApiKeyLoading(false);
        }
    };

    const handleRemoveApiKey = async (index) => {
        triggerConfirm({
            title: "Remove API Key",
            description: "Remove this API key from the pool?",
            variant: "destructive",
            onConfirm: async () => {
                closeConfirm();
                setApiKeyLoading(true);
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/api-keys/${index}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${user.accessToken}`
                        }
                    });

                    if (res.ok) {
                        toast.success('API key removed from pool');
                        fetchApiKeys();
                    } else {
                        toast.error('Failed to remove API key');
                    }
                } catch (error) {
                    toast.error('Error removing API key');
                } finally {
                    setApiKeyLoading(false);
                }
            }
        });
    };

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" /></div>;

    return (
        <Card className="p-6 space-y-8 bg-card/50 backdrop-blur-sm border-border/50">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">Gemini API Key Pool</h3>
                <p className="text-sm text-muted-foreground">Manage multiple API keys for automatic rotation to avoid rate limits.</p>
            </div>

            <div className="space-y-6 max-w-2xl">
                <div className="space-y-3">
                    <label className="text-sm font-medium">Add New API Key</label>
                    <div className="flex gap-2">
                        <Input
                            type="password"
                            value={newApiKey}
                            onChange={(e) => setNewApiKey(e.target.value)}
                            placeholder="Paste Gemini API key here..."
                            className="font-mono text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddApiKey()}
                        />
                        <Button
                            onClick={handleAddApiKey}
                            disabled={apiKeyLoading || !newApiKey.trim()}
                            className="shrink-0"
                        >
                            {apiKeyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Add Key
                        </Button>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Active Keys ({apiKeys.count})</label>
                        {apiKeys.count > 0 && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Rotation Active</Badge>}
                    </div>

                    {apiKeys.count > 0 ? (
                        <div className="grid gap-2">
                            {apiKeys.keys.map((k) => (
                                <div key={k.index} className="flex items-center gap-3 bg-muted/30 border border-border/50 rounded-lg px-4 py-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Key className="h-4 w-4" />
                                    </div>
                                    <span className="font-mono text-sm text-muted-foreground flex-1">
                                        {k.masked}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleRemoveApiKey(k.index)}
                                        disabled={apiKeyLoading}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border border-dashed rounded-lg border-border/50 bg-muted/10">
                            <Key className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No keys in pool. The system will fall back to the default gemini_api_key setting.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-md border border-border/50">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                    <RefreshCw className="h-3 w-3" />
                    Rotation logic: The AI Service randomly selects a key from this pool for each request.
                </p>
            </div>
        </Card>
    );
}
