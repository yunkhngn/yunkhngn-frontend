import AdminLayout from "@/components/template/Admin/Layout";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Pencil, Trash2, Github, ExternalLink, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import TipTapViewer from '@/components/ui/TipTapViewer';
import { toast } from 'sonner';

export default function ViewProject() {
    const { user } = useAuth();
    const router = useRouter();
    const { slug } = router.query;
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        const fetchProject = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${slug}`);
                if (!res.ok) throw new Error('Failed to fetch project');
                const data = await res.json();

                const parsedData = {
                    ...data,
                    techStack: typeof data.techStack === 'string' ? JSON.parse(data.techStack || '[]') : data.techStack,
                    tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                };

                setProject(parsedData);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch project details');
                router.push('/admin/project');
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [slug, router]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${project.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Project deleted');
            router.push('/admin/project');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete project');
        }
    };

    if (loading) return <AdminLayout title="Project Details"><div className="text-center py-12">Loading...</div></AdminLayout>;
    if (!project) return <AdminLayout title="Project Details"><div className="text-center py-12">Project not found</div></AdminLayout>;

    return (
        <AdminLayout title="Project Details">
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                {/* Header / Actions */}
                <div className="flex items-center justify-between">
                    <Link href="/admin/project">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back to List
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <Link href={`/admin/project/edit-project/${project.slug || project.id}`}>
                            <Button variant="outline" size="sm">
                                <Pencil className="h-4 w-4 mr-2" /> Edit
                            </Button>
                        </Link>
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                    </div>
                </div>

                {/* Cover Image */}
                {project.cover && (
                    <div className="aspect-video relative rounded-xl overflow-hidden border bg-muted">
                        <Image
                            src={project.cover}
                            alt={project.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                {/* Title & Description */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold">{project.title}</h1>
                    <p className="text-lg text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-card border rounded-xl">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Tech Stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.techStack.map((tech, i) => (
                                    <span key={i} className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.tags.map((tag, i) => (
                                    <span key={i} className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Links</h3>
                            <div className="flex flex-col gap-2">
                                {project.repoLink && (
                                    <a
                                        href={project.repoLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-primary hover:underline"
                                    >
                                        <Github className="h-4 w-4 mr-2" /> Repository
                                    </a>
                                )}
                                {project.demoLink && (
                                    <a
                                        href={project.demoLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-primary hover:underline"
                                    >
                                        <ExternalLink className="h-4 w-4 mr-2" /> Live Demo
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {project.contentJSON && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold border-b pb-2">Project Details</h2>
                        <div className="bg-card border rounded-xl p-3 overflow-hidden">
                            <TipTapViewer content={project.contentJSON} />
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
