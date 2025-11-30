import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DefaultFooter, DefaultNavbar, Metadata } from "@/components/template";
import { ChevronLeft, Github, ExternalLink, Calendar } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import TipTapViewer from '@/components/ui/TipTapViewer';

export default function ProjectDetail() {
    const router = useRouter();
    const { id } = router.query;
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchProject = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`);
                if (!res.ok) throw new Error('Failed to fetch project');
                const data = await res.json();

                // Parse techStack if it's a string
                const parsedProject = {
                    ...data,
                    techStack: typeof data.techStack === 'string' ? JSON.parse(data.techStack || '[]') : data.techStack,
                };

                setProject(parsedProject);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen font-sans">
                <DefaultNavbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
                <DefaultFooter />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col min-h-screen font-sans">
                <DefaultNavbar />
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <h1 className="text-2xl font-bold">Project not found</h1>
                    <Link href="/project">
                        <Button>Back to Projects</Button>
                    </Link>
                </div>
                <DefaultFooter />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen font-sans bg-background text-foreground">
            <Metadata
                title={project.title}
                description={project.description}
                image={project.cover}
            />
            <DefaultNavbar />

            <main className="flex-1">
                <div className="container mx-auto px-4 py-12 max-w-5xl">
                    <Link href="/project" className="inline-block mb-8">
                        <Button variant="ghost" size="sm" className="pl-0 hover:pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Projects
                        </Button>
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Left Column: Image & Links */}
                        <div className="space-y-6">
                            <div className="relative aspect-video w-full rounded-xl overflow-hidden border bg-muted shadow-sm">
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

                            <div className="flex gap-4">
                                {project.demoLink && (
                                    <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                                        <Button className="w-full">
                                            <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                                        </Button>
                                    </a>
                                )}
                                {project.repoLink && (
                                    <a href={project.repoLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                                        <Button variant="outline" className="w-full">
                                            <Github className="mr-2 h-4 w-4" /> Source Code
                                        </Button>
                                    </a>
                                )}
                            </div>

                            <div className="space-y-4 pt-4">
                                <h3 className="font-semibold text-lg">Tech Stack</h3>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(project.techStack) && project.techStack.map((tech, i) => (
                                        <span key={i} className="px-3 py-1 bg-secondary rounded-full text-sm font-medium">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {project.description}
                                </p>
                            </div>

                            {(project.contentJSON || project.content) && (
                                <div className="prose dark:prose-invert max-w-none pt-6 border-t">
                                    <TipTapViewer content={project.contentJSON || project.content} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <DefaultFooter />
        </div>
    );
}
