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
                <div className="flex flex-col items-center text-center mb-12 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground max-w-2xl text-lg">
                        A collection of my work, side projects, and open source contributions.
                    </p>

                    <div className="relative w-full max-w-md mt-6">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-10"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {filteredProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {paginatedProjects.map((project) => (
                                    <Link
                                        href={`/project/${project.id}`}
                                        key={project.id}
                                        className="group flex flex-col bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full"
                                    >
                                        <div className="aspect-video relative bg-muted overflow-hidden">
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

                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                                                {project.repoLink && (
                                                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={(e) => {
                                                        e.preventDefault();
                                                        window.open(project.repoLink, '_blank');
                                                    }}>
                                                        <Github className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {project.demoLink && (
                                                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={(e) => {
                                                        e.preventDefault();
                                                        window.open(project.demoLink, '_blank');
                                                    }}>
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1 p-6 flex flex-col">
                                            <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                                {project.title}
                                            </h2>
                                            <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                                                {project.description}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mt-auto">
                                                {Array.isArray(project.techStack) && project.techStack.slice(0, 4).map((tech, i) => (
                                                    <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-md font-medium">
                                                        {tech}
                                                    </span>
                                                ))}
                                                {Array.isArray(project.techStack) && project.techStack.length > 4 && (
                                                    <span className="text-xs text-muted-foreground px-1 self-center">
                                                        +{project.techStack.length - 4}
                                                    </span>
                                                )}
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

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </main>

            <DefaultFooter />
        </div>
    );
}
