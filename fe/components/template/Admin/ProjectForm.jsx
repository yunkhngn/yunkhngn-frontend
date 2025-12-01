import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { TagInput } from '@/components/ui/TagInput';
import TipTapEditor from '@/components/ui/TipTapEditor';
import { Loader2, Plus, X, Image as ImageIcon, Save, RotateCcw, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { UnsavedChangesModal } from '@/components/ui/UnsavedChangesModal';

export default function ProjectForm({ initialData, onSubmit, isEditing = false }) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        techStack: [],
        tags: [],
        repoLink: '',
        demoLink: '',
        cover: '',
        contentJSON: ''
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
                description: initialData.description || '',
                techStack: Array.isArray(initialData.techStack) ? initialData.techStack : [],
                tags: initialData.tags ? initialData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                repoLink: initialData.repoLink || '',
                demoLink: initialData.demoLink || '',
                cover: initialData.cover || '',
                contentJSON: initialData.contentJSON || ''
            });
        }
    }, [initialData]);

    const resetForm = () => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                slug: initialData.slug || '',
                description: initialData.description || '',
                techStack: Array.isArray(initialData.techStack) ? initialData.techStack : [],
                tags: initialData.tags ? initialData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                repoLink: initialData.repoLink || '',
                demoLink: initialData.demoLink || '',
                cover: initialData.cover || '',
                contentJSON: initialData.contentJSON || ''
            });
        } else {
            setFormData({
                title: '',
                slug: '',
                description: '',
                techStack: [],
                tags: [],
                repoLink: '',
                demoLink: '',
                cover: '',
                contentJSON: ''
            });
            setSlugManuallyEdited(false);
        }
        setIsDirty(false);
    };

    const generateSlug = (text) => {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
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

    const [generating, setGenerating] = useState(false);
    const [aiLanguage, setAiLanguage] = useState('vi');

    const handleGenerateAI = async () => {
        if (!formData.repoLink) return;

        setGenerating(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/project-info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    repoUrl: formData.repoLink,
                    language: aiLanguage
                })
            });

            if (!res.ok) throw new Error('Failed to generate project info');

            const data = await res.json();

            setFormData(prev => ({
                ...prev,
                title: data.title || prev.title,
                description: data.description || prev.description,
                contentJSON: data.content || prev.contentJSON,
                techStack: data.techStack || prev.techStack,
                tags: data.tags || prev.tags,
                demoLink: data.demoLink || prev.demoLink,
                slug: !slugManuallyEdited && data.title ? generateSlug(data.title) : prev.slug
            }));

            setIsDirty(true);
            toast.success('Project info generated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate project info');
        } finally {
            setGenerating(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const token = await user.getIdToken();

            // Get signature
            const sigRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery/signature?folder=blog-portfolio/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { signature, timestamp } = await sigRes.json();

            // Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', 'blog-portfolio/projects');

            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Upload failed');
            const uploadData = await uploadRes.json();

            setFormData(prev => ({
                ...prev,
                cover: uploadData.secure_url
            }));
            setIsDirty(true);
            toast.success('Cover image uploaded');

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
        if (!formData.title || !formData.description || !formData.slug) {
            toast.error('Title, Slug, and Description are required');
            return;
        }

        setSubmitting(true);
        setIsDirty(false); // Disable warning for submit
        try {
            const payload = {
                ...formData,
                techStack: JSON.stringify(formData.techStack),
                tags: formData.tags.join(', '),
            };
            await onSubmit(payload);
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
                    {isEditing ? 'Edit Project' : 'New Project'}
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
                            placeholder="Project Title"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Slug</label>
                        <Input
                            value={formData.slug}
                            onChange={handleSlugChange}
                            placeholder="project-slug"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                        value={formData.description}
                        onChange={(e) => {
                            setFormData({ ...formData, description: e.target.value });
                            setIsDirty(true);
                        }}
                        placeholder="Project Description"
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tech Stack</label>
                        <TagInput
                            value={formData.techStack}
                            onChange={(newTags) => {
                                setFormData({ ...formData, techStack: newTags });
                                setIsDirty(true);
                            }}
                            placeholder="React, Node.js..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tags</label>
                        <TagInput
                            value={formData.tags}
                            onChange={(newTags) => {
                                setFormData({ ...formData, tags: newTags });
                                setIsDirty(true);
                            }}
                            placeholder="Web, Mobile..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Repo Link</label>
                        <div className="flex gap-2">
                            <Input
                                value={formData.repoLink}
                                onChange={(e) => {
                                    setFormData({ ...formData, repoLink: e.target.value });
                                    setIsDirty(true);
                                }}
                                placeholder="https://github.com/..."
                            />
                            <select
                                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                                value={aiLanguage}
                                onChange={(e) => setAiLanguage(e.target.value)}
                                disabled={generating}
                            >
                                <option value="vi">VI</option>
                                <option value="en">EN</option>
                            </select>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon-lg"
                                onClick={handleGenerateAI}
                                disabled={generating || !formData.repoLink}
                                title="Generate with AI"
                            >
                                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Demo Link</label>
                        <Input
                            value={formData.demoLink}
                            onChange={(e) => {
                                setFormData({ ...formData, demoLink: e.target.value });
                                setIsDirty(true);
                            }}
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Cover Image</label>
                    <div
                        className="aspect-video relative rounded-lg overflow-hidden group border border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors max-w-md"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {formData.cover ? (
                            <>
                                <Image src={formData.cover} alt="Cover" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                                    Change Cover
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center text-muted-foreground">
                                {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <ImageIcon className="h-8 w-8 mb-2" />}
                                <span>Upload Cover Image</span>
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
                        onChange={(json) => {
                            setFormData({ ...formData, contentJSON: json });
                            setIsDirty(true);
                        }}
                        onImageUpload={handleEditorImageUpload}
                    />
                </div>

                <div className="pt-4 flex gap-2">
                    <Button className="w-full md:w-auto" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        {isEditing ? 'Update Project' : 'Create Project'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
