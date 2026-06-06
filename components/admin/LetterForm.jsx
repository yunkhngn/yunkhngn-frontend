'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { readNestJson } from '@/lib/api/readJson';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Loader2, Image as ImageIcon, XCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import LetterEditor from '@/components/admin/LetterEditor';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function emptyPage() {
  return { imageUrl: '', width: null, height: null, localKey: Math.random().toString(36).slice(2) };
}

export default function LetterForm({ letter = null }) {
  const router = useRouter();
  const { user } = useAuth();
  const editing = !!letter;
  const fileRefs = useRef({});
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);

  const [form, setForm] = useState(() => ({
    code: letter?.code || '',
    title: letter?.title || '',
    password: '',
    removePassword: false,
    isActive: letter?.isActive ?? true,
    enableAnimation: letter?.enableAnimation ?? true,
    kind: letter?.kind || 'scan',
    font: letter?.font || 'fz',
    contentJSON: letter?.contentJSON || '',
    pages:
      letter?.pages?.length > 0
        ? letter.pages.map((p) => ({
            imageUrl: p.imageUrl,
            width: p.width,
            height: p.height,
            localKey: p.id || Math.random().toString(36).slice(2),
          }))
        : [emptyPage()],
  }));

  const goBack = () => router.push('/admin/letters');

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
    setForm((f) => ({ ...f, pages: f.pages.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    const isTextMode = form.kind === 'text';
    let pagesPayload = [];

    if (!isTextMode) {
      pagesPayload = form.pages
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
    } else if (!form.contentJSON || form.contentJSON.trim() === '') {
      toast.error('Nội dung thư không được để trống');
      return;
    }

    let pagesChanged = true;
    if (!isTextMode && editing && letter.pages?.length === pagesPayload.length) {
      pagesChanged = pagesPayload.some((p, i) => p.imageUrl !== letter.pages[i]?.imageUrl);
    } else if (isTextMode) {
      pagesChanged = false;
    }

    setSaving(true);
    try {
      const token = await user.getIdToken();
      const body = {
        title: form.title || undefined,
        isActive: form.isActive,
        enableAnimation: form.enableAnimation,
        kind: form.kind,
      };

      if (isTextMode) {
        body.font = form.font;
        body.contentJSON = form.contentJSON;
      } else if (!editing || pagesChanged) {
        body.pages = pagesPayload;
      }

      if (form.code.trim()) body.code = form.code.trim();
      if (form.password.trim()) body.password = form.password.trim();
      if (editing && form.removePassword) body.removePassword = true;

      const url = editing ? `${API_URL}/letters/${letter.id}` : `${API_URL}/letters`;
      const method = editing ? 'PATCH' : 'POST';
      if (editing && !form.code.trim()) delete body.code;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editing ? 'Letter updated' : 'Letter created');
        goBack();
      } else {
        const data = await readNestJson(res).catch(() => ({}));
        toast.error(data.message || (editing ? 'Update failed' : 'Create failed'));
      }
    } catch (e) {
      console.error(e);
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={goBack} title="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{editing ? 'Edit letter' : 'New letter'}</h1>
          <p className="text-xs text-muted-foreground">
            {editing
              ? 'Update details, content, or page images.'
              : 'Write a letter or upload scanned pages. Leave code empty to auto-generate.'}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Code</label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            placeholder="auto-generated"
            className="w-full bg-background border border-border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary outline-none text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full bg-background border border-border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password (optional)</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder={editing ? 'New password (optional)' : 'Protect with password'}
            className="w-full bg-background border border-border rounded-md px-3 py-2 focus:ring-1 focus:ring-primary outline-none text-sm"
          />
          {editing && (
            <label className="flex items-center gap-2 mt-2 text-sm">
              <input
                type="checkbox"
                checked={form.removePassword}
                onChange={(e) => setForm((f) => ({ ...f, removePassword: e.target.checked }))}
              />
              Remove password (make public)
            </label>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          />
          Active
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.enableAnimation}
            onChange={(e) => setForm((f) => ({ ...f, enableAnimation: e.target.checked }))}
          />
          Enable animation (scan: reveal strokes · text: reveal word-by-word)
        </label>

        <div>
          <label className="block text-sm font-medium mb-1.5">Loại thư</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, kind: 'scan' }))}
              className={cn(
                'py-2 rounded-md border text-sm font-medium transition-all',
                form.kind === 'scan'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                  : 'bg-background border-border text-muted-foreground hover:border-neutral-700',
              )}
            >
              Thư quét ảnh (Scan)
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, kind: 'text' }))}
              className={cn(
                'py-2 rounded-md border text-sm font-medium transition-all',
                form.kind === 'text'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                  : 'bg-background border-border text-muted-foreground hover:border-neutral-700',
              )}
            >
              Thư viết tay (Write)
            </button>
          </div>
        </div>

        {form.kind === 'text' ? (
          <LetterEditor
            value={form.contentJSON}
            onChange={(contentJSON) => setForm((f) => ({ ...f, contentJSON }))}
            font={form.font}
            onFontChange={(font) => setForm((f) => ({ ...f, font }))}
          />
        ) : (
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
        )}
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={goBack}>
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
      </div>
    </div>
  );
}
