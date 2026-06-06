'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { readNestJson } from '@/lib/api/readJson';
import { Button } from '@/components/ui/Button';
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
  Lock,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, isValid } from 'date-fns';
import Image from 'next/image';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AdminPageHeader, BulkActionBar, AdminEmptyState } from '@/components/admin/shared';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PUBLIC_LETTER_PREFIX = 'https://yunkhngn.dev/letter/';

export default function AdminLetters() {
  const router = useRouter();
  const { user } = useAuth();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const openCreate = () => router.push('/admin/letters/new');
  const openEdit = (letter) => router.push(`/admin/letters/${letter.id}`);

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
      <div className="mx-auto space-y-6">
        <AdminPageHeader
          title="Letters"
          description="Manage your handwritten epistles"
          action={{ label: 'New letter', onClick: openCreate, icon: <Plus className="mr-2 h-4 w-4" /> }}
        />

        {selected.size > 0 && (
          <BulkActionBar
            count={selected.size}
            onDelete={openBulkDelete}
            onClear={clearSelection}
          >
            <Button size="sm" variant="outline" onClick={() => bulkSetStatus(true)} disabled={bulkLoading}>
              <ToggleRight className="mr-2 h-4 w-4 text-emerald-500" /> Activate
            </Button>
            <Button size="sm" variant="outline" onClick={() => bulkSetStatus(false)} disabled={bulkLoading}>
              <ToggleLeft className="mr-2 h-4 w-4" /> Deactivate
            </Button>
          </BulkActionBar>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : letters.length === 0 ? (
          <AdminEmptyState
            icon={Mail}
            title="No letters yet"
            description="Create your first handwritten letter to share with someone special."
            action={{ label: 'Create a letter', onClick: openCreate, icon: <Plus className="mr-2 h-4 w-4" /> }}
          />
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
                            <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                              {letter.kind === 'text' ? (
                                <span className={cn(
                                  "text-sm font-bold text-amber-500/80",
                                  letter.font === 'reebie' ? 'font-reebie' : 'font-fz'
                                )}>
                                  Aa
                                </span>
                              ) : (
                                <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                              )}
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                          <span className="absolute bottom-1 right-1 text-[8px] font-bold text-white">
                            {letter.kind === 'text' ? 'Text' : `${letter.pages?.length || 0}p`}
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
