import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea'; // Not strictly needed if no description, but maybe for SEO? Schema doesn't have description.
import { TagInput } from '@/components/ui/TagInput';
import TipTapEditor from '@/components/ui/TipTapEditor';
import { Loader2, Plus, X, Image as ImageIcon, Save, RotateCcw, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { UnsavedChangesModal } from '@/components/ui/UnsavedChangesModal';

export default function BlogForm({ initialData, onSubmit, isEditing = false }) {
    const router = useRouter();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        thumbnail: '',
        tags: '',
        contentJSON: '',
        status: 'DRAFT'
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const fileInputRef = useRef(null);

    const { showModal, setShowModal, confirmNavigation } = useUnsavedChanges(isDirty);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                slug: initialData.slug || '',
                thumbnail: initialData.thumbnail || '',
                tags: initialData.tags || '',
                contentJSON: initialData.content || initialData.contentJSON || '',
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
                tags: initialData.tags || '',
                contentJSON: initialData.content || initialData.contentJSON || '',
                status: initialData.status || 'DRAFT'
            });
        } else {
            setFormData({
                title: '',
                slug: '',
                thumbnail: '',
                tags: '',
                contentJSON: '',
                status: 'DRAFT'
            });
            setSlugManuallyEdited(false);
        }
        setIsDirty(false);
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
        setIsDirty(true);
    };

    const handleSlugChange = (e) => {
        setFormData(prev => ({ ...prev, slug: e.target.value }));
        setSlugManuallyEdited(true);
        setIsDirty(true);
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
            setIsDirty(true);
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

    const handleSubmit = async (statusOverride) => {
        if (!formData.title || !formData.slug) {
            toast.error('Title and Slug are required');
            return;
        }

        setSubmitting(true);
        setIsDirty(false); // Disable warning for submit
        try {
            const payload = {
                ...(initialData || {}),
                ...formData,
                content: formData.contentJSON,
                tags: formData.tags,
                status: statusOverride || formData.status || 'DRAFT'
            };
            await onSubmit(payload);
            if (statusOverride) {
                setFormData(prev => ({ ...prev, status: statusOverride }));
            }
        } catch (error) {
            console.error(error);
            setIsDirty(true); // Re-enable if failed
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <UnsavedChangesModal
                open={showModal}
                onOpenChange={setShowModal}
                onConfirm={confirmNavigation}
            />
            <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-2 border-b">
                <h2 className="text-xl font-bold">
                    {isEditing ? 'Edit Blog' : 'New Blog'}
                </h2>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                    <RotateCcw className="h-4 w-4 mr-2" /> Reset
                </Button>
            </div>

            <div className="pb-32">
                {/* Banner Thumbnail */}
                <div className="w-full h-64 md:h-96 relative bg-muted group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {formData.thumbnail ? (
                        <>
                            <Image src={formData.thumbnail} alt="Thumbnail" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                                <ImageIcon className="mr-2 h-6 w-6" /> Change Cover Image
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 gap-2 hover:bg-muted/50 transition-colors">
                            <ImageIcon className="h-12 w-12" />
                            <span className="text-lg font-medium">Add Cover Image</span>
                        </div>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleUpload}
                    />
                    {uploading && (
                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    )}
                </div>

                <div className="max-w-5xl mx-auto px-4 py-12">
                    {/* Header Section */}
                    <div className="text-center mb-12 space-y-6">
                        {/* Date Placeholder */}
                        <div className="text-sm text-muted-foreground uppercase tracking-widest">
                            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>

                        {/* Title Input */}
                        <div className="relative group">
                            <Textarea
                                value={formData.title}
                                onChange={handleTitleChange}
                                placeholder="Blog Title"
                                className="text-4xl md:text-6xl font-bold text-center font-serif border-none focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/30 resize-none overflow-hidden min-h-[1.5em] leading-tight p-0 shadow-none"
                                style={{ fontFamily: 'var(--font-playfair), serif' }}
                                rows={1}
                                onInput={(e) => {
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                            />
                        </div>

                        {/* Slug & Tags */}
                        <div className="max-w-xl mx-auto space-y-4">
                            <div className="flex items-center justify-center gap-2">
                                <Input
                                    value={formData.slug}
                                    onChange={handleSlugChange}
                                    placeholder="url-slug"
                                    className="text-center text-sm text-muted-foreground border-transparent hover:border-border focus:border-border bg-transparent h-8 w-full max-w-[300px]"
                                />
                            </div>

                            <div className="flex justify-center">
                                <Input
                                    value={formData.tags}
                                    onChange={(e) => {
                                        setFormData({ ...formData, tags: e.target.value });
                                        setIsDirty(true);
                                    }}
                                    placeholder="Tags (comma separated)"
                                    className="text-center border-transparent hover:border-border focus:border-border bg-transparent max-w-[400px]"
                                />
                            </div>
                        </div>

                        {/* Author */}
                        <div className="flex items-center justify-center gap-4 pt-4">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                                <Image src={user?.photoURL || "https://github.com/yunkhngn.png"} alt="Author" fill className="object-cover" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-sm">{user?.displayName || "Khoa Nguyễn"}</div>
                                <div className="text-xs text-muted-foreground">Author & Developer</div>
                            </div>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="max-w-none">
                        <TipTapEditor
                            key={initialData ? initialData.id : 'new'}
                            content={formData.contentJSON}
                            onChange={(json) => {
                                setFormData({ ...formData, contentJSON: json });
                                setIsDirty(true);
                            }}
                            onImageUpload={handleEditorImageUpload}
                        />
                    </div>
                </div>
            </div>

            {/* Fixed Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 z-50">
                <div className="container mx-auto flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    {!isEditing ? (
                        <Button onClick={() => handleSubmit('DRAFT')} disabled={submitting}>
                            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Draft
                        </Button>
                    ) : (
                        <>
                            {formData.status === 'DRAFT' ? (
                                <>
                                    <Button onClick={() => handleSubmit('PUBLISHED')} disabled={submitting}>
                                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                        Publish
                                    </Button>
                                    <Button variant="outline" onClick={() => handleSubmit('DRAFT')} disabled={submitting}>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Draft
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button onClick={() => handleSubmit()} disabled={submitting}>
                                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Update Blog
                                    </Button>
                                    <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleSubmit('DRAFT')} disabled={submitting}>
                                        Unpublish
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
