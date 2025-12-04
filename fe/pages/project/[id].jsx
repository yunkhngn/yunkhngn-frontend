import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Metadata } from "@/components/template";
import { ChevronLeft, Github, ExternalLink, Calendar, Star, GitFork, Scale, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import TipTapViewer from '@/components/ui/TipTapViewer';
import Layout from '@/components/template/Default/Layout';
import CommentSection from '@/components/blog/CommentSection';
import { extractTextFromTipTap, stripHtml } from '@/lib/utils';
import JsonLd from '@/components/seo/JsonLd';

export async function getServerSideProps(context) {
    const { id } = context.params;

    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`);
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
    const [project, setProject] = useState(projectData);
    const [githubStats, setGithubStats] = useState(null);

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
        name: project.title,
        description: project.description,
        image: project.cover ? [project.cover] : [],
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
        <div className="bg-background text-foreground">
            <JsonLd data={jsonLdData} />
            <Metadata
                title={project.title}
                description={project.description}
                image={project.cover}
            />

            <div className="container mx-auto px-4 py-12 max-w-5xl">
                <Link href="/project" className="inline-block mb-8">
                    <Button variant="ghost" size="sm" className="pl-0 hover:pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Projects
                    </Button>
                </Link>

                <div className="space-y-12 mb-16">
                    {/* Full Width Image */}
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
                                        className="flex items-center gap-1 hover:text-foreground transition-colors underline underline-offset-4"
                                    >
                                        <BookOpen className="h-4 w-4" /> Readme
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tags & Tech Stack */}
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t">
                        {/* Tags */}
                        {project.tags && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-xl">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.split(',').map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium">
                                            {tag.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tech Stack */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-xl">Tech Stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(project.techStack) && project.techStack.map((tech, i) => (
                                    <span key={i} className="px-4 py-2 bg-secondary rounded-full text-sm font-medium">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section - Full Width Below */}
                {(project.contentJSON || project.content) && (
                    <div className="max-w-4xl mx-auto pt-12 border-t">
                        <div className="prose dark:prose-invert max-w-none">
                            <TipTapViewer content={project.contentJSON || project.content} />
                        </div>
                    </div>
                )}

                {/* Comments Section */}
                <div className="max-w-4xl mx-auto pt-12 mt-12 border-t">
                    <h2 className="text-2xl font-bold mb-8">Comments</h2>
                    <CommentSection projectId={project.id} />
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
