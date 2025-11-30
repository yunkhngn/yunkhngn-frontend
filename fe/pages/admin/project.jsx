import AdminLayout from "@/components/template/Admin/Layout";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Loader2, Plus, Pencil, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

export default function ProjectManager() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        techStack: '',
        tags: '',
        images: []
    });

    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const fetchProjects = async () => {
        try {
            const res = await fetch('http://localhost:3001/projects');
            if (!res.ok) throw new Error('Failed to fetch projects');
            const data = await res.json();
            // Parse JSON strings if necessary (backend might return them as strings)
            const parsedData = data.map(p => ({
                ...p,
                techStack: typeof p.techStack === 'string' ? JSON.parse(p.techStack || '[]') : p.techStack,
                images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : p.images,
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
            techStack: '',
            tags: '',
            images: []
        });
        setEditingProject(null);
    };

    const handleOpenDialog = (project = null) => {
        if (project) {
            setEditingProject(project);
            setFormData({
                title: project.title,
                description: project.description,
                techStack: Array.isArray(project.techStack) ? project.techStack.join(', ') : '',
                tags: project.tags || '',
                images: Array.isArray(project.images) ? project.images : []
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const token = await user.getIdToken();

            // Get signature
            const sigRes = await fetch('http://localhost:3001/gallery/signature', {
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
                images: [...prev.images, uploadData.secure_url]
            }));

        } catch (error) {
            console.error(error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
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
                techStack: JSON.stringify(formData.techStack.split(',').map(s => s.trim()).filter(Boolean)),
                images: JSON.stringify(formData.images)
            };

            const url = editingProject
                ? `http://localhost:3001/projects/${editingProject.id}`
                : 'http://localhost:3001/projects';

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

            setIsDialogOpen(false);
            fetchProjects();
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
            const res = await fetch(`http://localhost:3001/projects/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete');
            fetchProjects();
        } catch (error) {
            console.error(error);
            alert('Failed to delete project');
        }
    };

    return (
        <AdminLayout title="Projects">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Projects</h1>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="h-4 w-4 mr-2" /> New Project
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div key={project.id} className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col">
                                <div className="aspect-video relative bg-muted">
                                    {project.images && project.images.length > 0 ? (
                                        <Image
                                            src={project.images[0]}
                                            alt={project.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            <ImageIcon className="h-10 w-10 opacity-20" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                                        {project.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {Array.isArray(project.techStack) && project.techStack.slice(0, 3).map((tech, i) => (
                                            <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-md">
                                                {tech}
                                            </span>
                                        ))}
                                        {Array.isArray(project.techStack) && project.techStack.length > 3 && (
                                            <span className="text-xs text-muted-foreground px-2 py-1">
                                                +{project.techStack.length - 3}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2 border-t mt-auto">
                                        <Button size="sm" variant="ghost" onClick={() => handleOpenDialog(project)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(project.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingProject ? 'Edit Project' : 'New Project'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
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
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tech Stack (comma separated)</label>
                                    <Input
                                        value={formData.techStack}
                                        onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                                        placeholder="React, Node.js, MongoDB"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tags (comma separated)</label>
                                    <Input
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        placeholder="Web, Mobile, Design"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Images</label>
                                <div className="grid grid-cols-4 gap-4">
                                    {formData.images.map((url, index) => (
                                        <div key={index} className="aspect-square relative rounded-lg overflow-hidden group border">
                                            <Image src={url} alt="Project" fill className="object-cover" />
                                            <button
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <div
                                        className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {uploading ? (
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        ) : (
                                            <Plus className="h-6 w-6 text-muted-foreground" />
                                        )}
                                        <span className="text-xs text-muted-foreground mt-1">Add Image</span>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleUpload}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={submitting}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Project
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
