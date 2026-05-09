'use client';

import { useState, useEffect, useCallback } from 'react';
import { readNestJson } from '@/lib/api/readJson';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { Link2, Plus, Copy, Trash2, Edit, ExternalLink, Loader2, BarChart3, ToggleLeft, ToggleRight, CheckSquare, Square, Checkbox } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, isValid } from 'date-fns';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AdminPageHeader, BulkActionBar, AdminEmptyState, StatusIndicator } from '@/components/admin/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';



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
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


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

    const handleDelete = (id) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId && selected.size === 0) return;

        if (deleteId) {
            try {
                const token = await user.getIdToken();
                const res = await fetch(`${API_URL}/shortlinks/${deleteId}`, {
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
            } finally {
                setIsDeleteModalOpen(false);
                setDeleteId(null);
            }
        } else {
            await bulkDelete();
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
        if (selected.size === 0) return;
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
            setIsDeleteModalOpen(false);
        }
    };

    const openBulkDelete = () => {
        setDeleteId(null);
        setIsDeleteModalOpen(true);
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
                <div className="mb-8">
                    <AdminPageHeader
                        title="Shortlinks"
                        description="Manage your short URLs"
                        action={{ label: 'Create Shortlink', icon: <Plus className="h-4 w-4" />, onClick: openCreate }}
                    />
                </div>

                {/* Bulk Action Bar */}
                {selected.size > 0 && (
                    <BulkActionBar
                        count={selected.size}
                        onClear={clearSelection}
                        onDelete={openBulkDelete}
                        loading={bulkLoading}
                    >
                        <Button variant="outline" size="sm" onClick={() => bulkSetStatus(true)} disabled={bulkLoading} className="gap-1.5">
                            <ToggleRight className="h-3.5 w-3.5 text-green-500" /> Activate
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => bulkSetStatus(false)} disabled={bulkLoading} className="gap-1.5">
                            <ToggleLeft className="h-3.5 w-3.5" /> Deactivate
                        </Button>
                    </BulkActionBar>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : links.length === 0 ? (
                    <AdminEmptyState
                        icon={<Link2 className="h-12 w-12" />}
                        message="No shortlinks yet"
                        action={{ label: 'Create your first shortlink', onClick: openCreate }}
                    />
                ) : (
                    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="w-[50px] px-4">
                                            <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center">
                                                {selected.size === links.length ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                                            </button>
                                        </TableHead>
                                        <TableHead className="w-[30%]">Shortlink Details</TableHead>
                                        <TableHead className="w-[35%]">Target URL</TableHead>
                                        <TableHead>Stats & Time</TableHead>
                                        <TableHead className="text-right px-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {links.map((link) => (
                                        <TableRow
                                            key={link.id}
                                            className={`group transition-all ${!link.isActive ? 'opacity-50' : ''} ${selected.has(link.id) ? 'bg-primary/[0.02]' : 'hover:bg-muted/30'}`}
                                            onClick={() => toggleSelect(link.id)}
                                        >
                                            <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => toggleSelect(link.id)} className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center">
                                                    {selected.has(link.id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                                                </button>
                                            </TableCell>
                                            <TableCell className="py-3">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        {link.title && (
                                                            <span className="font-semibold text-sm line-clamp-1">{link.title}</span>
                                                        )}
                                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${link.isActive ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                                                            {link.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                        {link.expiresAt && new Date(link.expiresAt) < new Date() && (
                                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">Expired</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <code className="text-primary font-mono text-sm font-bold">{siteUrl}{link.code}</code>
                                                        <button onClick={() => copyShortUrl(link.code)} className="text-muted-foreground hover:text-foreground transition-colors" title="Copy short URL">
                                                            <Copy className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-0" onClick={(e) => e.stopPropagation()}>
                                                <a href={link.targetUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground truncate block transition-colors max-w-xs md:max-w-sm">
                                                    {link.targetUrl}
                                                </a>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs" title="Total clicks">
                                                        <BarChart3 className="h-3.5 w-3.5" />
                                                        <span className="font-medium">{link.clicks} clicks</span>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                                        {link.createdAt && isValid(new Date(link.createdAt)) ? format(new Date(link.createdAt), 'MMM d, yyyy') : 'No Date'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggle(link)} title={link.isActive ? 'Deactivate' : 'Activate'}>
                                                        {link.isActive ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(link)} title="Edit">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <a href={link.targetUrl} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Open target URL">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(link.id)} title="Delete">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
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

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteId(null);
                }}
                onConfirm={confirmDelete}
                loading={bulkLoading}
                title="Delete Shortlink"
                description={deleteId
                    ? "Are you sure you want to delete this shortlink? This action cannot be undone."
                    : `Are you sure you want to delete ${selected.size} shortlink(s)? This action cannot be undone.`
                }
            />
        </>

    );
}
