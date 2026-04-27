import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Metadata } from '@/components/template';
import { useRouter } from 'next/router';
import { ChevronLeft, Github, ExternalLink, Calendar, Star, GitFork, Scale, BookOpen, Clock, Tag, Link2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import dynamic from 'next/dynamic';
const TipTapViewer = dynamic(() => import('@/components/ui/TipTapViewer'), { ssr: false });
import Layout from '@/components/template/Default/Layout';
import CommentSection from '@/components/blog/CommentSection';
import { extractTextFromTipTap, stripHtml } from '@/lib/utils';
import JsonLd from '@/components/seo/JsonLd';
import { motion, useScroll, useTransform } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';

export async function getServerSideProps(context) {
    const { id } = context.params;

    // Cache the response for 60 seconds, revalidate in background after 300 seconds
    if (context.res) {
        context.res.setHeader(
            'Cache-Control',
            'public, s-maxage=60, stale-while-revalidate=300'
        );
    }

    try {
        const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/projects/${id}`);
        if (!res.ok) throw new Error('Failed to fetch project');
        const data = await res.json();

        // Parse techStack if it's a string
        const parsedProject = {
            ...data,
            techStack: typeof data.techStack === 'string' ? JSON.parse(data.techStack || '[]') : data.techStack,
        };

        // Generate description from content if missing
        let description = parsedProject.description;
        if (!description) {
            if (parsedProject.contentJSON) {
                description = extractTextFromTipTap(parsedProject.contentJSON);
            } else if (parsedProject.content) {
                description = stripHtml(parsedProject.content);
            }
            // Truncate to 160 chars
            if (description && description.length > 160) {
                description = description.substring(0, 157) + '...';
            }
        }
        parsedProject.description = description || `View ${parsedProject.title} on Yunkhngn`;

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

export default function ProjectDetail({ projectData }) {
    const router = useRouter();
    const { user } = useAuth();
    const [creatingLink, setCreatingLink] = useState(false);

    const handleCreateShortlink = async () => {
        setCreatingLink(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shortlinks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    targetUrl: `https://yunkhngn.dev/project/${project.slug || project.id}`,
                    title: project.title,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                const shortUrl = `https://yunkhngn.dev/s/${data.code}`;
                navigator.clipboard.writeText(shortUrl);
                toast.success(`Shortlink created & copied: ${shortUrl}`);
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to create shortlink');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to create shortlink');
        } finally {
            setCreatingLink(false);
        }
    };
    const [project, setProject] = useState(projectData);
    const [githubStats, setGithubStats] = useState(null);
    const { scrollY } = useScroll();
    const yRange = useTransform(scrollY, [0, 500], [0, 250]);
    const opacityRange = useTransform(scrollY, [0, 500], [1, 0]);

    // Update local state if props change
    useEffect(() => {
        setProject(projectData);
    }, [projectData]);

    useEffect(() => {
        if (!project?.repoLink) return;

        const fetchGithubStats = async () => {
            try {
                // Extract owner and repo from URL
                // Format: https://github.com/owner/repo
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
    }, [project?.repoLink]);

    if (!project) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 min-h-[50vh]">
                <h1 className="text-2xl font-bold">Project not found</h1>
                <Link href="/project">
                    <Button>Back to Projects</Button>
                </Link>
            </div>
        );
    }

    const jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        name: project.seoTitle || project.title,
        description: project.seoDescription || project.description,
        image: (project.seoImage || project.cover) ? [project.seoImage || project.cover] : [],
        author: {
            '@type': 'Person',
            name: 'Khoa Nguyễn',
            url: 'https://yunkhngn.dev'
        },
        programmingLanguage: Array.isArray(project.techStack) ? project.techStack.join(', ') : project.techStack,
        codeRepository: project.repoLink,
        datePublished: project.createdAt,
        dateModified: project.updatedAt || project.createdAt
    };

    return (
        <div className="bg-background text-foreground min-h-screen">
            <JsonLd data={jsonLdData} />
            <Metadata
                title={project.seoTitle || project.title}
                description={project.seoDescription || project.description}
                image={project.seoImage || project.cover}
                url={`/project/${project.id}`}
                type="article"
                publishedTime={project.createdAt}
                modifiedTime={project.updatedAt}
                tags={project.tags}
            />

            {/* Immersive Hero Section */}
            <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
                {/* Background Image with Parallax */}
                <motion.div
                    style={{ y: yRange, opacity: opacityRange }}
                    className="absolute inset-0 [-webkit-mask-image:linear-gradient(to_bottom,black_50%,transparent_100%)]"
                >
                    {project.cover ? (
                        <Image
                            src={project.cover}
                            alt={project.title}
                            fill
                            className="object-cover"
                            priority
                            quality={85}
                            sizes="100vw"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                            <div className="text-muted-foreground/20 text-9xl font-bold">PROJECT</div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                </motion.div>

                {/* Hero Content */}
                <div className="absolute inset-0 flex flex-col justify-end container mx-auto px-4 pb-16 md:pb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="max-w-4xl"
                    >
                        <Link href="/project">
                            <Button variant="outline" size="sm" className="mb-6 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-white transition-all">
                                <ChevronLeft className="mr-2 h-4 w-4" /> Back to Projects
                            </Button>
                        </Link>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                            {project.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-white/80 max-w-2xl font-light leading-loose">
                            {project.description}
                        </p>

                        <div className="flex flex-wrap gap-4 mt-8">
                            {project.demoLink && (
                                <a href={project.demoLink} target="_blank" rel="noopener noreferrer">
                                    <Button size="lg" className="h-12 px-8 text-base shadow-lg bg-white text-black hover:bg-white/90 hover:scale-105 transition-all border-none">
                                        <ExternalLink className="mr-2 h-5 w-5" /> Live Demo
                                    </Button>
                                </a>
                            )}
                            {project.repoLink && (
                                <a href={project.repoLink} target="_blank" rel="noopener noreferrer">
                                    <Button size="lg" className="h-12 px-8 text-base bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-none shadow-lg">
                                        <Github className="mr-2 h-5 w-5" /> Source Code
                                    </Button>
                                </a>
                            )}
                            {user && user.role === 'ADMIN' && (
                                <Button size="lg" onClick={handleCreateShortlink} disabled={creatingLink} className="h-12 px-8 text-base bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-none shadow-lg">
                                    {creatingLink ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Link2 className="mr-2 h-5 w-5" />}
                                    Shortlink
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar / Info Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="lg:col-span-4 lg:sticky lg:top-24 h-fit space-y-8"
                    >
                        {/* Stats Card */}
                        <div className="bg-card/50 backdrop-blur-xl border rounded-2xl p-6 shadow-sm">
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
                                        <span className="text-muted-foreground font-normal ml-1.5">({formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })})</span>
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
                        <div className="bg-card/50 backdrop-blur-xl border rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-6 flex items-center">
                                <span className="bg-primary/10 p-2 rounded-lg mr-3 text-primary">
                                    <BookOpen className="h-5 w-5" />
                                </span>
                                Tech Stack
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(project.techStack) && project.techStack.map((tech, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-md text-sm font-medium transition-colors cursor-default border border-transparent hover:border-border">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        {project.tags && (
                            <div className="bg-card/50 backdrop-blur-xl border rounded-2xl p-6 shadow-sm">
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
                                <div className="bg-card backdrop-blur-sm border rounded-2xl p-5 md:p-12 shadow-sm mb-12">
                                    <div className="prose dark:prose-invert max-w-none prose-lg md:prose-xl prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl prose-img:shadow-lg leading-loose">
                                        <TipTapViewer content={project.contentJSON || project.content} />
                                    </div>
                                </div>
                            )}

                            {/* Comments Section */}
                            <div className="bg-card backdrop-blur-sm border rounded-2xl p-5 md:p-12 shadow-sm">
                                <h2 className="text-2xl font-bold mb-8 flex items-center">
                                    <span className="bg-primary/10 w-1 h-8 rounded-full mr-4" />
                                    Comments
                                </h2>
                                <CommentSection projectId={project.id} />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

ProjectDetail.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    );
};
