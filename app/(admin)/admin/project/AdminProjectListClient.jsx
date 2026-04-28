'use client';

import { readNestJson } from '@/lib/api/readJson';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Plus, Pencil, Trash2, Image as ImageIcon, Github, ExternalLink, Search, LayoutList, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';

export default function ProjectList() {
    const { user } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState('grid');
    const [itemsPerPage, setItemsPerPage] = useState(9);
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProjects, setSelectedProjects] = useState([]);

    useEffect(() => {
        const savedViewMode = localStorage.getItem('admin_project_view_mode');
        const savedItemsPerPage = localStorage.getItem('admin_project_items_per_page');
        if (savedViewMode) setViewMode(savedViewMode);
        if (savedItemsPerPage) setItemsPerPage(Number(savedItemsPerPage));
    }, []);

    // ...

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`);
            if (!res.ok) throw new Error('Failed to fetch projects');
            const data = await readNestJson(res);
            const parsedData = data.map(p => ({
                ...p,
                techStack: typeof p.techStack === 'string' ? JSON.parse(p.techStack || '[]') : p.techStack,
                tags: p.tags ? p.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
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

    const handleDelete = (id) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${deleteId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Project deleted');
            fetchProjects();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete project');
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        }
    };



    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedProjects(paginatedProjects.map(p => p.id));
        } else {
            setSelectedProjects([]);
        }
    };

    const handleSelectProject = (projectId, checked) => {
        if (checked) {
            setSelectedProjects(prev => [...prev, projectId]);
        } else {
            setSelectedProjects(prev => prev.filter(id => id !== projectId));
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedProjects.length} projects?`)) return;

        try {
            const token = await user.getIdToken();
            await Promise.all(selectedProjects.map(id =>
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                })
            ));

            setProjects(projects.filter(p => !selectedProjects.includes(p.id)));
            setSelectedProjects([]);
            toast.success('Projects deleted');
            fetchProjects();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete projects');
        }
    };

    const handleViewChange = (mode) => {
        setViewMode(mode);
        const newItemsPerPage = mode === 'grid' ? 9 : 15;
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
        localStorage.setItem('admin_project_view_mode', mode);
        localStorage.setItem('admin_project_items_per_page', newItemsPerPage.toString());
    };

    const handleItemsPerPageChange = (value) => {
        const numValue = Number(value);
        setItemsPerPage(numValue);
        setCurrentPage(1);
        localStorage.setItem('admin_project_items_per_page', numValue.toString());
    };

    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    // ...

    return (
        <>
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

                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                            <SelectTrigger className="w-[70px] h-8">
                                <SelectValue placeholder={itemsPerPage} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="6">6</SelectItem>
                                <SelectItem value="9">9</SelectItem>
                                <SelectItem value="12">12</SelectItem>
                                <SelectItem value="15">15</SelectItem>
                                <SelectItem value="30">30</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center border rounded-md p-1 bg-muted/20">
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleViewChange('grid')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleViewChange('list')}
                            >
                                <LayoutList className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {selectedProjects.length > 0 && (
                    <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                        <span className="text-sm font-medium">
                            {selectedProjects.length} selected
                        </span>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                                {paginatedProjects.map((project) => (
                                    <div
                                        key={project.id}
                                        onClick={() => router.push(`/admin/project/${project.slug || project.id}`)}
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
                                                        router.push(`/admin/project/edit-project/${project.slug || project.id}`);
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
                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {Array.isArray(project.tags) && project.tags.slice(0, 3).map((tag, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs font-normal">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {Array.isArray(project.tags) && project.tags.length > 3 && (
                                                    <span className="text-xs text-muted-foreground px-1">
                                                        +{project.tags.length - 3}
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
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground border-b">
                                        <tr>
                                            <th className="px-4 py-3 w-[50px]">
                                                <Checkbox
                                                    checked={selectedProjects.length === paginatedProjects.length && paginatedProjects.length > 0}
                                                    onCheckedChange={handleSelectAll}
                                                />
                                            </th>
                                            <th className="px-4 py-3 font-medium">Project</th>
                                            <th className="px-4 py-3 font-medium">Tech Stack</th>
                                            <th className="px-4 py-3 font-medium">Tags</th>
                                            <th className="px-4 py-3 font-medium">Links</th>
                                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {paginatedProjects.map((project) => (
                                            <tr
                                                key={project.id}
                                                className="hover:bg-muted/50 transition-colors cursor-pointer"
                                                onClick={() => router.push(`/admin/project/${project.slug || project.id}`)}
                                            >
                                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={selectedProjects.includes(project.id)}
                                                        onCheckedChange={(checked) => handleSelectProject(project.id, checked)}
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-10 w-16 bg-muted rounded overflow-hidden shrink-0">
                                                            {project.cover ? (
                                                                <Image
                                                                    src={project.cover}
                                                                    alt={project.title}
                                                                    fill
                                                                    sizes="64px"
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                                    <ImageIcon className="h-4 w-4 opacity-20" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium line-clamp-1">{project.title}</div>
                                                            <div className="text-xs text-muted-foreground line-clamp-1">{project.slug}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
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
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {Array.isArray(project.tags) && project.tags.slice(0, 3).map((tag, i) => (
                                                            <Badge key={i} variant="outline" className="text-xs font-normal">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                        {Array.isArray(project.tags) && project.tags.length > 3 && (
                                                            <span className="text-xs text-muted-foreground px-1">
                                                                +{project.tags.length - 3}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
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
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/admin/project/edit-project/${project.slug || project.id}`);
                                                            }}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(project.id);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Delete Project"
                    description="Are you sure you want to delete this project? This action cannot be undone."
                />
            </div>
        </>
    );
}
