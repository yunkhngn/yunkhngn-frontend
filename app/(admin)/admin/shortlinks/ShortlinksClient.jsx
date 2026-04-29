'use client';

import { useState, useEffect, useCallback } from 'react';
import { readNestJson } from '@/lib/api/readJson';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { Link2, Plus, Copy, Trash2, Edit, ExternalLink, Loader2, BarChart3, ToggleLeft, ToggleRight, CheckSquare, Square, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, isValid } from 'date-fns';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminShortlinks() {
    const { user } = useAuth();
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [selected, setSelected] = useState(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);
    const [form, setForm] = useState({
        code: '',
        targetUrl: '',
        title: '',
        isActive: true,
        expiresAt: '',
    });

    const fetchLinks = useCallback(async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/shortlinks`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await readNestJson(res);
                setLinks(data);
            }
        } catch (error) {
            console.error('Failed to fetch shortlinks:', error);
            toast.error('Failed to load shortlinks');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    const resetForm = () => {
        setForm({ code: '', targetUrl: '', title: '', isActive: true, expiresAt: '' });
        setEditing(null);
    };

    const openCreate = () => {
        resetForm();
        setDialogOpen(true);
    };

    const openEdit = (link) => {
        setEditing(link);
        setForm({
            code: link.code,
            targetUrl: link.targetUrl,
            title: link.title || '',
            isActive: link.isActive,
            expiresAt: link.expiresAt ? link.expiresAt.slice(0, 16) : '',
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.targetUrl) {
            toast.error('Target URL is required');
            return;
        }

        setSaving(true);
        try {
            const token = await user.getIdToken();
            const body = {
                targetUrl: form.targetUrl,
                title: form.title || undefined,
                isActive: form.isActive,
                expiresAt: form.expiresAt || undefined,
            };

            if (!editing) {
                body.code = form.code || undefined;
            } else {
                if (form.code !== editing.code) {
                    body.code = form.code;
                }
            }

            const url = editing
                ? `${API_URL}/shortlinks/${editing.id}`
                : `${API_URL}/shortlinks`;

            const res = await fetch(url, {
                method: editing ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                toast.success(editing ? 'Shortlink updated!' : 'Shortlink created!');
                setDialogOpen(false);
                resetForm();
                fetchLinks();
            } else {
                const data = await readNestJson(res);
                toast.error(data.message || 'Failed to save shortlink');
            }
        } catch (error) {
            console.error(error);
            toast.error('Network error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this shortlink?')) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/shortlinks/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success('Shortlink deleted');
                fetchLinks();
            } else {
                toast.error('Failed to delete');
            }
        } catch (error) {
            console.error(error);
            toast.error('Network error');
        }
    };

    const handleToggle = async (link) => {
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/shortlinks/${link.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ isActive: !link.isActive }),
            });
            if (res.ok) {
                toast.success(link.isActive ? 'Link deactivated' : 'Link activated');
                fetchLinks();
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Bulk actions
    const toggleSelect = (id) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selected.size === links.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(links.map(l => l.id)));
        }
    };

    const clearSelection = () => setSelected(new Set());

    const bulkDelete = async () => {
        if (!confirm(`Delete ${selected.size} shortlink(s)?`)) return;
        setBulkLoading(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/shortlinks/bulk/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ids: [...selected] }),
            });
            if (res.ok) {
                const data = await readNestJson(res);
                toast.success(`Deleted ${data.deleted} shortlink(s)`);
                clearSelection();
                fetchLinks();
            } else {
                toast.error('Bulk delete failed');
            }
        } catch (error) {
            console.error(error);
            toast.error('Network error');
        } finally {
            setBulkLoading(false);
        }
    };

    const bulkSetStatus = async (isActive) => {
        setBulkLoading(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/shortlinks/bulk/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ids: [...selected], isActive }),
            });
            if (res.ok) {
                const data = await readNestJson(res);
                toast.success(`${isActive ? 'Activated' : 'Deactivated'} ${data.updated} shortlink(s)`);
                clearSelection();
                fetchLinks();
            } else {
                toast.error('Bulk update failed');
            }
        } catch (error) {
            console.error(error);
            toast.error('Network error');
        } finally {
            setBulkLoading(false);
        }
    };

    const copyShortUrl = (code) => {
        navigator.clipboard.writeText(`https://yunkhngn.dev/s/${code}`);
        toast.success('Copied to clipboard!');
    };

    const siteUrl = 'yunkhngn.dev/s/';

    return (
        <>
            <div className="container mx-auto p-6 max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Shortlinks</h1>
                        <p className="text-muted-foreground mt-1">Manage your short URLs</p>
                    </div>
                    <Button onClick={openCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Shortlink
                    </Button>
                </div>

                {/* Bulk Action Bar */}
                {selected.size > 0 && (
                    <div className="flex items-center gap-3 mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-in slide-in-from-top-2">
                        <span className="text-sm font-medium">{selected.size} selected</span>
                        <div className="flex-1" />
                        <Button variant="outline" size="sm" onClick={() => bulkSetStatus(true)} disabled={bulkLoading} className="gap-1.5">
                            <ToggleRight className="h-3.5 w-3.5 text-green-500" /> Activate
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => bulkSetStatus(false)} disabled={bulkLoading} className="gap-1.5">
                            <ToggleLeft className="h-3.5 w-3.5" /> Deactivate
                        </Button>
                        <Button variant="outline" size="sm" onClick={bulkDelete} disabled={bulkLoading} className="gap-1.5 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-950">
                            {bulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearSelection}>
                            <XCircle className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : links.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Link2 className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground text-lg">No shortlinks yet</p>
                            <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
                                <Plus className="h-4 w-4" />
                                Create your first shortlink
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {/* Select All */}
                        <div className="flex items-center gap-2 px-2">
                            <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground transition-colors">
                                {selected.size === links.length ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                            </button>
                            <span className="text-xs text-muted-foreground">
                                {selected.size === links.length ? 'Deselect all' : 'Select all'}
                            </span>
                        </div>

                        {links.map((link) => (
                            <Card key={link.id} className={`transition-all ${!link.isActive ? 'opacity-50' : ''} ${selected.has(link.id) ? 'ring-1 ring-primary/50 bg-primary/[0.02]' : ''}`}>
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Checkbox + Link Info */}
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <button onClick={() => toggleSelect(link.id)} className="mt-1 text-muted-foreground hover:text-foreground transition-colors shrink-0">
                                                {selected.has(link.id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {link.title && (
                                                        <span className="font-semibold text-sm">{link.title}</span>
                                                    )}
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${link.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                        {link.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                    {link.expiresAt && new Date(link.expiresAt) < new Date() && (
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Expired</span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 mb-1">
                                                    <code className="text-primary font-mono text-sm font-bold">{siteUrl}{link.code}</code>
                                                    <button onClick={() => copyShortUrl(link.code)} className="text-muted-foreground hover:text-foreground transition-colors" title="Copy short URL">
                                                        <Copy className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>

                                                <a href={link.targetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground truncate block max-w-lg transition-colors">
                                                    {link.targetUrl}
                                                </a>
                                            </div>
                                        </div>

                                        {/* Stats & Actions */}
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="flex items-center gap-1.5 text-muted-foreground text-sm mr-2" title="Total clicks">
                                                <BarChart3 className="h-4 w-4" />
                                                <span className="font-medium">{link.clicks}</span>
                                            </div>

                                            <span className="text-xs text-muted-foreground">
                                                {link.createdAt && isValid(new Date(link.createdAt)) ? format(new Date(link.createdAt), 'MMM d, yyyy') : 'No Date'}
                                            </span>

                                            <div className="flex items-center gap-1 ml-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggle(link)} title={link.isActive ? 'Deactivate' : 'Activate'}>
                                                    {link.isActive ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(link)} title="Edit">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <a href={link.targetUrl} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Open target URL">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </a>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(link.id)} title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); resetForm(); } }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Shortlink' : 'Create Shortlink'}</DialogTitle>
                        <DialogDescription>
                            {editing ? 'Update the shortlink details below.' : 'Create a new short URL. Leave the code empty to auto-generate one.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">Code <span className="text-muted-foreground">(optional)</span></label>
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-muted-foreground shrink-0">{siteUrl}</span>
                                <input
                                    type="text"
                                    value={form.code}
                                    onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))}
                                    placeholder="auto-generated"
                                    className="flex-1 bg-background border border-border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary outline-none text-sm font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Target URL <span className="text-red-500">*</span></label>
                            <input
                                type="url"
                                value={form.targetUrl}
                                onChange={(e) => setForm(f => ({ ...f, targetUrl: e.target.value }))}
                                placeholder="https://example.com/very-long-url"
                                className="w-full bg-background border border-border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary outline-none text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Title <span className="text-muted-foreground">(optional)</span></label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                placeholder="My GitHub, Resume, etc."
                                className="w-full bg-background border border-border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary outline-none text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Expires at <span className="text-muted-foreground">(optional)</span></label>
                            <input
                                type="datetime-local"
                                value={form.expiresAt}
                                onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                                className="w-full bg-background border border-border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary outline-none text-sm"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                editing ? 'Update' : 'Create'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
