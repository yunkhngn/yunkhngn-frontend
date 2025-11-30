import AdminLayout from "@/components/template/Admin/Layout";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { TagInput } from '@/components/ui/TagInput';
import TipTapEditor from '@/components/ui/TipTapEditor';
import { Loader2, Plus, Pencil, Trash2, X, Upload, Image as ImageIcon, Save, RotateCcw, Github, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { cn } from "@/lib/utils";

export default function ProjectManager() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        techStack: [],
        tags: [],
        repoLink: '',
        demoLink: '',
        cover: '',
        contentJSON: ''
    });

    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`);
            if (!res.ok) throw new Error('Failed to fetch projects');
            const data = await res.json();
            // Parse JSON strings if necessary (backend might return them as strings)
            const parsedData = data.map(p => ({
                ...p,
                techStack: typeof p.techStack === 'string' ? JSON.parse(p.techStack || '[]') : p.techStack,
            }));
            setProjects(parsedData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            techStack: [],
            tags: [],
            repoLink: '',
            demoLink: '',
            cover: '',
            contentJSON: ''
        });
        setEditingProject(null);
    };

    const handleSelectProject = (project) => {
        setEditingProject(project);
        setFormData({
            title: project.title,
            description: project.description,
            techStack: Array.isArray(project.techStack) ? project.techStack : [],
            tags: project.tags ? project.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            repoLink: project.repoLink || '',
            demoLink: project.demoLink || '',
            cover: project.cover || '',
            contentJSON: project.contentJSON || ''
        });
        // Scroll to top on mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

        } catch (error) {
            console.error(error);
            alert('Failed to upload image');
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
            alert('Failed to upload image');
            return null;
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.description) {
            alert('Title and Description are required');
            return;
        }

        setSubmitting(true);
        try {
            const token = await user.getIdToken();
            const payload = {
                ...formData,
                techStack: JSON.stringify(formData.techStack),
                tags: formData.tags.join(', '),
            };

            const url = editingProject
                ? `${process.env.NEXT_PUBLIC_API_URL}/projects/${editingProject.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/projects`;

            const method = editingProject ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save project');

            fetchProjects();
            resetForm();
        } catch (error) {
            console.error(error);
            alert('Failed to save project');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete');
            fetchProjects();
            if (editingProject?.id === id) resetForm();
        } catch (error) {
            console.error(error);
            alert('Failed to delete project');
        }
    };

    return (
        <AdminLayout title="Projects">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
                {/* Left Panel: Editor */}
                <div className="lg:col-span-5 flex flex-col gap-4 h-full overflow-y-auto pr-2">
                    <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-2 border-b">
                        <h2 className="text-xl font-bold">
                            {editingProject ? 'Edit Project' : 'New Project'}
                        </h2>
                        <Button variant="ghost" size="sm" onClick={resetForm}>
                            <RotateCcw className="h-4 w-4 mr-2" /> Reset
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Project Title"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Project Description"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tech Stack</label>
                                <TagInput
                                    value={formData.techStack}
                                    onChange={(newTags) => setFormData({ ...formData, techStack: newTags })}
                                    placeholder="React, Node.js..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tags</label>
                                <TagInput
                                    value={formData.tags}
                                    onChange={(newTags) => setFormData({ ...formData, tags: newTags })}
                                    placeholder="Web, Mobile..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Repo Link</label>
                                <Input
                                    value={formData.repoLink}
                                    onChange={(e) => setFormData({ ...formData, repoLink: e.target.value })}
                                    placeholder="https://github.com/..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Demo Link</label>
                                <Input
                                    value={formData.demoLink}
                                    onChange={(e) => setFormData({ ...formData, demoLink: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cover Image</label>
                            <div
                                className="aspect-video relative rounded-lg overflow-hidden group border border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
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
                                key={editingProject ? editingProject.id : 'new'} // Force remount on project switch
                                content={formData.contentJSON}
                                onChange={(json) => setFormData({ ...formData, contentJSON: json })}
                                onImageUpload={handleEditorImageUpload}
                            />
                        </div>

                        <div className="pt-4 flex gap-2">
                            <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                {editingProject ? 'Update Project' : 'Create Project'}
                            </Button>
                            {editingProject && (
                                <Button variant="destructive" size="icon" onClick={() => handleDelete(editingProject.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: List */}
                <div className="lg:col-span-7 h-full overflow-y-auto border-l pl-8">
                    <div className="flex items-center justify-between mb-6 sticky top-0 bg-background z-10 py-2">
                        <h1 className="text-2xl font-bold">All Projects ({projects.length})</h1>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() => handleSelectProject(project)}
                                    className={cn(
                                        "bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col cursor-pointer transition-all hover:shadow-md",
                                        editingProject?.id === project.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
                                    )}
                                >
                                    <div className="aspect-video relative bg-muted">
                                        {project.cover ? (
                                            <Image
                                                src={project.cover}
                                                alt={project.title}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, 300px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                <ImageIcon className="h-8 w-8 opacity-20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 flex-1 flex flex-col">
                                        <h3 className="font-semibold text-base mb-1 line-clamp-1">{project.title}</h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">
                                            {project.description}
                                        </p>
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {Array.isArray(project.techStack) && project.techStack.slice(0, 2).map((tech, i) => (
                                                <span key={i} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">
                                                    {tech}
                                                </span>
                                            ))}
                                            {Array.isArray(project.techStack) && project.techStack.length > 2 && (
                                                <span className="text-[10px] text-muted-foreground px-1">
                                                    +{project.techStack.length - 2}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2 border-t mt-auto items-center">
                                            {project.repoLink && (
                                                <a
                                                    href={project.repoLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-full"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="Repository"
                                                >
                                                    <Github className="h-4 w-4" />
                                                </a>
                                            )}
                                            {project.demoLink && (
                                                <a
                                                    href={project.demoLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-full"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="Live Demo"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            )}
                                            {(project.repoLink || project.demoLink) && <div className="w-px h-4 bg-border mx-1"></div>}

                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleSelectProject(project); }}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
