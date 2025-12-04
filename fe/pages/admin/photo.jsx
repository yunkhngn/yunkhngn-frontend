import AdminLayout from "@/components/template/Admin/Layout";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Loader2, Upload, Trash2, Pencil, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import Image from 'next/image';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';

export default function PhotoManager() {
    const { user } = useAuth();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Bulk Upload State
    const [stagedPhotos, setStagedPhotos] = useState([]); // Array<{ id: string, file: File, preview: string, caption: string }>
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

    const [viewingPhoto, setViewingPhoto] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // Drag state
    const [isDragging, setIsDragging] = useState(false);

    // Edit state
    const [editingPhoto, setEditingPhoto] = useState(null);
    const [editCaption, setEditCaption] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // Delete state
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fileInputRef = useRef(null);

    const fetchPhotos = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery`);
            if (!res.ok) throw new Error('Failed to fetch photos');
            const data = await res.json();
            setPhotos(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    // Reset to page 1 when photos change
    useEffect(() => setCurrentPage(1), [photos]);

    // Calculate pagination
    const indexOfLastPhoto = currentPage * itemsPerPage;
    const indexOfFirstPhoto = indexOfLastPhoto - itemsPerPage;
    const currentPhotos = photos.slice(indexOfFirstPhoto, indexOfLastPhoto);
    const totalPages = Math.ceil(photos.length / itemsPerPage);

    const processFiles = (files) => {
        if (!files || files.length === 0) return;

        const newStaged = Array.from(files)
            .filter(file => file.type.startsWith('image/'))
            .map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                file,
                preview: URL.createObjectURL(file),
                caption: ''
            }));

        setStagedPhotos(prev => [...prev, ...newStaged]);
    };

    const handleFileSelect = (e) => {
        processFiles(e.target.files);
        e.target.value = '';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        processFiles(e.dataTransfer.files);
    };

    const removeStagedPhoto = (id) => {
        setStagedPhotos(prev => prev.filter(p => p.id !== id));
    };

    const updateStagedCaption = (id, caption) => {
        setStagedPhotos(prev => prev.map(p => p.id === id ? { ...p, caption } : p));
    };

    const clearStagedPhotos = () => {
        stagedPhotos.forEach(p => URL.revokeObjectURL(p.preview));
        setStagedPhotos([]);
        setUploadProgress({ current: 0, total: 0 });
    };

    const handleBulkUpload = async () => {
        if (stagedPhotos.length === 0) return;
        setUploading(true);
        setUploadProgress({ current: 0, total: stagedPhotos.length });

        try {
            const token = await user.getIdToken();
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

            for (let i = 0; i < stagedPhotos.length; i++) {
                const photo = stagedPhotos[i];

                try {
                    // 1. Get signature
                    const sigRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery/signature`, {
                        headers: { Authorization: `Bearer ${token} ` }
                    });
                    if (!sigRes.ok) throw new Error('Failed to get signature');
                    const { signature, timestamp } = await sigRes.json();

                    // 2. Upload to Cloudinary
                    const formData = new FormData();
                    formData.append('file', photo.file);
                    formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
                    formData.append('timestamp', timestamp);
                    formData.append('signature', signature);
                    formData.append('folder', 'blog-portfolio/gallery');

                    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                        method: 'POST',
                        body: formData
                    });

                    if (!uploadRes.ok) throw new Error('Upload failed');
                    const uploadData = await uploadRes.json();

                    // 3. Save to Backend
                    const saveRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            imageUrl: uploadData.secure_url,
                            caption: photo.caption
                        })
                    });

                    if (!saveRes.ok) throw new Error('Failed to save photo');

                    setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));

                } catch (err) {
                    console.error(`Failed to upload photo ${i + 1}`, err);
                    toast.error(`Failed to upload photo ${i + 1}`);
                }
            }

            toast.success('Upload completed');
            clearStagedPhotos();
            fetchPhotos();
            setCurrentPage(1);

        } catch (error) {
            console.error(error);
            toast.error('Bulk upload failed');
        } finally {
            setUploading(false);
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery/${deleteId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete');
            fetchPhotos();
            toast.success('Photo deleted');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete photo');
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        }
    };

    const openEdit = (photo) => {
        setEditingPhoto(photo);
        setEditCaption(photo.caption || '');
        setEditDialogOpen(true);
    };

    const handleUpdateCaption = async () => {
        if (!editingPhoto) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery/${editingPhoto.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ caption: editCaption })
            });

            if (!res.ok) throw new Error('Failed to update caption');

            setEditDialogOpen(false);
            fetchPhotos();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update caption');
        }
    };

    return (
        <AdminLayout title="Photo Gallery">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Photo Gallery</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Upload (4/12) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 sticky top-4">
                            <h2 className="text-lg font-semibold mb-4">Upload Photos</h2>

                            {/* Drag & Drop Area */}
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
                                    <span className="text-xs opacity-70">(Multiple files supported)</span>
                                </span>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileSelect}
                                />
                            </div>

                            {/* Staging Area */}
                            {stagedPhotos.length > 0 && (
                                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium">Selected ({stagedPhotos.length})</h3>
                                        <Button variant="ghost" size="sm" onClick={clearStagedPhotos} disabled={uploading}>
                                            Clear All
                                        </Button>
                                    </div>

                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                        {stagedPhotos.map((photo, index) => (
                                            <div key={photo.id} className="flex gap-3 items-start bg-muted/30 p-2 rounded-lg border">
                                                <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                                    <Image src={photo.preview} alt="Preview" fill className="object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Textarea
                                                        placeholder="Caption..."
                                                        value={photo.caption}
                                                        onChange={(e) => updateStagedCaption(photo.id, e.target.value)}
                                                        rows={2}
                                                        className="text-xs min-h-[60px] resize-none"
                                                    />
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                    onClick={() => removeStagedPhoto(photo.id)}
                                                    disabled={uploading}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    <Button className="w-full" onClick={handleBulkUpload} disabled={uploading}>
                                        {uploading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Uploading {uploadProgress.current}/{uploadProgress.total}
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload All
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Gallery (8/12) */}
                    <div className="lg:col-span-8">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {currentPhotos.map((photo) => (
                                <div
                                    key={photo.id}
                                    className="aspect-square relative rounded-xl overflow-hidden cursor-pointer group bg-muted"
                                    onClick={() => setViewingPhoto(photo)}
                                >
                                    <Image
                                        src={photo.imageUrl}
                                        alt={photo.caption || 'Photo'}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {photos.length > 0 && (
                            <div className="flex justify-center items-center gap-4 mt-8">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {loading && <div className="text-center py-12 text-muted-foreground">Loading moments...</div>}
                        {!loading && photos.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">No moments yet.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Photo Modal */}
            <Dialog open={!!viewingPhoto} onOpenChange={(open) => !open && setViewingPhoto(null)}>
                <DialogContent showCloseButton={false} className="max-w-4xl p-0 overflow-hidden border-none bg-transparent shadow-none sm:bg-transparent">
                    {viewingPhoto && (
                        <div className="relative flex flex-col items-center justify-center min-h-[50vh] max-h-[90vh] pointer-events-none">
                            {/* Wrapper to constrain caption to image width */}
                            <div className="relative max-w-full max-h-[80vh] pointer-events-auto">
                                {/* Close button */}
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute top-2 right-2 z-50 rounded-full opacity-80 hover:opacity-100 bg-black/50 hover:bg-black/70 text-white border-none"
                                    onClick={() => setViewingPhoto(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>

                                {/* Edit button */}
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute top-2 right-14 z-50 rounded-full opacity-80 hover:opacity-100 bg-black/50 hover:bg-black/70 text-white border-none"
                                    onClick={() => { setViewingPhoto(null); openEdit(viewingPhoto); }}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>

                                {/* Delete button */}
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute top-2 right-26 z-50 rounded-full opacity-80 hover:opacity-100 bg-red-500/50 hover:bg-red-500/70 text-white border-none"
                                    onClick={() => { setViewingPhoto(null); handleDelete(viewingPhoto.id); }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                                <Image
                                    src={viewingPhoto.imageUrl}
                                    alt={viewingPhoto.caption || 'Photo'}
                                    width={1200}
                                    height={800}
                                    className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                                    unoptimized
                                />

                                {/* Caption Overlay for Modal */}
                                {viewingPhoto.caption && (
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-b-lg text-left">
                                        <p className="text-white text-base sm:text-lg font-medium leading-relaxed">{viewingPhoto.caption}</p>
                                        <p className="text-white/60 text-xs mt-2">{new Date(viewingPhoto.createdAt).toLocaleDateString()}</p>
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
                    <DialogHeader>
                        <DialogTitle>Edit Caption</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Caption</label>
                            <Textarea
                                value={editCaption}
                                onChange={(e) => setEditCaption(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateCaption}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Photo"
                description="Are you sure you want to delete this photo? This action cannot be undone."
            />
        </AdminLayout>
    );
}
