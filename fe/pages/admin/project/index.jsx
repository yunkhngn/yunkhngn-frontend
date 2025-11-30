import AdminLayout from "@/components/template/Admin/Layout";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Image as ImageIcon, Github, ExternalLink, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { Input } from '@/components/ui/Input';

export default function ProjectList() {
    const { user } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`);
            if (!res.ok) throw new Error('Failed to fetch projects');
            const data = await res.json();
            const parsedData = data.map(p => ({
                ...p,
                techStack: typeof p.techStack === 'string' ? JSON.parse(p.techStack || '[]') : p.techStack,
            }));
            setProjects(parsedData);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Project deleted');
            fetchProjects();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete project');
        }
    };

    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout title="Projects">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                        <p className="text-muted-foreground">Manage your projects</p>
                    </div>
                    <Link href="/admin/project/add-project">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" /> New Project
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => router.push(`/admin/project/${project.id}`)}
                                className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col transition-all hover:shadow-md group cursor-pointer"
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
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-8 w-8"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/admin/project/edit-project/${project.id}`);
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="h-8 w-8"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(project.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-semibold text-lg mb-2 line-clamp-1">{project.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                                        {project.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {Array.isArray(project.techStack) && project.techStack.slice(0, 3).map((tech, i) => (
                                            <span key={i} className="text-xs bg-secondary px-2 py-0.5 rounded">
                                                {tech}
                                            </span>
                                        ))}
                                        {Array.isArray(project.techStack) && project.techStack.length > 3 && (
                                            <span className="text-xs text-muted-foreground px-1">
                                                +{project.techStack.length - 3}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-end gap-3 pt-3 border-t mt-auto items-center">
                                        {project.repoLink && (
                                            <a
                                                href={project.repoLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-muted-foreground hover:text-primary transition-colors"
                                                title="Repository"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Github className="h-4 w-4" />
                                            </a>
                                        )}
                                        {project.demoLink && (
                                            <a
                                                href={project.demoLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-muted-foreground hover:text-primary transition-colors"
                                                title="Live Demo"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
