import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea'; // Not strictly needed if no description, but maybe for SEO? Schema doesn't have description.
import { TagInput } from '@/components/ui/TagInput';
import TipTapEditor from '@/components/ui/TipTapEditor';
import { Loader2, Plus, X, Image as ImageIcon, Save, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

export default function BlogForm({ initialData, onSubmit, isEditing = false }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        thumbnail: '',
        tags: [],
        contentJSON: '',
        status: 'DRAFT'
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                slug: initialData.slug || '',
                thumbnail: initialData.thumbnail || '',
                tags: initialData.tags ? (typeof initialData.tags === 'string' ? initialData.tags.split(',').map(t => t.trim()).filter(Boolean) : initialData.tags) : [],
                contentJSON: initialData.contentJSON || '',
                status: initialData.status || 'DRAFT'
            });
        }
    }, [initialData]);

    const resetForm = () => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                slug: initialData.slug || '',
                thumbnail: initialData.thumbnail || '',
                tags: initialData.tags ? (typeof initialData.tags === 'string' ? initialData.tags.split(',').map(t => t.trim()).filter(Boolean) : initialData.tags) : [],
                contentJSON: initialData.contentJSON || '',
                status: initialData.status || 'DRAFT'
            });
        } else {
            setFormData({
                title: '',
                slug: '',
                thumbnail: '',
                tags: [],
                contentJSON: '',
                status: 'DRAFT'
            });
            setSlugManuallyEdited(false);
        }
    };

    const generateSlug = (text) => {
        return text
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: !slugManuallyEdited ? generateSlug(title) : prev.slug
        }));
    };

    const handleSlugChange = (e) => {
        setFormData(prev => ({ ...prev, slug: e.target.value }));
        setSlugManuallyEdited(true);
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const token = await user.getIdToken();

            // Get signature
            const sigRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery/signature?folder=blog-portfolio/blogs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { signature, timestamp } = await sigRes.json();

            // Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', 'blog-portfolio/blogs');

            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const uploadData = await uploadRes.json();

            setFormData(prev => ({
                ...prev,
                thumbnail: uploadData.secure_url
            }));
            toast.success('Thumbnail uploaded');

        } catch (error) {
            console.error(error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleEditorImageUpload = async (file) => {
        try {
            const token = await user.getIdToken();
            const sigRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery/signature?folder=blog-portfolio/content`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { signature, timestamp } = await sigRes.json();

            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', 'blog-portfolio/content');

            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const uploadData = await uploadRes.json();
            return uploadData.secure_url;
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload image');
            return null;
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.slug) {
            toast.error('Title and Slug are required');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                ...(initialData || {}),
                ...formData,
                tags: Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags,
            };
            await onSubmit(payload);
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-2 border-b">
                <h2 className="text-xl font-bold">
                    {isEditing ? 'Edit Blog' : 'New Blog'}
                </h2>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                    <RotateCcw className="h-4 w-4 mr-2" /> Reset
                </Button>
            </div>

            <div className="space-y-4 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                            value={formData.title}
                            onChange={handleTitleChange}
                            placeholder="Blog Title"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Slug</label>
                        <Input
                            value={formData.slug}
                            onChange={handleSlugChange}
                            placeholder="blog-slug"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="PUBLISHED">Published</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tags</label>
                        <TagInput
                            value={formData.tags}
                            onChange={(newTags) => setFormData({ ...formData, tags: newTags })}
                            placeholder="Tech, Life..."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Thumbnail</label>
                    <div
                        className="aspect-video relative rounded-lg overflow-hidden group border border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors max-w-md"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {formData.thumbnail ? (
                            <>
                                <Image src={formData.thumbnail} alt="Thumbnail" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                                    Change Thumbnail
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center text-muted-foreground">
                                {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <ImageIcon className="h-8 w-8 mb-2" />}
                                <span>Upload Thumbnail</span>
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleUpload}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <TipTapEditor
                        key={initialData ? initialData.id : 'new'}
                        content={formData.contentJSON}
                        onChange={(json) => setFormData({ ...formData, contentJSON: json })}
                        onImageUpload={handleEditorImageUpload}
                    />
                </div>

                <div className="pt-4 flex gap-2">
                    <Button className="w-full md:w-auto" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isEditing ? 'Update Blog' : 'Create Blog'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
