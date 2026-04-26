import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import AdminLayout from '@/components/template/Admin/Layout';
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
import { format } from 'date-fns';
import Image from 'next/image';

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
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const fileRefs = useRef({});

  const [form, setForm] = useState({
    code: '',
    title: '',
    password: '',
    removePassword: false,
    isActive: true,
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
        setLetters(await res.json());
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
      const sigRes = await fetch(`${API_URL}/gallery/signature?folder=${folder}&quality=auto:best&format=png`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!sigRes.ok) throw new Error('Signature failed');
      const { signature, timestamp, cloudName, apiKey } = await sigRes.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', 'blog-portfolio/letters');
      formData.append('quality', 'auto:best');
      formData.append('format', 'png');

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
          const data = await res.json().catch(() => ({}));
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
          const data = await res.json().catch(() => ({}));
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

  const handleDelete = async (id) => {
    if (!confirm('Delete this letter?')) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/letters/${id}`, {
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

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} letter(s)?`)) return;
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
        const data = await res.json();
        toast.success(`Deleted ${data.deleted} letter(s)`);
        clearSelection();
        fetchLetters();
      } else toast.error('Bulk delete failed');
    } catch (e) {
      console.error(e);
      toast.error('Network error');
    } finally {
      setBulkLoading(false);
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
        const data = await res.json();
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
        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 inline-flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" /> Processing
        </span>
      );
    if (status === 'ready')
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Ready
        </span>
      );
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        Failed
      </span>
    );
  };

  return (
    <AdminLayout>
      <Head>
        <title>Letters | Admin</title>
      </Head>

      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Mail className="h-8 w-8" />
              Letters
            </h1>
            <p className="text-muted-foreground mt-1">
              Handwritten letters with share links
            </p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New letter
          </Button>
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg animate-in slide-in-from-top-2">
            <span className="text-sm font-medium">{selected.size} selected</span>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => bulkSetStatus(true)}
              disabled={bulkLoading}
              className="gap-1.5"
            >
              <ToggleRight className="h-3.5 w-3.5 text-green-500" /> Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => bulkSetStatus(false)}
              disabled={bulkLoading}
              className="gap-1.5"
            >
              <ToggleLeft className="h-3.5 w-3.5" /> Deactivate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={bulkDelete}
              disabled={bulkLoading}
              className="gap-1.5 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:border-red-700 dark:hover:bg-red-950"
            >
              {bulkLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}{' '}
              Delete
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={clearSelection}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : letters.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Mail className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">No letters yet</p>
              <Button onClick={openCreate} variant="outline" className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Create a letter
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {selected.size === letters.length ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
              </button>
              <span className="text-xs text-muted-foreground">
                {selected.size === letters.length ? 'Deselect all' : 'Select all'}
              </span>
            </div>

            {letters.map((letter) => (
              <Card
                key={letter.id}
                className={`transition-all ${!letter.isActive ? 'opacity-50' : ''} ${selected.has(letter.id) ? 'ring-1 ring-primary/50 bg-primary/[0.02]' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleSelect(letter.id)}
                        className="mt-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        {selected.has(letter.id) ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>

                      <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                        {letter.pages?.[0]?.imageUrl ? (
                          <Image
                            src={letter.pages[0].imageUrl}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 text-[10px] px-1 bg-black/60 text-white rounded-tl">
                          {letter.pages?.length || 0}p
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {letter.title && (
                            <span className="font-semibold text-sm truncate max-w-[200px]">
                              {letter.title}
                            </span>
                          )}
                          {letter.hasPassword && (
                            <Lock
                              className="h-3.5 w-3.5 text-amber-600"
                              title="Password protected"
                            />
                          )}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${letter.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                          >
                            {letter.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {statusBadge(letter.status)}
                        </div>

                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-primary font-mono text-sm font-bold truncate">
                            {PUBLIC_LETTER_PREFIX}
                            {letter.code}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyPublicUrl(letter.code)}
                            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            title="Copy URL"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {letter.views ?? 0} views ·{' '}
                          {format(new Date(letter.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {letter.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleRetry(letter)}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Retry
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleToggle(letter)}
                        title={letter.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {letter.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-500" />
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
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(letter.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                          <Image src={page.imageUrl} alt="" fill className="object-cover" unoptimized />
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
    </AdminLayout>
  );
}
