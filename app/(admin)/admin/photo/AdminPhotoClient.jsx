'use client';

import { readNestJson } from '@/lib/api/readJson';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Loader2, Upload, Trash2, Pencil, X, Image as ImageIcon, ChevronLeft, ChevronRight, Plus, FolderOpen, Tag, GripVertical, CheckSquare, Square, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import Image from 'next/image';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';
import { AdminPageHeader, BulkActionBar, AdminEmptyState } from '@/components/admin/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function PhotoCard({ photo, isSelected, onToggleSelect, onView, onEdit, onDelete }) {
    return (
        <div className={`aspect-square relative rounded-xl overflow-hidden group bg-muted ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}>

            {/* Select checkbox */}
            <button
                className="absolute top-1 right-1 z-20 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); onToggleSelect(photo.id); }}
            >
                {isSelected ? <CheckSquare className="h-3.5 w-3.5 text-primary" /> : <Square className="h-3.5 w-3.5" />}
            </button>

            <Image
                src={photo.imageUrl}
                alt={photo.caption || 'Photo'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                onClick={() => onView(photo)}
                unoptimized
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />

            {/* Bottom actions */}
            <div className="absolute bottom-1 right-1 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onEdit(photo); }} className="p-1.5 rounded bg-black/60 text-white hover:bg-black/80 transition-colors">
                    <Pencil className="h-3 w-3" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(photo.id); }} className="p-1.5 rounded bg-red-500/70 text-white hover:bg-red-600 transition-colors">
                    <Trash2 className="h-3 w-3" />
                </button>
            </div>

            {/* Tags indicator */}
            {photo.tags && (
                <div className="absolute bottom-1 left-1 z-20">
                    <div className="p-1 rounded bg-black/50 text-white">
                        <Tag className="h-3 w-3" />
                    </div>
                </div>
            )}
        </div>
    );
}

async function getApiErrorMessage(response, fallback) {
    try {
        const data = await response.json();
        const message = data?.message || data?.data?.message || data?.error;
        return Array.isArray(message) ? message.join(', ') : message || fallback;
    } catch {
        return fallback;
    }
}

export default function PhotoManager() {
    const { user } = useAuth();

    // Photos
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Albums
    const [albums, setAlbums] = useState([]);
    const [selectedAlbumFilter, setSelectedAlbumFilter] = useState(null);
    const [albumDialogOpen, setAlbumDialogOpen] = useState(false);
    const [editingAlbum, setEditingAlbum] = useState(null);
    const [albumForm, setAlbumForm] = useState({ name: '', description: '' });

    // Bulk Upload
    const [stagedPhotos, setStagedPhotos] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [uploadAlbumId, setUploadAlbumId] = useState('');

    // View / Edit / Delete
    const [viewingPhoto, setViewingPhoto] = useState(null);
    const [editingPhoto, setEditingPhoto] = useState(null);
    const [editForm, setEditForm] = useState({ caption: '', tags: '', albumId: '' });
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteType, setDeleteType] = useState(null); // 'PHOTO', 'BULK_PHOTO', 'ALBUM'
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 12;

    // Multi-select
    const [selected, setSelected] = useState(new Set());
    const [bulkLoading, setBulkLoading] = useState(false);
    const [bulkEditOpen, setBulkEditOpen] = useState(false);
    const [bulkEditData, setBulkEditData] = useState({ albumId: '', tags: '' });

    // Drag
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Locket backup
    const [locketLoading, setLocketLoading] = useState(false);
    const [locketResult, setLocketResult] = useState(null);

    // Fetch photos
    const fetchPhotos = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(itemsPerPage) });
            if (selectedAlbumFilter) params.set('albumId', selectedAlbumFilter);

            const res = await fetch(`${API_URL}/gallery?${params}`);
            if (!res.ok) throw new Error('Failed');
            const result = await readNestJson(res);
            setPhotos(result.data);
            setTotalPages(result.totalPages);
            setCurrentPage(page);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [selectedAlbumFilter]);

    const fetchAlbums = async () => {
        try {
            const res = await fetch(`${API_URL}/albums`);
            if (res.ok) setAlbums(await readNestJson(res));
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchPhotos(1); }, [fetchPhotos]);
    useEffect(() => { fetchAlbums(); }, []);

    const startPolling = useCallback((initialStatus = null) => {
        setLocketLoading(true);
        if (initialStatus && !initialStatus.isRunning) {
            setLocketLoading(false);
            if (initialStatus.lastResult?.error) {
                setLocketResult({ ok: false, error: initialStatus.lastResult.error });
                toast.error(initialStatus.lastResult.error);
            } else if (initialStatus.lastResult) {
                setLocketResult({ ok: true, imported: initialStatus.lastResult.imported, skipped: initialStatus.lastResult.skipped });
                toast.success(`Backup xong: +${initialStatus.lastResult.imported} ảnh mới`);
                fetchPhotos(1);
            }
            return;
        }

        let consecutiveErrors = 0;
        const poll = async () => {
            try {
                const t = await user.getIdToken();
                const r = await fetch(`${API_URL}/locket-backup/status`, {
                    headers: { Authorization: `Bearer ${t}` },
                });
                if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
                const d = await r.json();
                const status = d.data ?? d;
                
                consecutiveErrors = 0;
                
                if (!status.isRunning) {
                    setLocketLoading(false);
                    if (status.lastResult?.error) {
                        setLocketResult({ ok: false, error: status.lastResult.error });
                        toast.error(status.lastResult.error);
                    } else if (status.lastResult) {
                        setLocketResult({ ok: true, imported: status.lastResult.imported, skipped: status.lastResult.skipped });
                        toast.success(`Backup xong: +${status.lastResult.imported} ảnh mới`);
                        fetchPhotos(1);
                    }
                    return;
                }
            } catch (err) {
                console.error('Locket backup polling error:', err);
                consecutiveErrors++;
                if (consecutiveErrors >= 5) {
                    setLocketLoading(false);
                    toast.error('Mất kết nối với dịch vụ backup');
                    return;
                }
            }
            setTimeout(poll, 3000);
        };
        setTimeout(poll, 3000);
    }, [user, fetchPhotos]);

    // Check backup status on mount
    useEffect(() => {
        const checkBackupOnMount = async () => {
            if (!user) return;
            try {
                const token = await user.getIdToken();
                const res = await fetch(`${API_URL}/locket-backup/status`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const statusData = await res.json();
                    const status = statusData.data ?? statusData;
                    if (status.isRunning) {
                        startPolling(status);
                    } else if (status.lastResult) {
                        setLocketResult({
                            ok: !status.lastResult.error,
                            imported: status.lastResult.imported,
                            skipped: status.lastResult.skipped,
                            error: status.lastResult.error
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to check backup status on mount:', err);
            }
        };
        checkBackupOnMount();
    }, [user, startPolling]);

    // File handling
    const processFiles = async (files) => {
        if (!files || files.length === 0) return;

        const newStaged = [];
        for (const file of Array.from(files).filter(f => f.type.startsWith('image/'))) {
            let exifData = null;
            try {
                const exifr = (await import('exifr')).default;
                const exif = await exifr.parse(file, { pick: ['Make', 'Model', 'LensModel', 'FocalLength', 'FNumber', 'ExposureTime', 'ISO'] });
                if (exif) {
                    exifData = {};
                    if (exif.Make || exif.Model) exifData.camera = [exif.Make, exif.Model].filter(Boolean).join(' ');
                    if (exif.LensModel) exifData.lens = exif.LensModel;
                    if (exif.FocalLength) exifData.focalLength = `${exif.FocalLength}mm`;
                    if (exif.FNumber) exifData.aperture = `f/${exif.FNumber}`;
                    if (exif.ExposureTime) exifData.shutter = exif.ExposureTime >= 1 ? `${exif.ExposureTime}s` : `1/${Math.round(1 / exif.ExposureTime)}s`;
                    if (exif.ISO) exifData.iso = `${exif.ISO}`;
                }
            } catch { }

            newStaged.push({
                id: Math.random().toString(36).substr(2, 9),
                file,
                preview: URL.createObjectURL(file),
                caption: '',
                tags: '',
                exifData,
            });
        }
        setStagedPhotos(prev => [...prev, ...newStaged]);
    };

    const handleLocketBackup = async () => {
        if (!user) return;
        
        try {
            const token = await user.getIdToken();

            // Check if already running before triggering
            const statusRes = await fetch(`${API_URL}/locket-backup/status`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!statusRes.ok) {
                const message = await getApiErrorMessage(statusRes, `Không thể kiểm tra trạng thái backup (${statusRes.status})`);
                toast.error(message);
                return;
            }

            const statusData = await statusRes.json();
            const status = statusData.data ?? statusData;
            
            if (status.isRunning) {
                toast.info('Backup đang chạy, vui lòng chờ...');
                startPolling(status);
            } else {
                // Fire the backup (202 — backend runs async)
                const res = await fetch(`${API_URL}/locket-backup/run`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    const message = await getApiErrorMessage(res, `Không thể bắt đầu backup (${res.status})`);
                    toast.error(message);
                    return;
                }
                setLocketResult(null);
                startPolling();
            }
        } catch (err) {
            console.error('Failed to trigger Locket backup:', err);
            toast.error('Không thể kết nối đến server backup');
        }
    };

    const handleFileSelect = (e) => { processFiles(e.target.files); e.target.value = ''; };
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files); };
    const removeStagedPhoto = (id) => setStagedPhotos(prev => prev.filter(p => p.id !== id));
    const updateStagedField = (id, field, value) => setStagedPhotos(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    const clearStagedPhotos = () => { stagedPhotos.forEach(p => URL.revokeObjectURL(p.preview)); setStagedPhotos([]); setUploadProgress({ current: 0, total: 0 }); };

    const handleBulkUpload = async () => {
        if (stagedPhotos.length === 0) return;
        setUploading(true);
        setUploadProgress({ current: 0, total: stagedPhotos.length });

        try {
            const token = await user.getIdToken();
            for (let i = 0; i < stagedPhotos.length; i++) {
                const photo = stagedPhotos[i];
                try {
                    const sigRes = await fetch(`${API_URL}/gallery/signature`, { headers: { Authorization: `Bearer ${token}` } });
                    if (!sigRes.ok) throw new Error('Failed to get signature');
                    const { signature, timestamp, cloudName, apiKey } = await readNestJson(sigRes);

                    const formData = new FormData();
                    formData.append('file', photo.file);
                    formData.append('api_key', apiKey);
                    formData.append('timestamp', timestamp);
                    formData.append('signature', signature);
                    formData.append('folder', 'blog-portfolio/gallery');

                    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
                    if (!uploadRes.ok) throw new Error('Upload failed');
                    const uploadData = await uploadRes.json();

                    // Generate blur placeholder
                    const blurHash = uploadData.secure_url.replace('/upload/', '/upload/w_20,q_auto:low,f_auto,e_blur:1000/');

                    const saveRes = await fetch(`${API_URL}/gallery`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({
                            imageUrl: uploadData.secure_url,
                            caption: photo.caption,
                            tags: photo.tags || undefined,
                            albumId: uploadAlbumId || undefined,
                            exifData: photo.exifData ? JSON.stringify(photo.exifData) : undefined,
                            blurHash,
                        })
                    });
                    if (!saveRes.ok) throw new Error('Failed to save');

                    setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
                } catch (err) {
                    console.error('Failed to upload photo %d: %o', i + 1, err);
                    toast.error(`Failed to upload photo ${i + 1}`);
                }
            }
            toast.success('Upload completed');
            clearStagedPhotos();
            setUploadAlbumId('');
            fetchPhotos(1);
        } catch (e) {
            console.error(e);
            toast.error('Bulk upload failed');
        } finally {
            setUploading(false);
        }
    };

    // CRUD
    const handleDelete = (id) => {
        setDeleteId(id);
        setDeleteType('PHOTO');
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        const token = await user.getIdToken();

        if (deleteType === 'PHOTO' && deleteId) {
            try {
                const res = await fetch(`${API_URL}/gallery/${deleteId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                if (!res.ok) throw new Error('Failed');
                fetchPhotos(currentPage);
                toast.success('Photo deleted');
            } catch { toast.error('Failed to delete photo'); }
        } else if (deleteType === 'ALBUM' && deleteId) {
            try {
                await fetch(`${API_URL}/albums/${deleteId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                fetchAlbums();
                if (selectedAlbumFilter === deleteId) setSelectedAlbumFilter(null);
                toast.success('Album deleted');
            } catch { toast.error('Failed to delete album'); }
        } else if (deleteType === 'BULK_PHOTO') {
            setBulkLoading(true);
            try {
                for (const id of selected) {
                    await fetch(`${API_URL}/gallery/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                }
                clearSelection();
                fetchPhotos(currentPage);
                toast.success(`Deleted ${selected.size} photos`);
            } catch { toast.error('Bulk delete failed'); }
            finally { setBulkLoading(false); }
        }

        setIsDeleteModalOpen(false);
        setDeleteId(null);
        setDeleteType(null);
    };

    const openEdit = (photo) => {
        setEditingPhoto(photo);
        setEditForm({ caption: photo.caption || '', tags: photo.tags || '', albumId: photo.albumId || '' });
        setEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingPhoto) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${API_URL}/gallery/${editingPhoto.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    caption: editForm.caption,
                    tags: editForm.tags || null,
                    albumId: editForm.albumId || null,
                })
            });
            if (!res.ok) throw new Error('Failed');
            setEditDialogOpen(false);
            fetchPhotos(currentPage);
            toast.success('Photo updated');
        } catch { toast.error('Failed to update'); }
    };

    // Albums CRUD
    const openAlbumDialog = (album = null) => {
        setEditingAlbum(album);
        setAlbumForm(album ? { name: album.name, description: album.description || '' } : { name: '', description: '' });
        setAlbumDialogOpen(true);
    };

    const handleSaveAlbum = async () => {
        try {
            const token = await user.getIdToken();
            const method = editingAlbum ? 'PATCH' : 'POST';
            const url = editingAlbum ? `${API_URL}/albums/${editingAlbum.id}` : `${API_URL}/albums`;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(albumForm),
            });
            if (!res.ok) throw new Error('Failed');
            setAlbumDialogOpen(false);
            fetchAlbums();
            toast.success(editingAlbum ? 'Album updated' : 'Album created');
        } catch { toast.error('Failed to save album'); }
    };

    const handleDeleteAlbum = (id) => {
        setDeleteId(id);
        setDeleteType('ALBUM');
        setIsDeleteModalOpen(true);
    };

    // Drag-to-reorder removed

    // Multi-select
    const toggleSelect = (id) => setSelected(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });
    const toggleSelectAll = () => setSelected(prev => prev.size === photos.length ? new Set() : new Set(photos.map(p => p.id)));
    const clearSelection = () => setSelected(new Set());

    // Bulk actions
    const handleBulkDelete = () => {
        setDeleteType('BULK_PHOTO');
        setIsDeleteModalOpen(true);
    };

    const handleBulkEdit = async () => {
        setBulkLoading(true);
        try {
            const token = await user.getIdToken();
            await fetch(`${API_URL}/gallery/bulk-update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    ids: [...selected],
                    data: {
                        ...(bulkEditData.albumId ? { albumId: bulkEditData.albumId } : {}),
                        ...(bulkEditData.tags ? { tags: bulkEditData.tags } : {}),
                    },
                }),
            });
            clearSelection();
            setBulkEditOpen(false);
            fetchPhotos(currentPage);
            toast.success('Bulk update done');
        } catch { toast.error('Bulk update failed'); }
        finally { setBulkLoading(false); }
    };

    return (
        <>
            <div className="space-y-6">
                <AdminPageHeader
                    title="Photo Gallery"
                    action={{ label: 'New Album', icon: <Plus className="h-3.5 w-3.5" />, onClick: () => openAlbumDialog() }}
                />

                {/* Albums Bar */}
                {albums.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        <button onClick={() => setSelectedAlbumFilter(null)} className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${!selectedAlbumFilter ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                            All
                        </button>
                        {albums.map(a => (
                            <div key={a.id} className="flex items-center gap-1 shrink-0">
                                <button onClick={() => setSelectedAlbumFilter(a.id)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedAlbumFilter === a.id ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                                    <FolderOpen className="h-3 w-3 inline-block mr-1" />{a.name}
                                    <span className="ml-1 text-xs opacity-60">{a.photoCount}</span>
                                </button>
                                <button onClick={() => openAlbumDialog(a)} className="p-1 text-muted-foreground hover:text-foreground"><Pencil className="h-3 w-3" /></button>
                                <button onClick={() => handleDeleteAlbum(a.id)} className="p-1 text-muted-foreground hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Bulk Action Bar */}
                {selected.size > 0 && (
                    <BulkActionBar
                        count={selected.size}
                        onClear={clearSelection}
                        onDelete={handleBulkDelete}
                        loading={bulkLoading}
                    >
                        <Button variant="outline" size="sm" onClick={() => { setBulkEditData({ albumId: '', tags: '' }); setBulkEditOpen(true); }} disabled={bulkLoading} className="gap-1.5">
                            <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                    </BulkActionBar>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Upload Panel */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 sticky top-4">
                            <h2 className="text-lg font-semibold mb-4">Upload Photos</h2>

                            {/* Album selector for upload */}
                            <div className="mb-4">
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Upload to album</label>
                                <select
                                    value={uploadAlbumId}
                                    onChange={(e) => setUploadAlbumId(e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    <option value="">No album</option>
                                    {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>

                            {/* Drag & Drop */}
                            <div
                                className={`w-full aspect-[4/3] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden group bg-muted/20 ${isDragging ? 'border-primary bg-primary/10' : 'border-border'}`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                                <span className="text-sm text-muted-foreground text-center px-4">
                                    Tap to upload or drag and drop<br />
                                    <span className="text-xs opacity-70">EXIF data auto-extracted</span>
                                </span>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
                            </div>

                            {/* Staged photos */}
                            {stagedPhotos.length > 0 && (
                                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium">Selected ({stagedPhotos.length})</h3>
                                        <Button variant="ghost" size="sm" onClick={clearStagedPhotos} disabled={uploading}>Clear All</Button>
                                    </div>

                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                        {stagedPhotos.map((photo) => (
                                            <div key={photo.id} className="flex gap-3 items-start bg-muted/30 p-2 rounded-lg border">
                                                <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                                    <Image src={photo.preview} alt="Preview" fill sizes="64px" className="object-cover" />
                                                    {photo.exifData && (
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] text-center py-0.5">EXIF ✓</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <Textarea
                                                        placeholder="Caption..."
                                                        value={photo.caption}
                                                        onChange={(e) => updateStagedField(photo.id, 'caption', e.target.value)}
                                                        rows={2}
                                                        className="text-xs min-h-[48px] resize-none"
                                                    />
                                                    <Input
                                                        placeholder="Tags (comma separated)"
                                                        value={photo.tags}
                                                        onChange={(e) => updateStagedField(photo.id, 'tags', e.target.value)}
                                                        className="text-xs h-7"
                                                    />
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeStagedPhoto(photo.id)} disabled={uploading}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <Button className="w-full" onClick={handleBulkUpload} disabled={uploading}>
                                        {uploading ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading {uploadProgress.current}/{uploadProgress.total}</>
                                        ) : (
                                            <><Upload className="mr-2 h-4 w-4" />Upload All</>
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* Locket Backup */}
                            <div className="mt-6 border-t pt-5">
                                <div className="mb-3">
                                    <h2 className="text-sm font-semibold">Backup từ Locket</h2>
                                    <p className="mt-1 text-xs text-muted-foreground">Fetch ảnh/video từ Locket và bỏ qua ảnh trùng.</p>
                                </div>

                                <Button className="w-full" onClick={handleLocketBackup} disabled={locketLoading || !user} variant="outline">
                                    {locketLoading ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang xử lý...</>
                                    ) : (
                                        'Backup ngay'
                                    )}
                                </Button>

                                {locketResult && (
                                    <div className={`mt-3 text-xs rounded-lg p-3 ${locketResult.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                        {locketResult.ok
                                            ? `+${locketResult.imported} ảnh mới · bỏ qua ${locketResult.skipped} trùng`
                                            : locketResult.error}
                                    </div>
                                )}

                                <p className="text-xs text-muted-foreground mt-3 opacity-60">Tự động backup vào ngày 1 hàng tháng</p>
                            </div>
                        </div>
                    </div>

                    {/* Gallery */}
                    <div className="lg:col-span-8">
                        {/* Select all */}
                        <div className="flex items-center gap-2 mb-3">
                            <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-foreground transition-colors">
                                {selected.size === photos.length && photos.length > 0 ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                            </button>
                            <span className="text-xs text-muted-foreground">
                                {selected.size === photos.length && photos.length > 0 ? 'Deselect all' : 'Select all'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {photos.map((photo) => (
                                <PhotoCard
                                    key={photo.id}
                                    photo={photo}
                                    isSelected={selected.has(photo.id)}
                                    onToggleSelect={toggleSelect}
                                    onView={setViewingPhoto}
                                    onEdit={openEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8">
                                <Button variant="outline" size="icon" onClick={() => fetchPhotos(currentPage - 1)} disabled={currentPage === 1}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                                <Button variant="outline" size="icon" onClick={() => fetchPhotos(currentPage + 1)} disabled={currentPage === totalPages}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {loading && <div className="text-center py-12 text-muted-foreground">Loading...</div>}
                        {!loading && photos.length === 0 && (
                            <div className="mt-8">
                                <AdminEmptyState
                                    icon={<ImageIcon className="h-12 w-12" />}
                                    message="No photos yet."
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Photo Modal */}
            <Dialog open={!!viewingPhoto} onOpenChange={(open) => !open && setViewingPhoto(null)}>
                <DialogContent showCloseButton={false} className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none sm:bg-transparent">
                    {viewingPhoto && (
                        <div className="relative flex flex-col items-center justify-center min-h-[50vh] max-h-[90vh] pointer-events-none">
                            <div className="relative max-w-full max-h-[80vh] pointer-events-auto">
                                <Button variant="secondary" size="icon" className="absolute top-2 right-2 z-50 rounded-full opacity-80 hover:opacity-100 bg-black/50 hover:bg-black/70 text-white border-none" onClick={() => setViewingPhoto(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                                <Button variant="secondary" size="icon" className="absolute top-2 right-14 z-50 rounded-full opacity-80 hover:opacity-100 bg-black/50 hover:bg-black/70 text-white border-none" onClick={() => { setViewingPhoto(null); openEdit(viewingPhoto); }}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="secondary" size="icon" className="absolute top-2 right-26 z-50 rounded-full opacity-80 hover:opacity-100 bg-red-500/50 hover:bg-red-500/70 text-white border-none" onClick={() => { setViewingPhoto(null); handleDelete(viewingPhoto.id); }}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                                <Image src={viewingPhoto.imageUrl} alt={viewingPhoto.caption || 'Photo'} width={1200} height={800} className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" unoptimized />

                                {(viewingPhoto.caption || viewingPhoto.tags) && (
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-b-lg text-left">
                                        {viewingPhoto.caption && <p className="text-white text-base sm:text-lg font-medium leading-relaxed">{viewingPhoto.caption}</p>}
                                        {viewingPhoto.tags && (
                                            <div className="flex gap-1.5 mt-1 flex-wrap">
                                                {viewingPhoto.tags.split(',').map(t => <span key={t.trim()} className="text-white/50 text-xs">#{t.trim()}</span>)}
                                            </div>
                                        )}
                                        <p className="text-white/60 text-xs mt-2">{new Date(viewingPhoto.createdAt).toLocaleDateString()} · {viewingPhoto.views || 0} views</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Photo</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Caption</label>
                            <Textarea value={editForm.caption} onChange={(e) => setEditForm(f => ({ ...f, caption: e.target.value }))} rows={3} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tags <span className="text-xs text-muted-foreground">(comma separated)</span></label>
                            <Input value={editForm.tags} onChange={(e) => setEditForm(f => ({ ...f, tags: e.target.value }))} placeholder="travel, food, daily" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Album</label>
                            <select
                                value={editForm.albumId}
                                onChange={(e) => setEditForm(f => ({ ...f, albumId: e.target.value }))}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="">No album</option>
                                {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveEdit}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Album Dialog */}
            <Dialog open={albumDialogOpen} onOpenChange={setAlbumDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingAlbum ? 'Edit Album' : 'New Album'}</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input value={albumForm.name} onChange={(e) => setAlbumForm(f => ({ ...f, name: e.target.value }))} placeholder="Album name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea value={albumForm.description} onChange={(e) => setAlbumForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAlbumDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveAlbum}>{editingAlbum ? 'Update' : 'Create'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Edit Dialog */}
            <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Bulk Edit ({selected.size} photos)</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Move to album</label>
                            <select
                                value={bulkEditData.albumId}
                                onChange={(e) => setBulkEditData(d => ({ ...d, albumId: e.target.value }))}
                                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="">Don&apos;t change</option>
                                {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Set tags <span className="text-xs text-muted-foreground">(overwrites existing)</span></label>
                            <Input value={bulkEditData.tags} onChange={(e) => setBulkEditData(d => ({ ...d, tags: e.target.value }))} placeholder="travel, food" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleBulkEdit} disabled={bulkLoading}>
                            {bulkLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Apply Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteId(null);
                    setDeleteType(null);
                }}
                onConfirm={confirmDelete}
                loading={bulkLoading}
                title={deleteType === 'ALBUM' ? "Delete Album" : "Delete Photo(s)"}
                description={
                    deleteType === 'ALBUM'
                        ? "Are you sure you want to delete this album? Photos will be unassigned but not deleted."
                        : deleteType === 'PHOTO'
                            ? "Are you sure you want to delete this photo? This action cannot be undone."
                            : `Are you sure you want to delete ${selected.size} photos? This action cannot be undone.`
                }
            />
        </>
    );
}
