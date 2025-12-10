import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft, Github, ExternalLink, Star, GitFork, Scale, BookOpen, Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import TipTapViewer from '@/components/ui/TipTapViewer';
import AdminLayout from '@/components/template/Admin/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export async function getServerSideProps(context) {
    const { slug } = context.params;

    try {
        const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/projects/${slug}`);
        if (!res.ok) throw new Error('Failed to fetch project');
        const data = await res.json();

        // Parse techStack if it's a string
        const parsedProject = {
            ...data,
            techStack: typeof data.techStack === 'string' ? JSON.parse(data.techStack || '[]') : data.techStack,
        };

        return {
            props: {
                projectData: parsedProject,
            },
        };
    } catch (error) {
        console.error(error);
        return {
            notFound: true,
        };
    }
}

export default function AdminProjectDetail({ projectData }) {
    const router = useRouter();
    const { user } = useAuth();
    const [project, setProject] = useState(projectData);
    const [githubStats, setGithubStats] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setProject(projectData);
    }, [projectData]);

    useEffect(() => {
        if (!router.query.slug) return; // Assuming 'slug' is available in router.query
        if (!project?.repoLink) return;

        const fetchGithubStats = async () => {
            try {
                const match = project.repoLink.match(/github\.com\/([^/]+)\/([^/]+)/);
                if (!match) return;

                const [, owner, repo] = match;
                const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
                if (!res.ok) return;

                const data = await res.json();
                setGithubStats({
                    stars: data.stargazers_count,
                    forks: data.forks_count,
                    license: data.license?.spdx_id || data.license?.name,
                    repoUrl: data.html_url
                });
            } catch (error) {
                console.error('Error fetching GitHub stats:', error);
            }
        };

        fetchGithubStats();
    }, [router.query.slug, project?.repoLink]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${project.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                toast.success('Project deleted successfully');
                router.push('/admin/project');
            } else {
                throw new Error('Failed to delete project');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete project');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    if (!project) {
        return (
            <AdminLayout title="Project Not Found">
                <div className="flex-1 flex flex-col items-center justify-center space-y-4 min-h-[50vh]">
                    <h1 className="text-2xl font-bold">Project not found</h1>
                    <Link href="/admin/project">
                        <Button>Back to Projects</Button>
                    </Link>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={project.title}>
            <div className="space-y-8">
                {/* Header with Actions */}
                <div className="flex items-center justify-between">
                    <Link href="/admin/project">
                        <Button variant="ghost" size="sm" className="pl-0">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Projects
                        </Button>
                    </Link>
                    <div className="flex gap-2">
                        <Link href={`/admin/project/${project.id}/edit`}>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </div>
                </div>

                {/* Cover Image */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border bg-muted shadow-sm">
                    {project.cover ? (
                        <Image
                            src={project.cover}
                            alt={project.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            No Preview
                        </div>
                    )}
                </div>

                {/* Title, Description & Links */}
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight">{project.title}</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        {project.description}
                    </p>

                    <div className="flex flex-col items-center gap-4 pt-4">
                        <div className="flex gap-4">
                            {project.demoLink && (
                                <a href={project.demoLink} target="_blank" rel="noopener noreferrer">
                                    <Button className="h-12 px-8 text-base" variant="default">
                                        <ExternalLink className="mr-2 h-5 w-5" /> Live Demo
                                    </Button>
                                </a>
                            )}
                            {project.repoLink && (
                                <a href={project.repoLink} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" className="h-12 px-8 text-base">
                                        <Github className="mr-2 h-5 w-5" />
                                        Source Code
                                    </Button>
                                </a>
                            )}
                        </div>

                        {githubStats && (
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1 hover:text-foreground transition-colors" title="Stars">
                                    <Star className="h-4 w-4" /> {githubStats.stars}
                                </span>
                                <span className="flex items-center gap-1 hover:text-foreground transition-colors" title="Forks">
                                    <GitFork className="h-4 w-4" /> {githubStats.forks}
                                </span>
                                {githubStats.license && (
                                    <span className="flex items-center gap-1 hover:text-foreground transition-colors" title="License">
                                        <Scale className="h-4 w-4" /> {githubStats.license}
                                    </span>
                                )}
                                <a
                                    href={`${githubStats.repoUrl}#readme`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                                    title="View README"
                                >
                                    <BookOpen className="h-4 w-4" /> README
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tech Stack */}
                {project.techStack && project.techStack.length > 0 && (
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4 text-center">Tech Stack</h2>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {project.techStack.map((tech, index) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Content */}
                {project.contentJSON && (
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-6 text-center">Project Details</h2>
                        <div className="prose dark:prose-invert max-w-none">
                            <TipTapViewer content={project.contentJSON} />
                        </div>
                    </div>
                )}

                {/* Tags */}
                {project.tags && (
                    <div className="max-w-4xl mx-auto pt-8 border-t">
                        <div className="flex flex-wrap gap-2">
                            {project.tags.split(',').map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-muted text-muted-foreground rounded-md text-sm"
                                >
                                    #{tag.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={showDeleteModal}
                onOpenChange={setShowDeleteModal}
                onConfirm={handleDelete}
                title="Delete Project"
                description={`Are you sure you want to delete "${project.title}"? This action cannot be undone.`}
                confirmText="Delete"
                loading={deleting}
            />
        </AdminLayout>
    );
}
