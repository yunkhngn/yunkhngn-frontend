'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { readNestJson } from '@/lib/api/readJson';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  Mail,
  Plus,
  Copy,
  Trash2,
  Edit,
  Loader2,
  ToggleLeft,
  ToggleRight,
  CheckSquare,
  Square,
  XCircle,
  Lock,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, isValid } from 'date-fns';
import Image from 'next/image';
import { ConfirmModal } from '@/components/ui/ConfirmModal';


const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PUBLIC_LETTER_PREFIX = 'https://yunkhngn.dev/letter/';

function emptyPage() {
  return { imageUrl: '', width: null, height: null, localKey: Math.random().toString(36).slice(2) };
}

export default function AdminLetters() {
  const { user } = useAuth();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);

  const fileRefs = useRef({});

  const [form, setForm] = useState({
    code: '',
    title: '',
    password: '',
    removePassword: false,
    isActive: true,
    enableAnimation: true,
    pages: [emptyPage()],
  });

  const fetchLetters = useCallback(async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/letters`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLetters(await readNestJson(res));
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load letters');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  const anyProcessing = letters.some((l) => l.status === 'processing');

  useEffect(() => {
    if (!anyProcessing) return;
    const id = setInterval(fetchLetters, 5000);
    return () => clearInterval(id);
  }, [anyProcessing, fetchLetters]);

  const resetForm = () => {
    setForm({
      code: '',
      title: '',
      password: '',
      removePassword: false,
      isActive: true,
      enableAnimation: true,
      pages: [emptyPage()],
    });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (letter) => {
    setEditing(letter);
    setForm({
      code: letter.code,
      title: letter.title || '',
      password: '',
      removePassword: false,
      isActive: letter.isActive,
      enableAnimation: letter.enableAnimation ?? true,
      pages:
        letter.pages?.length > 0
          ? letter.pages.map((p) => ({
            imageUrl: p.imageUrl,
            width: p.width,
            height: p.height,
            localKey: p.id || Math.random().toString(36).slice(2),
          }))
          : [emptyPage()],
    });
    setDialogOpen(true);
  };

  const uploadImageAt = async (index, file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingIdx(index);
    try {
      const token = await user.getIdToken();
      const folder = encodeURIComponent('blog-portfolio/letters');
      const sigRes = await fetch(`${API_URL}/gallery/signature?folder=${folder}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!sigRes.ok) throw new Error('Signature failed');
      const { signature, timestamp, cloudName, apiKey } = await readNestJson(sigRes);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', 'blog-portfolio/letters');

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData },
      );
      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();

      setForm((f) => {
        const pages = [...f.pages];
        pages[index] = {
          ...pages[index],
          imageUrl: uploadData.secure_url,
          width: uploadData.width,
          height: uploadData.height,
        };
        return { ...f, pages };
      });
      toast.success('Image uploaded');
    } catch (e) {
      console.error(e);
      toast.error('Upload failed');
    } finally {
      setUploadingIdx(null);
    }
  };

  const addPageSlot = () => {
    if (form.pages.length >= 3) return;
    setForm((f) => ({ ...f, pages: [...f.pages, emptyPage()] }));
  };

  const removePageSlot = (index) => {
    if (form.pages.length <= 1) return;
    setForm((f) => ({
      ...f,
      pages: f.pages.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    const pagesPayload = form.pages
      .filter((p) => p.imageUrl)
      .map((p, i) => ({
        imageUrl: p.imageUrl,
        width: p.width ?? undefined,
        height: p.height ?? undefined,
        sortOrder: i,
      }));

    if (pagesPayload.length === 0) {
      toast.error('Add at least one page image');
      return;
    }

    let pagesChanged = true;
    if (editing && editing.pages?.length === pagesPayload.length) {
      pagesChanged = pagesPayload.some(
        (p, i) => p.imageUrl !== editing.pages[i]?.imageUrl,
      );
    }

    setSaving(true);
    try {
      const token = await user.getIdToken();
      const body = {
        title: form.title || undefined,
        isActive: form.isActive,
        enableAnimation: form.enableAnimation,
      };

      if (!editing || pagesChanged) body.pages = pagesPayload;
      if (form.code.trim()) body.code = form.code.trim();
      if (form.password.trim()) body.password = form.password.trim();
      if (editing && form.removePassword) body.removePassword = true;

      if (editing) {
        if (!form.code.trim()) delete body.code;
        const res = await fetch(`${API_URL}/letters/${editing.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          toast.success('Letter updated');
          setDialogOpen(false);
          resetForm();
          fetchLetters();
        } else {
          const data = await readNestJson(res).catch(() => ({}));
          toast.error(data.message || 'Update failed');
        }
      } else {
        const res = await fetch(`${API_URL}/letters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          toast.success('Letter created');
          setDialogOpen(false);
          resetForm();
          fetchLetters();
        } else {
          const data = await readNestJson(res).catch(() => ({}));
          toast.error(data.message || 'Create failed');
        }
      }
    } catch (e) {
      console.error(e);
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
        const res = await fetch(`${API_URL}/letters/${deleteId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          toast.success('Letter deleted');
          fetchLetters();
        } else toast.error('Delete failed');
      } catch (e) {
        console.error(e);
        toast.error('Network error');
      } finally {
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      }
    } else {
      await bulkDelete();
    }
  };

  const handleToggle = async (letter) => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/letters/${letter.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !letter.isActive }),
      });
      if (res.ok) {
        toast.success(letter.isActive ? 'Deactivated' : 'Activated');
        fetchLetters();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRetry = async (letter) => {
    const pagesPayload = letter.pages.map((p, i) => ({
      imageUrl: p.imageUrl,
      width: p.width ?? undefined,
      height: p.height ?? undefined,
      sortOrder: i,
    }));
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/letters/${letter.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pages: pagesPayload }),
      });
      if (res.ok) {
        toast.success('Reprocessing started');
        fetchLetters();
      } else toast.error('Retry failed');
    } catch (e) {
      console.error(e);
      toast.error('Network error');
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === letters.length) setSelected(new Set());
    else setSelected(new Set(letters.map((l) => l.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const openBulkDelete = () => {
    setDeleteId(null);
    setIsDeleteModalOpen(true);
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/letters/bulk/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: [...selected] }),
      });
      if (res.ok) {
        const data = await readNestJson(res);
        toast.success(`Deleted ${data.deleted} letter(s)`);
        clearSelection();
        fetchLetters();
      } else toast.error('Bulk delete failed');
    } catch (e) {
      console.error(e);
      toast.error('Network error');
    } finally {
      setBulkLoading(false);
      setIsDeleteModalOpen(false);
    }
  };


  const bulkSetStatus = async (isActive) => {
    setBulkLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/letters/bulk/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: [...selected], isActive }),
      });
      if (res.ok) {
        const data = await readNestJson(res);
        toast.success(
          `${isActive ? 'Activated' : 'Deactivated'} ${data.updated} letter(s)`,
        );
        clearSelection();
        fetchLetters();
      } else toast.error('Bulk update failed');
    } catch (e) {
      console.error(e);
      toast.error('Network error');
    } finally {
      setBulkLoading(false);
    }
  };

  const copyPublicUrl = (code) => {
    navigator.clipboard.writeText(`${PUBLIC_LETTER_PREFIX}${code}`);
    toast.success('Copied letter URL');
  };

  const statusBadge = (status) => {
    if (status === 'processing')
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
          <Loader2 className="h-3 w-3 animate-spin" /> Processing
        </span>
      );
    if (status === 'ready')
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold uppercase tracking-wider">
          Ready
        </span>
      );
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold uppercase tracking-wider">
        Failed
      </span>
    );
  };

  return (
    <>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Letters</span>
            </h1>
            <p className="text-muted-foreground font-medium text-lg ml-1">
              Manage your handwritten epistles
            </p>
          </div>
          <Button onClick={openCreate} className="px-6 py-6 h-auto rounded-2xl shadow-xl hover:shadow-primary/20 transition-all font-bold gap-2">
            <Plus className="h-5 w-5" />
            New letter
          </Button>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-4 mb-6 p-4 bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-lg ring-1 ring-white/5 animate-in slide-in-from-top-4">
            <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{selected.size} selected</span>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => bulkSetStatus(true)}
              disabled={bulkLoading}
              className="gap-1.5 rounded-xl font-semibold border-border/50 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30"
            >
              <ToggleRight className="h-4 w-4" /> Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => bulkSetStatus(false)}
              disabled={bulkLoading}
              className="gap-1.5 rounded-xl font-semibold border-border/50 hover:bg-zinc-500/10 hover:text-zinc-400 hover:border-zinc-500/30"
            >
              <ToggleLeft className="h-4 w-4" /> Deactivate
            </Button>
            <div className="w-px h-6 bg-border/50 mx-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={openBulkDelete}
              disabled={bulkLoading}
              className="gap-1.5 rounded-xl font-semibold text-rose-500 border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400"
            >

              {bulkLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}{' '}
              Delete
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full ml-1"
              onClick={clearSelection}
            >
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : letters.length === 0 ? (
          <div className="border border-dashed border-border/50 rounded-3xl p-16 flex flex-col items-center justify-center text-center bg-card/10 backdrop-blur-sm">
            <div className="p-6 bg-muted/30 rounded-full mb-6 ring-1 ring-border/50">
              <Mail className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-bold mb-2">No letters yet</h3>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Create your first handwritten letter to share with someone special.
            </p>
            <Button onClick={openCreate} className="px-8 py-6 h-auto rounded-xl font-bold gap-2">
              <Plus className="h-5 w-5" />
              Create a letter
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead className="bg-muted/50 text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3 w-[50px]">
                    <Checkbox
                      checked={selected.size === letters.length && letters.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">Cover & Code</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Stats</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {letters.map((letter) => (
                  <tr
                    key={letter.id}
                    className={`hover:bg-muted/50 transition-colors ${!letter.isActive ? 'opacity-60 grayscale-[0.3]' : ''} ${selected.has(letter.id) ? 'bg-primary/[0.03]' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selected.has(letter.id)}
                        onCheckedChange={() => toggleSelect(letter.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-16 bg-muted rounded overflow-hidden shrink-0 border border-border/50">
                          {letter.pages?.[0]?.imageUrl ? (
                            <Image
                              src={letter.pages[0].imageUrl}
                              alt=""
                              fill
                              sizes="64px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                          <span className="absolute bottom-1 right-1 text-[8px] font-bold text-white">
                            {letter.pages?.length || 0}p
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-primary/90 font-mono">
                              {letter.code}
                            </code>
                            <button
                              type="button"
                              onClick={() => copyPublicUrl(letter.code)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                              title="Copy URL"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {letter.createdAt && isValid(new Date(letter.createdAt)) ? format(new Date(letter.createdAt), 'MMM d, yyyy') : 'No Date'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {letter.title ? (
                          <span className="font-medium line-clamp-1">{letter.title}</span>
                        ) : (
                          <span className="text-muted-foreground italic line-clamp-1">Untitled</span>
                        )}
                        {letter.hasPassword && (
                          <Lock className="h-3 w-3 text-amber-500 shrink-0" title="Password protected" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${letter.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}>
                          {letter.isActive ? 'Active' : 'Archived'}
                        </span>
                        {statusBadge(letter.status)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{letter.views ?? 0}</span>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Views</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {letter.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRetry(letter)}
                            title="Retry"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggle(letter)}
                          title={letter.isActive ? 'Archive' : 'Activate'}
                        >
                          {letter.isActive ? (
                            <ToggleRight className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(letter)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(letter.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden border-amber-900/20">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {editing ? <Edit className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
              {editing ? 'Edit letter' : 'New letter'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editing
                ? 'Update details or replace page images to reprocess.'
                : 'Add 1–3 scanned pages. Leave code empty to auto-generate.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-2 space-y-5 custom-scrollbar">
            <div>
              <label className="block text-sm font-medium mb-1">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value }))
                }
                placeholder="auto-generated"
                className="w-full bg-background border border-border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary outline-none text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="w-full bg-background border border-border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Password (optional)
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                placeholder={
                  editing ? 'New password (optional)' : 'Protect with password'
                }
                className="w-full bg-background border border-border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary outline-none text-sm"
              />
              {editing && (
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.removePassword}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        removePassword: e.target.checked,
                      }))
                    }
                  />
                  Remove password (make public)
                </label>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
              />
              Active
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.enableAnimation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, enableAnimation: e.target.checked }))
                }
              />
              Enable writing animation (reveals strokes instead of static image)
            </label>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Pages (max 3)</span>
                {form.pages.length < 3 && (
                  <Button type="button" variant="outline" size="sm" onClick={addPageSlot}>
                    Add page
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {form.pages.map((page, index) => (
                  <div
                    key={page.localKey || index}
                    className="border border-border/50 rounded-lg p-3 bg-muted/30 relative group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Page {index + 1}
                      </span>
                      {form.pages.length > 1 && (
                        <button
                          type="button"
                          className="p-1 rounded-full hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                          onClick={() => removePageSlot(index)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex gap-3 items-center">
                      <div className="relative w-14 h-14 rounded border border-border bg-background shrink-0 overflow-hidden">
                        {page.imageUrl ? (
                          <Image src={page.imageUrl} alt="" fill sizes="56px" className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground/30" />
                          </div>
                        )}
                        {uploadingIdx === index && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <input
                          ref={(el) => {
                            fileRefs.current[index] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) uploadImageAt(index, f);
                            e.target.value = '';
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-[11px] gap-1.5"
                          disabled={uploadingIdx === index}
                          onClick={() => fileRefs.current[index]?.click()}
                        >
                          {page.imageUrl ? 'Replace' : 'Upload'}
                        </Button>
                        {page.imageUrl && (
                          <p className="text-[10px] text-muted-foreground mt-1 truncate">
                            {page.imageUrl.split('/').pop()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-2 border-t mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : editing ? (
                'Update'
              ) : (
                'Create'
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
        title="Delete Letter(s)"
        description={deleteId
          ? "Are you sure you want to delete this letter? This action cannot be undone."
          : `Are you sure you want to delete ${selected.size} letter(s)? This action cannot be undone.`
        }
      />
    </>
  );
}
