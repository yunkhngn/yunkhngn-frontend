import { useState, useEffect } from 'react';
import { DefaultFooter, DefaultNavbar, Metadata } from "@/components/template";
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';

export default function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`);
                if (!res.ok) throw new Error('Failed to fetch blogs');
                const data = await res.json();
                // Filter only published blogs
                const publishedBlogs = data.filter(blog => blog.status === 'PUBLISHED');
                setBlogs(publishedBlogs);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
    const paginatedBlogs = filteredBlogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    return (
        <div className="flex flex-col min-h-screen font-sans bg-background text-foreground">
            <Metadata
                title="Blog"
                description="Sharing my thoughts and experiences on web development, technology, and life."
            />
            <DefaultNavbar />

            <main className="flex-1 container mx-auto px-4 py-12 md:py-20 max-w-7xl">
                <div className="flex flex-col items-center text-center mb-12 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Blog</h1>
                    <p className="text-muted-foreground max-w-2xl text-lg">
                        Sharing my thoughts, tutorials, and experiences on web development and technology.
                    </p>

                    <div className="relative w-full max-w-md mt-6">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search articles..."
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
                        {filteredBlogs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {paginatedBlogs.map((blog) => (
                                    <Link
                                        href={`/blog/${blog.slug || blog.id}`}
                                        key={blog.id}
                                        className="group flex flex-col bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full"
                                    >
                                        <div className="aspect-video relative bg-muted overflow-hidden">
                                            {blog.thumbnail ? (
                                                <Image
                                                    src={blog.thumbnail}
                                                    alt={blog.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary/50">
                                                    No Thumbnail
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 p-6 flex flex-col">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                                            </div>

                                            <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                                {blog.title}
                                            </h2>

                                            <div className="flex flex-wrap gap-2 mt-auto pt-4">
                                                {blog.tags && blog.tags.split(',').slice(0, 3).map((tag, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs font-normal">
                                                        {tag.trim()}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-muted-foreground">
                                No articles found matching your search.
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
