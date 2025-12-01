import { useState, useEffect } from 'react';
import { DefaultFooter, DefaultNavbar, Metadata } from "@/components/template";
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Github, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Pagination } from '@/components/ui/Pagination';

export default function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
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
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

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

    return (
        <div className="flex flex-col min-h-screen font-sans bg-background text-foreground">
            <Metadata
                title="Projects"
                description="Showcase of my web development projects and experiments."
            />
            <DefaultNavbar />

            <main className="flex-1 container mx-auto px-4 py-12 md:py-20 max-w-7xl">
                {/* Hero Section */}
                <div className="flex flex-col items-center text-center mb-20 space-y-6">
                    <div className="space-y-4">
                        <div className="text-sm font-medium text-primary uppercase tracking-wider">Our Work</div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-serif">
                            Selected Projects
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl">
                            A collection of my work, side projects, and open source contributions.
                        </p>
                    </div>

                    <div className="w-full max-w-md flex gap-2 mt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search projects..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-10"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {filteredProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                                {paginatedProjects.map((project) => (
                                    <Link
                                        href={`/project/${project.slug || project.id}`}
                                        key={project.id}
                                        className="group flex flex-col gap-4"
                                    >
                                        <div className="aspect-video relative bg-muted overflow-hidden rounded-2xl">
                                            {project.cover ? (
                                                <Image
                                                    src={project.cover}
                                                    alt={project.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary/50">
                                                    No Preview
                                                </div>
                                            )}

                                            {/* Hover Overlay for Links */}
                                            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                {project.repoLink && (
                                                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-sm" onClick={(e) => {
                                                        e.preventDefault();
                                                        window.open(project.repoLink, '_blank');
                                                    }}>
                                                        <Github className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {project.demoLink && (
                                                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-sm" onClick={(e) => {
                                                        e.preventDefault();
                                                        window.open(project.demoLink, '_blank');
                                                    }}>
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start gap-2">
                                                <h2 className="text-2xl font-bold group-hover:text-primary transition-colors leading-tight">
                                                    {project.title}
                                                </h2>
                                            </div>
                                            <p className="text-muted-foreground line-clamp-2 text-base">
                                                {project.description}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-auto">
                                                {/* Tags */}
                                                {project.tags && project.tags.split(',').map((tag, i) => (
                                                    <span key={`tag-${i}`} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
                                                        {tag.trim()}
                                                    </span>
                                                ))}

                                                {/* Tech Stack */}
                                                {Array.isArray(project.techStack) && project.techStack.slice(0, 4).map((tech, i) => (
                                                    <span key={i} className="text-xs border px-2 py-1 rounded-md font-medium text-muted-foreground">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-muted-foreground">
                                No projects found matching your search.
                            </div>
                        )}

                        <div className="mt-16">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </>
                )}
            </main>

            <DefaultFooter />
        </div>
    );
}
