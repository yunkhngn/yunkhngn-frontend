import AdminLayout from "@/components/template/Admin/Layout";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Loader2, Upload, Trash2, Pencil, X, Save, Image as ImageIcon, Crop as CropIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import Image from 'next/image';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';

export default function PhotoManager() {
    const { user } = useAuth();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [caption, setCaption] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [viewingPhoto, setViewingPhoto] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    // Crop state
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropOpen, setIsCropOpen] = useState(false);
    const [tempImgUrl, setTempImgUrl] = useState('');

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

    // Reset to page 1 when photos change (optional, but good practice if filtering)
    useEffect(() => setCurrentPage(1), [photos]);

    // Calculate pagination
    const indexOfLastPhoto = currentPage * itemsPerPage;
    const indexOfFirstPhoto = indexOfLastPhoto - itemsPerPage;
    const currentPhotos = photos.slice(indexOfFirstPhoto, indexOfLastPhoto);
    const totalPages = Math.ceil(photos.length / itemsPerPage);

    const processFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setTempImgUrl(url);
            setSelectedFile(file);
            setPreviewUrl(url);
            setCrop({ x: 0, y: 0 });
            setZoom(1);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        processFile(file);
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
        const file = e.dataTransfer.files[0];
        processFile(file);
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const performCrop = async () => {
        try {
            const croppedImageBlob = await getCroppedImg(tempImgUrl, croppedAreaPixels);
            const croppedImageUrl = URL.createObjectURL(croppedImageBlob);

            setPreviewUrl(croppedImageUrl);
            setSelectedFile(croppedImageBlob); // Upload the cropped blob
            setIsCropOpen(false);
        } catch (e) {
            console.error(e);
            alert('Failed to crop image');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);

        try {
            const token = await user.getIdToken();

            // 1. Get signature
            const sigRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery/signature`, {
                headers: { Authorization: `Bearer ${token} ` }
            });
            if (!sigRes.ok) throw new Error('Failed to get signature');
            const { signature, timestamp } = await sigRes.json();

            // 2. Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', 'blog-portfolio/gallery');

            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
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
                    caption: caption
                })
            });

            if (!saveRes.ok) throw new Error('Failed to save photo');

            // Reset form
            setSelectedFile(null);
            setPreviewUrl('');
            setCaption('');
            fetchPhotos();
            // Optional: Go to page 1 after upload
            setCurrentPage(1);

        } catch (error) {
            console.error(error);
            alert('Failed to upload photo');
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
            alert('Failed to update caption');
        }
    };

    const clearPreview = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const openCropForCurrent = () => {
        if (previewUrl) {
            setIsCropOpen(true);
        }
    };

    return (
        <AdminLayout title="Photo Gallery">
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Photo Gallery</h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Upload (30% approx - 4/12) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-card text-card-foreground rounded-xl border shadow-sm p-6 sticky top-4">
                            <h2 className="text-lg font-semibold mb-4">Locket</h2>
                            <div className="space-y-4">
                                <div
                                    className={`w-full aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden group bg-muted/20 ${isDragging ? 'border-primary bg-primary/10' : 'border-border'}`}
                                    onClick={() => !previewUrl && fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    {previewUrl ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={previewUrl}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-3 z-10">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={(e) => { e.stopPropagation(); openCropForCurrent(); }}
                                                >
                                                    <CropIcon className="h-4 w-4 mr-2" /> Crop
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={(e) => { e.stopPropagation(); clearPreview(); }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                                            <span className="text-sm text-muted-foreground text-center px-4">Tap to upload or drag and drop</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Textarea
                                        placeholder="Write a caption..."
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        rows={3}
                                        maxLength={150}
                                        className="resize-none bg-muted/30"
                                    />
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">{caption.length}/150</span>
                                        <Button onClick={handleUpload} disabled={!selectedFile || uploading} size="sm">
                                            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {!uploading && <Upload className="mr-2 h-4 w-4" />}
                                            Post
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Gallery (70% approx - 8/12) */}
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

                                <img
                                    src={viewingPhoto.imageUrl}
                                    alt={viewingPhoto.caption}
                                    className="w-auto h-auto max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
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

            {/* Crop Dialog */}
            <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Crop Image</DialogTitle>
                    </DialogHeader>
                    <div className="relative w-full h-96 bg-black rounded-md overflow-hidden">
                        <Cropper
                            image={tempImgUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>
                    <div className="py-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Zoom</span>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCropOpen(false)}>Cancel</Button>
                        <Button onClick={performCrop}>Apply Crop</Button>
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
