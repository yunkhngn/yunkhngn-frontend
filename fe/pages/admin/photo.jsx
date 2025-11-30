import AdminLayout from "@/components/template/Admin/Layout";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Loader2, Upload, Trash2, Pencil, X, Save, Image as ImageIcon, Crop as CropIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';

export default function PhotoManager() {
    const { user } = useAuth();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [caption, setCaption] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [viewingPhoto, setViewingPhoto] = useState(null);

    // Crop state
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isCropOpen, setIsCropOpen] = useState(false);
    const [tempImgUrl, setTempImgUrl] = useState('');

    // Edit state
    const [editingPhoto, setEditingPhoto] = useState(null);
    const [editCaption, setEditCaption] = useState('');
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const fileInputRef = useRef(null);

    const fetchPhotos = async () => {
        try {
            const res = await fetch('http://localhost:3001/gallery');
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

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setTempImgUrl(url);
            setIsCropOpen(true);
            // Reset file input so same file can be selected again if needed
            e.target.value = '';
        }
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
            const sigRes = await fetch('http://localhost:3001/gallery/signature', {
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
            const saveRes = await fetch('http://localhost:3001/gallery', {
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

        } catch (error) {
            console.error(error);
            alert('Failed to upload photo');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this photo?')) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`http://localhost:3001/gallery/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete');
            fetchPhotos();
        } catch (error) {
            console.error(error);
            alert('Failed to delete photo');
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
            const res = await fetch(`http://localhost:3001/gallery/${editingPhoto.id}`, {
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
            setTempImgUrl(previewUrl);
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
                                    className="w-full aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden group bg-muted/20"
                                    onClick={() => !previewUrl && fileInputRef.current?.click()}
                                >
                                    {previewUrl ? (
                                        <div className="relative w-full h-full">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-3">
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
                                            <span className="text-sm text-muted-foreground">Tap to upload</span>
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
                            {photos.map((photo) => (
                                <div
                                    key={photo.id}
                                    className="aspect-square relative rounded-xl overflow-hidden cursor-pointer group bg-muted"
                                    onClick={() => setViewingPhoto(photo)}
                                >
                                    <img
                                        src={photo.imageUrl}
                                        alt={photo.caption}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>

                        {loading && <div className="text-center py-12 text-muted-foreground">Loading moments...</div>}
                        {!loading && photos.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">No moments yet.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Photo Modal */}
            <Dialog open={!!viewingPhoto} onOpenChange={(open) => !open && setViewingPhoto(null)}>
                <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none sm:bg-background sm:shadow-lg sm:border">
                    {viewingPhoto && (
                        <div className="flex flex-col bg-card rounded-lg overflow-hidden">
                            <div className="relative aspect-square w-full bg-black">
                                <img
                                    src={viewingPhoto.imageUrl}
                                    alt="Detail"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <div className="p-4 space-y-4">
                                <p className="text-sm leading-relaxed">
                                    {viewingPhoto.caption || <span className="italic text-muted-foreground">No caption</span>}
                                </p>
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(viewingPhoto.createdAt).toLocaleDateString()}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button size="icon-sm" variant="ghost" onClick={() => { setViewingPhoto(null); openEdit(viewingPhoto); }}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => { setViewingPhoto(null); handleDelete(viewingPhoto.id); }}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
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
        </AdminLayout>
    );
}
