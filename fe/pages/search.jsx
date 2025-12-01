import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/template/Default/Layout';
import { Input } from '@/components/ui/Input';
import { Search as SearchIcon, FileText, Folder, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';

export default function Search() {
    const router = useRouter();
    const { q } = router.query;
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState({ blogs: [], projects: [], photos: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (q) {
            setSearchQuery(q);
            performSearch(q);
        }
    }, [q]);

    const performSearch = async (query) => {
        if (!query || query.trim().length < 2) {
            setResults({ blogs: [], projects: [], photos: [] });
            return;
        }

        setLoading(true);
        try {
            const [blogsRes, projectsRes, photosRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery`)
            ]);

            const blogs = await blogsRes.json();
            const projects = await projectsRes.json();
            const photos = await photosRes.json();

            const lowerQuery = query.toLowerCase();

            const filteredBlogs = blogs.filter(blog =>
                blog.status === 'PUBLISHED' && (
                    blog.title?.toLowerCase().includes(lowerQuery) ||
                    blog.tags?.toLowerCase().includes(lowerQuery)
                )
            );

            const filteredProjects = projects.filter(project =>
                project.title?.toLowerCase().includes(lowerQuery) ||
                project.description?.toLowerCase().includes(lowerQuery) ||
                project.tech?.some(t => t.toLowerCase().includes(lowerQuery))
            );

            const filteredPhotos = photos.filter(photo =>
                photo.caption?.toLowerCase().includes(lowerQuery)
            );

            setResults({
                blogs: filteredBlogs,
                projects: filteredProjects,
                photos: filteredPhotos
            });
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const totalResults = results.blogs.length + results.projects.length + results.photos.length;

    return (
        <div className="container mx-auto px-4 py-12 md:py-20">
            {/* Search Header */}
            <div className="max-w-3xl mx-auto mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">Search</h1>
                <form onSubmit={handleSearch} className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
                    <Input
                        type="search"
                        placeholder="Search blogs, projects, photos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 text-lg"
                        autoFocus
                    />
                </form>

                {q && (
                    <p className="text-muted-foreground mt-4 text-center">
                        {loading ? 'Searching...' : `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${q}"`}
                    </p>
                )}
            </div>

            {/* Search Results */}
            {q && !loading && (
                <div className="max-w-6xl mx-auto space-y-12">
                    {/* Blogs */}
                    {results.blogs.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                Blogs ({results.blogs.length})
                            </h2>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {results.blogs.map((blog) => (
                                    <Link
                                        key={blog.id}
                                        href={`/blog/${blog.slug}`}
                                        className="group block rounded-lg border bg-card hover:shadow-md transition-all"
                                    >
                                        {blog.thumbnail && (
                                            <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
                                                <Image
                                                    src={blog.thumbnail}
                                                    alt={blog.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                {blog.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <time>{format(new Date(blog.createdAt), 'MMM d, yyyy')}</time>
                                                {blog.tags && <Badge variant="secondary" className="text-xs">{blog.tags}</Badge>}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {results.projects.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                Projects ({results.projects.length})
                            </h2>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {results.projects.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/project/${project.slug}`}
                                        className="group block rounded-lg border bg-card hover:shadow-md transition-all"
                                    >
                                        {project.cover && (
                                            <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
                                                <Image
                                                    src={project.cover}
                                                    alt={project.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h3 className="font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                                {project.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                {project.description}
                                            </p>
                                            {project.tech && project.tech.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {project.tech.slice(0, 3).map((tech, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs">
                                                            {tech}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Photos */}
                    {results.photos.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                Photos ({results.photos.length})
                            </h2>
                            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                                {results.photos.map((photo) => (
                                    <div key={photo.id} className="break-inside-avoid relative group rounded-lg overflow-hidden">
                                        <Image
                                            src={photo.imageUrl}
                                            alt={photo.caption || 'Photo'}
                                            width={400}
                                            height={400}
                                            className="w-full h-auto object-cover"
                                        />
                                        {photo.caption && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                                                <p className="text-white p-3 text-sm">{photo.caption}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* No Results */}
                    {totalResults === 0 && (
                        <div className="text-center py-12">
                            <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No results found</h3>
                            <p className="text-muted-foreground">
                                Try searching with different keywords
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!q && (
                <div className="text-center py-12 max-w-2xl mx-auto">
                    <SearchIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Start searching</h3>
                    <p className="text-muted-foreground">
                        Search across blogs, projects, and photos to find what you're looking for
                    </p>
                </div>
            )}
        </div>
    );
}

Search.getLayout = function getLayout(page) {
    return (
        <Layout
            title="Search"
            description="Search blogs, projects, and photos"
        >
            {page}
        </Layout>
    );
};
