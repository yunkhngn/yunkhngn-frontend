'use client';

import { useState, useEffect } from 'react';
import { readNestJson } from '@/lib/api/readJson';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Search, Github, ExternalLink, Star, GitFork } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [selectedTag, setSelectedTag] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsRes, reposRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/github/repos`)
                ]);

                let parsedProjects = [];
                if (projectsRes.ok) {
                    const projectsData = await readNestJson(projectsRes);
                    parsedProjects = projectsData.map(p => ({
                        ...p,
                        techStack: typeof p.techStack === 'string' ? JSON.parse(p.techStack || '[]') : p.techStack,
                        type: 'project'
                    }));
                    setProjects(parsedProjects);
                }

                let parsedRepos = [];
                if (reposRes.ok) {
                    const reposData = await readNestJson(reposRes);
                    parsedRepos = reposData.map(r => ({
                        id: `repo-${r.id}`,
                        title: r.name,
                        description: r.description || 'No description available.',
                        cover: null, // Repos don't have covers usually, maybe use a placeholder or language icon
                        tags: r.language ? `Open Source, ${r.language}` : 'Open Source',
                        techStack: [r.language].filter(Boolean),
                        repoLink: r.html_url,
                        demoLink: r.homepage,
                        createdAt: r.created_at,
                        type: 'repo',
                        stars: r.stargazers_count,
                        forks: r.forks_count
                    }));
                    setRepos(parsedRepos);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const allTags = [...new Set([...projects, ...repos].flatMap(item => item.tags ? item.tags.split(',').map(t => t.trim()) : []))];

    const filterItems = (items) => {
        return items.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
            const matchesTag = selectedTag ? item.tags && item.tags.includes(selectedTag) : true;
            return matchesSearch && matchesTag;
        });
    };

    const filteredProjects = filterItems(projects);
    const filteredRepos = filterItems(repos);

    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const paginatedProjects = filteredProjects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedTag]);

    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
            {/* Hero Section */}
            <div className="flex flex-col items-center text-center mb-20 space-y-6">
                <div className="space-y-4">
                    <div className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-4">
                        Hard-working Developer
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-serif">
                        Projects & Open Source
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl">
                        A collection of my work, side projects, and open source contributions.
                    </p>
                </div>

                <div className="w-full max-w-md flex gap-2 mt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects and repos..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-10"
                        />
                    </div>
                </div>
            </div>


            {/* Explore Topics */}
            {
                allTags.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-16 max-w-3xl mx-auto">
                        <Button
                            variant={selectedTag === null ? "default" : "outline"}
                            onClick={() => setSelectedTag(null)}
                            className="rounded-full text-sm h-8"
                        >
                            All
                        </Button>
                        {allTags.map(tag => (
                            <Button
                                key={tag}
                                variant={selectedTag === tag ? "default" : "outline"}
                                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                                className="rounded-full text-sm h-8"
                            >
                                {tag}
                            </Button>
                        ))}
                    </div>
                )
            }

            {
                loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="space-y-20">
                        {/* Projects Section */}
                        <section>
                            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                                Featured Projects
                            </h2>
                            {filteredProjects.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                                        {paginatedProjects.map((project) => (
                                            <Link
                                                href={`/project/${project.slug || project.id}`}
                                                key={project.id}
                                                className="group flex flex-col gap-4"
                                            >
                                                <div className="aspect-video relative bg-muted overflow-hidden rounded-2xl border">
                                                    {project.cover ? (
                                                        <Image
                                                            src={project.cover}
                                                            alt={project.title}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary/30">
                                                            <span>No Preview</span>
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
                                                    <h2 className="text-2xl font-bold group-hover:text-primary transition-colors leading-tight">
                                                        {project.title}
                                                    </h2>
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
                                    <div className="mt-12">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground border rounded-xl border-dashed">
                                    No projects found matching your search.
                                </div>
                            )}
                        </section>

                        {/* Open Source Section */}
                        <section>
                            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                                <Github className="h-8 w-8" />
                                Open Source Contributions
                            </h2>
                            {filteredRepos.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredRepos.map((repo) => (
                                        <a
                                            key={repo.id}
                                            href={repo.repoLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group block h-full"
                                        >
                                            <div className="h-full border rounded-xl p-6 hover:border-primary transition-colors bg-card flex flex-col">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors line-clamp-1">
                                                        {repo.title}
                                                    </h3>
                                                    <Badge variant="secondary" className="font-normal text-xs">
                                                        {repo.techStack[0] || 'Code'}
                                                    </Badge>
                                                </div>
                                                <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                                                    {repo.description}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-auto">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 text-yellow-500" />
                                                        {repo.stars}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <GitFork className="h-4 w-4 text-blue-500" />
                                                        {repo.forks}
                                                    </div>
                                                    <div className="ml-auto">
                                                        <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground border rounded-xl border-dashed">
                                    No repositories found matching your search.
                                </div>
                            )}
                        </section>
                    </div>
                )
            }
        </div >
    );
}

