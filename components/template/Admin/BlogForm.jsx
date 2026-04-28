import { useState, useRef, useEffect, useCallback } from 'react';
import { readNestJson } from '@/lib/api/readJson';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea'; // Not strictly needed if no description, but maybe for SEO? Schema doesn't have description.
import { TagInput } from '@/components/ui/TagInput';
import dynamic from 'next/dynamic';
const TipTapEditor = dynamic(() => import('@/components/ui/TipTapEditor'), { ssr: false });
import { Loader2, Plus, X, Image as ImageIcon, Save, RotateCcw, UploadCloud, Maximize } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { UnsavedChangesModal } from '@/components/ui/UnsavedChangesModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Sparkles, Crop as CropIcon, Move } from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg, { getPaddedImg } from '@/lib/cropImage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import SEOEditor from "@/components/admin/SEOEditor";
import ImageAlignmentModal from '@/components/admin/ImageAlignmentModal';

export default function BlogForm({ initialData, onSubmit, isEditing = false }) {
    const router = useRouter();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        thumbnail: '',
        tags: '',
        contentJSON: '',
        status: 'DRAFT',
        seoTitle: '',
        seoDescription: '',
        seoImage: '',
        imageSettings: null
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiLanguage, setAiLanguage] = useState('vi');
    const [generatingAi, setGeneratingAi] = useState(false);
    const [editorKey, setEditorKey] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isCropOpen, setIsCropOpen] = useState(false);
    const [isAlignmentOpen, setIsAlignmentOpen] = useState(false);
    const [tempImgUrl, setTempImgUrl] = useState('');
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [lastSaved, setLastSaved] = useState(null);
    const fileInputRef = useRef(null);
    const autoSaveTimerRef = useRef(null);

    const { showModal, setShowModal, confirmNavigation } = useUnsavedChanges(isDirty);

    // Helper to get draft key
    const getDraftKey = useCallback(() => {
        if (isEditing && initialData?.id) {
            return `blog_draft_${initialData.id}`;
        }
        return 'blog_draft_new';
    }, [isEditing, initialData]);

    // Restore draft on mount
    useEffect(() => {
        const key = getDraftKey();
        const savedDraft = localStorage.getItem(key);

        if (savedDraft) {
            try {
                const parsedDraft = JSON.parse(savedDraft);
                if (isEditing && initialData) {
                    // Only restore if draft is different/newer? 
                }

                setFormData(prev => ({
                    ...prev,
                    ...parsedDraft,
                }));
                setSlugManuallyEdited(true); // Assume manual edit if restored
                setIsDirty(true);
                setLastSaved(new Date(parsedDraft._savedAt));
                toast.info('Restored unsaved draft');
            } catch (e) {
                console.error('Failed to parse draft', e);
            }
        } else if (initialData) {
            let parsedSettings = null;
            if (initialData.imageSettings) {
                try {
                    parsedSettings = typeof initialData.imageSettings === 'string'
                        ? JSON.parse(initialData.imageSettings)
                        : initialData.imageSettings;
                } catch (e) {
                    console.error("Failed to parse imageSettings", e);
                }
            }

            setFormData({
                title: initialData.title || '',
                slug: initialData.slug || '',
                thumbnail: initialData.thumbnail || '',
                tags: initialData.tags || '',
                contentJSON: initialData.content || initialData.contentJSON || '',
                status: initialData.status || 'DRAFT',
                seoTitle: initialData.seoTitle || '',
                seoDescription: initialData.seoDescription || '',
                seoImage: initialData.seoImage || '',
                imageSettings: parsedSettings
            });
        }
    }, [initialData, isEditing, getDraftKey]);

    // Auto-save effect
    useEffect(() => {
        if (!isDirty) return;

        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
            const key = getDraftKey();
            const draftData = {
                ...formData,
                _savedAt: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(draftData));
            setLastSaved(new Date());
        }, 1000); // Debounce 1s

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [formData, isDirty, isEditing, initialData, getDraftKey]);

    const resetForm = () => {
        const key = getDraftKey();
        localStorage.removeItem(key);
        setLastSaved(null);

        if (initialData) {
            let parsedSettings = null;
            try {
                parsedSettings = initialData.imageSettings ? JSON.parse(initialData.imageSettings) : null;
            } catch (e) { }

            setFormData({
                title: initialData.title || '',
                slug: initialData.slug || '',
                thumbnail: initialData.thumbnail || '',
                tags: initialData.tags || '',
                contentJSON: initialData.content || initialData.contentJSON || '',
                status: initialData.status || 'DRAFT',
                seoTitle: initialData.seoTitle || '',
                seoDescription: initialData.seoDescription || '',
                seoImage: initialData.seoImage || '',
                imageSettings: parsedSettings
            });
        } else {
            setFormData({
                title: '',
                slug: '',
                thumbnail: '',
                tags: '',
                contentJSON: '',
                status: 'DRAFT',
                seoTitle: '',
                seoDescription: '',
                seoImage: '',
                imageSettings: null
            });
            setSlugManuallyEdited(false);
        }
        setIsDirty(false);
        toast.success('Form reset and draft cleared');
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

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropDone = async () => {
        try {
            const croppedImageBlob = await getCroppedImg(tempImgUrl, croppedAreaPixels);
            setIsCropOpen(false);
            await uploadCroppedImage(croppedImageBlob);
        } catch (e) {
            console.error(e);
            toast.error('Failed to crop image');
        }
    };

    const uploadCroppedImage = async (blob) => {
        setUploading(true);
        try {
            const token = await user.getIdToken();

            // Get signature
            const sigRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery/signature?folder=blog-portfolio/blogs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { signature, timestamp, cloudName, apiKey } = await readNestJson(sigRes);

            // Upload to Cloudinary
            const formData = new FormData();
            formData.append('file', blob);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', 'blog-portfolio/blogs');

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

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Open crop dialog instead of uploading directly
        const reader = new FileReader();
        reader.onload = () => {
            setTempImgUrl(reader.result);
            setIsCropOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                // Simulate file input change
                const fakeEvent = { target: { files: [file] } };
                await handleUpload(fakeEvent);
            } else {
                toast.error('Please drop an image file');
            }
        }
    };

    const handleEditorImageUpload = async (file) => {
        try {
            const token = await user.getIdToken();
            const sigRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery/signature?folder=blog-portfolio/content`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { signature, timestamp, cloudName, apiKey } = await readNestJson(sigRes);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', 'blog-portfolio/content');

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
            // Only send fields allowed by UpdateBlogDto
            const payload = {
                title: formData.title,
                slug: formData.slug,
                thumbnail: formData.thumbnail,
                tags: formData.tags,
                contentJSON: formData.contentJSON,
                status: statusOverride || formData.status || 'DRAFT',
                seoTitle: formData.seoTitle,
                seoDescription: formData.seoDescription,
                seoImage: formData.seoImage,
                imageSettings: formData.imageSettings ? JSON.stringify(formData.imageSettings) : null
            };
            await onSubmit(payload);

            // Clear draft on success
            const key = getDraftKey();
            localStorage.removeItem(key);
            setLastSaved(null);

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

    const handleAiGenerate = async () => {
        if (!aiPrompt) return;
        setGeneratingAi(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/blog-content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    prompt: aiPrompt,
                    currentContent: formData.contentJSON, // Send current content for context/editing
                    language: aiLanguage
                })
            });

            if (!res.ok) throw new Error('Failed to generate content');

            const data = await readNestJson(res);

            // Extract content - ensure it's always a string (HTML)
            let newContent = '';
            if (typeof data === 'string') {
                newContent = data;
            } else if (typeof data.content === 'string') {
                newContent = data.content;
            } else if (typeof data.content === 'object' && data.content !== null) {
                newContent = data.content.content || JSON.stringify(data.content);
            } else {
                newContent = '';
            }

            const newTitle = data.title || formData.title;
            const newTags = data.tags ? (Array.isArray(data.tags) ? data.tags.join(', ') : data.tags) : formData.tags;

            if (!newContent) {
                toast.error('AI returned empty content');
                return;
            }

            setFormData(prev => {
                const updated = {
                    ...prev,
                    contentJSON: newContent, // This is now guaranteed to be a string (HTML)
                    title: newTitle,
                    tags: newTags
                };

                // Auto-generate slug if title changed and not manually edited
                if (newTitle !== prev.title && !slugManuallyEdited) {
                    updated.slug = generateSlug(newTitle);
                }

                return updated;
            });

            // Force TipTapEditor re-mount by bumping the editor key
            setEditorKey(prev => prev + 1);

            setIsDirty(true);
            setShowAiModal(false);
            setAiPrompt('');
            toast.success('Content generated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate content');
        } finally {
            setGeneratingAi(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <UnsavedChangesModal
                open={showModal}
                onOpenChange={setShowModal}
                onConfirm={confirmNavigation}
            />

            <ImageAlignmentModal
                isOpen={isAlignmentOpen}
                onClose={() => setIsAlignmentOpen(false)}
                imageSrc={formData.thumbnail}
                initialSettings={formData.imageSettings}
                onSave={(settings) => {
                    setFormData(prev => ({ ...prev, imageSettings: settings }));
                    setIsDirty(true);
                }}
            />

            {/* AI Assistant Modal */}
            <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-yellow-500" />
                            AI Writing Assistant
                        </DialogTitle>
                        <DialogDescription>
                            Describe what you want to write or how you want to edit the current content.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Instructions</label>
                            <Textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                placeholder="E.g., Write a blog post about React Hooks..."
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Language</label>
                            <Select value={aiLanguage} onValueChange={setAiLanguage}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vi">Vietnamese</SelectItem>
                                    <SelectItem value="en">English</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAiModal(false)} disabled={generatingAi}>
                            Cancel
                        </Button>
                        <Button onClick={handleAiGenerate} disabled={!aiPrompt || generatingAi}>
                            {generatingAi ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" /> Generate
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Crop Image Dialog */}
            <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
                <DialogContent className="max-w-5xl">
                    <DialogHeader>
                        <DialogTitle>Crop Thumbnail</DialogTitle>
                        <DialogDescription>
                            Adjust the crop area for your blog thumbnail (landscape recommended)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="relative w-full h-[60vh] bg-black rounded-md overflow-hidden">
                        <Cropper
                            image={tempImgUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={1.91 / 1}
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
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="flex-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCropOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="secondary" onClick={async () => {
                            try {
                                setUploading(true);
                                const paddedBlob = await getPaddedImg(tempImgUrl, 1.91 / 1);
                                setIsCropOpen(false);
                                await uploadCroppedImage(paddedBlob);
                            } catch (e) {
                                console.error(e);
                                toast.error('Failed to process image');
                                setUploading(false);
                            }
                        }} disabled={uploading}>
                            <Maximize className="mr-2 h-4 w-4" /> Fit (No Crop)
                        </Button>
                        <Button onClick={handleCropDone} disabled={uploading}>
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                                </>
                            ) : (
                                <>
                                    <CropIcon className="mr-2 h-4 w-4" /> Crop & Upload
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-2 border-b">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold">
                        {isEditing ? 'Edit Blog' : 'New Blog'}
                    </h2>
                    {lastSaved && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Save className="h-3 w-3" />
                            Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={resetForm}>
                        <RotateCcw className="h-4 w-4 mr-2" /> Reset
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowAiModal(true)}>
                        <Sparkles className="h-4 w-4 mr-2 text-yellow-500" /> AI Assistant
                    </Button>
                </div>
            </div>

            <div className="pb-32">
                {/* Banner Thumbnail */}
                <div
                    className={`w-full h-64 md:h-96 relative bg-muted group cursor-pointer transition-all ${isDragging ? 'ring-4 ring-primary ring-offset-2 scale-[0.98]' : ''
                        }`}
                    onClick={(e) => {
                        // Don't trigger file upload if clicking alignment button
                        if (e.target.closest('.alignment-btn')) return;
                        fileInputRef.current?.click();
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {formData.thumbnail ? (
                        <>
                            <Image src={formData.thumbnail} alt="Thumbnail" fill sizes="100vw" className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                                <ImageIcon className="mr-2 h-6 w-6" /> Change Cover Image
                            </div>

                            {/* Alignment Button */}
                            <div className="absolute bottom-4 right-4 z-20">
                                <Button
                                    type="button"
                                    size="sm"
                                    className="alignment-btn bg-background/80 backdrop-blur-sm text-foreground hover:bg-background"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAlignmentOpen(true);
                                    }}
                                >
                                    <Move className="mr-2 h-4 w-4" /> Adjust Alignment
                                </Button>
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

                {/* Editor & SEO Tabs */}
                <div className="max-w-none">
                    <Tabs defaultValue="content" className="w-full">
                        <div className="flex justify-center mb-8">
                            <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                                <TabsTrigger value="content">Content</TabsTrigger>
                                <TabsTrigger value="seo">SEO Settings</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="content" className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="max-w-5xl mx-auto px-4">
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
                                            className="text-4xl md:text-6xl font-bold text-center font-serif border-none focus-visible:ring-0 bg-transparent dark:bg-transparent placeholder:text-muted-foreground/30 resize-none overflow-hidden min-h-[1.5em] leading-tight p-0 shadow-none"
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
                                            <Image src={user?.photoURL || "https://github.com/yunkhngn.png"} alt="Author" fill sizes="40px" className="object-cover" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium text-sm">{user?.displayName || "Khoa Nguyễn"}</div>
                                            <div className="text-xs text-muted-foreground">Author & Developer</div>
                                        </div>
                                    </div>
                                </div>

                                <TipTapEditor
                                    key={`${initialData ? initialData.id : 'new'}-${editorKey}`}
                                    content={formData.contentJSON}
                                    onChange={(json) => {
                                        setFormData({ ...formData, contentJSON: json });
                                        setIsDirty(true);
                                    }}
                                    onImageUpload={handleEditorImageUpload}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="seo" className="max-w-5xl mx-auto px-4">
                            <SEOEditor
                                data={formData}
                                onChange={(newData) => {
                                    setFormData(newData);
                                    setIsDirty(true);
                                }}
                                onImageUpload={handleEditorImageUpload}
                            />
                        </TabsContent>
                    </Tabs>
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
