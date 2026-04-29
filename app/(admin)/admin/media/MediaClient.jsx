'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { UploadCloud, Trash2, Copy, ExternalLink, Loader2, Image as ImageIcon, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function MediaManager() {
    const [images, setImages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [nextCursor, setNextCursor] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { user } = useAuth();
    const fileInputRef = useRef(null);

    const fetchImages = useCallback(async (cursor = null) => {
        try {
            setLoading(true);
            const token = await user.getIdToken();
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/media`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { cursor }
            });

            if (cursor) {
                setImages(prev => [...prev, ...res.data.data.resources]);
            } else {
                setImages(res.data.data.resources);
            }
            setNextCursor(res.data.data.next_cursor);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch images');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchImages();
        }
    }, [user, fetchImages]);

    const handleLoadMore = () => {
        if (nextCursor) {
            fetchImages(nextCursor);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Get signature
            const token = await user.getIdToken();
            const signRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/media/signature`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { signature, timestamp, cloudName, apiKey } = signRes.data.data;

            // 2. Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', 'blog-portfolio');

            const uploadRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                formData
            );

            toast.success('Image uploaded successfully');

            // Refresh list (insert at top)
            setImages(prev => [uploadRes.data, ...prev]);
        } catch (error) {
            console.error(error);
            if (error.response?.data?.error?.message) {
                toast.error(`Upload failed: ${error.response.data.error.message}`);
            } else {
                toast.error('Failed to upload image');
            }
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = (publicId) => {
        setDeleteId(publicId);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const token = await user.getIdToken();
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/media`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { publicId: deleteId }
            });
            setImages(images.filter(img => img.public_id !== deleteId));
            toast.success('Image deleted');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete image');
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        }
    };

    const handleCopyUrl = (url) => {
        navigator.clipboard.writeText(url);
        toast.success('URL copied to clipboard');
    };

    const filteredImages = images.filter(img =>
        img.public_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
                    <p className="text-muted-foreground mt-1">Manage your uploaded images and assets.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                        Upload Image
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleUpload}
                    />
                </div>
            </div>

            <div className="mb-6 flex items-center justify-between gap-4">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search images by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredImages.map((img) => (
                    <div key={img.public_id} className="group relative aspect-square bg-muted rounded-lg overflow-hidden border">
                        <Image
                            src={img.secure_url}
                            alt={img.public_id}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                            className="object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                            <div className="flex gap-2">
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-8 w-8"
                                    onClick={() => handleCopyUrl(img.secure_url)}
                                    title="Copy URL"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-8 w-8"
                                    onClick={() => window.open(img.secure_url, '_blank')}
                                    title="View Full"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="destructive"
                                    className="h-8 w-8"
                                    onClick={() => handleDelete(img.public_id)}
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <span className="text-xs text-white bg-black/50 px-2 py-1 rounded truncate max-w-full">
                                {img.public_id.split('/').pop()}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Skeleton Loading State */}
                {loading && Array.from({ length: 5 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="aspect-square bg-muted animate-pulse rounded-lg" />
                ))}
            </div>

            {!loading && filteredImages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground col-span-full">
                    <ImageIcon className="h-16 w-16 mb-4 opacity-20" />
                    <p>{searchQuery ? 'No images match your search.' : 'No images found.'}</p>
                </div>
            )}

            {nextCursor && (
                <div className="mt-8 flex justify-center">
                    <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Load More
                    </Button>
                </div>
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Image"
                description="Are you sure you want to delete this image? This action cannot be undone."
            />
        </>
    );
}
