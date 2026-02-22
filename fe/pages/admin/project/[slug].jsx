import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft, Github, ExternalLink, Star, GitFork, Scale, BookOpen, Edit, Trash2, Clock, Calendar, Tag } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const TipTapViewer = dynamic(() => import('@/components/ui/TipTapViewer'), { ssr: false });
import AdminLayout from '@/components/template/Admin/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { motion, useScroll, useTransform } from 'framer-motion';
import { format } from 'date-fns';

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
    const { scrollY } = useScroll();
    const yRange = useTransform(scrollY, [0, 500], [0, 250]);
    const opacityRange = useTransform(scrollY, [0, 500], [1, 0]);

    useEffect(() => {
        setProject(projectData);
    }, [projectData]);

    useEffect(() => {
        if (!router.query.slug) return;
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
            {/* Immersive Hero Section within Admin Layout */}
            <div className="relative h-[50vh] w-full overflow-hidden rounded-xl mb-8 group">
                {/* Background Image with Parallax */}
                <motion.div
                    style={{ y: yRange, opacity: opacityRange }}
                    className="absolute inset-0"
                >
                    {project.cover ? (
                        <Image
                            src={project.cover}
                            alt={project.title}
                            fill
                            className="object-cover"
                            priority
                            quality={100}
                        />
                    ) : (
                        <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                            <div className="text-muted-foreground/20 text-9xl font-bold">PROJECT</div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background/90" />
                    <div className="absolute inset-0 bg-black/20" />
                </motion.div>

                {/* Hero Content & Actions */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-4xl"
                    >
                        <div className="mb-6">
                            <Link href="/admin/project">
                                <Button variant="outline" size="sm" className="bg-black/20 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-white transition-all">
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Back to Projects
                                </Button>
                            </Link>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-md">
                            {project.title}
                        </h1>
                        <p className="text-lg text-white/90 max-w-2xl font-light leading-loose drop-shadow-sm mb-6">
                            {project.description}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            {/* Admin Actions */}
                            <Link href={`/admin/project/edit-project/${project.slug || project.id}`}>
                                <Button size="lg" className="h-11 px-6 bg-white text-black hover:bg-white/90 shadow-lg border-none hover:scale-105 transition-all">
                                    <Edit className="mr-2 h-4 w-4" /> Edit Project
                                </Button>
                            </Link>
                            <Button
                                size="lg"
                                className="h-11 px-6 bg-red-600 text-white hover:bg-red-700 shadow-lg border-none hover:scale-105 transition-all"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </Button>

                            <div className="w-px h-11 bg-white/20 mx-2 hidden md:block" />

                            {/* Public Links */}
                            {project.demoLink && (
                                <a href={project.demoLink} target="_blank" rel="noopener noreferrer">
                                    <Button size="lg" className="h-11 px-6 bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-none shadow-lg hover:scale-105 transition-all">
                                        <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                                    </Button>
                                </a>
                            )}
                            {project.repoLink && (
                                <a href={project.repoLink} target="_blank" rel="noopener noreferrer">
                                    <Button size="lg" className="h-11 px-6 bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-none shadow-lg hover:scale-105 transition-all">
                                        <Github className="mr-2 h-4 w-4" /> Source Code
                                    </Button>
                                </a>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar / Info Column */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-6"
                >
                    {/* Stats Card */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-6 flex items-center">
                            <span className="bg-primary/10 p-2 rounded-lg mr-3 text-primary">
                                <Clock className="h-5 w-5" />
                            </span>
                            Project Details
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-border/50">
                                <span className="text-muted-foreground flex items-center text-sm">
                                    <Calendar className="mr-2 h-4 w-4" /> Created
                                </span>
                                <span className="font-medium text-sm">
                                    {format(new Date(project.createdAt), 'MMM d, yyyy')}
                                </span>
                            </div>

                            {githubStats && (
                                <>
                                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                                        <span className="text-muted-foreground flex items-center text-sm">
                                            <Star className="mr-2 h-4 w-4" /> Stars
                                        </span>
                                        <span className="font-medium text-sm">{githubStats.stars}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                                        <span className="text-muted-foreground flex items-center text-sm">
                                            <GitFork className="mr-2 h-4 w-4" /> Forks
                                        </span>
                                        <span className="font-medium text-sm">{githubStats.forks}</span>
                                    </div>
                                    {githubStats.license && (
                                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                                            <span className="text-muted-foreground flex items-center text-sm">
                                                <Scale className="mr-2 h-4 w-4" /> License
                                            </span>
                                            <span className="font-medium text-sm">{githubStats.license}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-6 flex items-center">
                            <span className="bg-primary/10 p-2 rounded-lg mr-3 text-primary">
                                <BookOpen className="h-5 w-5" />
                            </span>
                            Tech Stack
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {Array.isArray(project.techStack) && project.techStack.map((tech, i) => (
                                <span key={i} className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md text-sm font-medium transition-colors cursor-default">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Tags */}
                    {project.tags && (
                        <div className="bg-card border rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-6 flex items-center">
                                <span className="bg-primary/10 p-2 rounded-lg mr-3 text-primary">
                                    <Tag className="h-5 w-5" />
                                </span>
                                Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {project.tags.split(',').map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium uppercase tracking-wider">
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Main Content Column */}
                <div className="lg:col-span-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        {/* Content */}
                        {(project.contentJSON || project.content) && (
                            <div className="bg-card border rounded-xl p-5 md:p-8 shadow-sm">
                                <div className="prose dark:prose-invert max-w-none prose-lg md:prose-xl prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl prose-img:shadow-lg leading-loose">
                                    <TipTapViewer content={project.contentJSON || project.content} />
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
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
