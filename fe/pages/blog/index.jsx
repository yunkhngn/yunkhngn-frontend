import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Calendar, ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import Layout from '@/components/template/Default/Layout';

export default function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const [selectedTag, setSelectedTag] = useState(null);

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

    const allTags = [...new Set(blogs.flatMap(blog => blog.tags ? blog.tags.split(',').map(t => t.trim()) : []))];

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(search.toLowerCase());
        const matchesTag = selectedTag ? blog.tags && blog.tags.includes(selectedTag) : true;
        return matchesSearch && matchesTag;
    });

    const isFiltering = search.length > 0 || selectedTag !== null;
    const recentBlogs = !isFiltering ? filteredBlogs.slice(0, 3) : [];
    const blogsToPaginate = !isFiltering ? filteredBlogs.slice(3) : filteredBlogs;

    const totalPages = Math.ceil(blogsToPaginate.length / itemsPerPage);
    const paginatedBlogs = blogsToPaginate.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedTag]);

    const getExcerpt = (blog, length = 150) => {
        if (blog.description) return blog.description;

        let content = blog.contentJSON || blog.content || '';
        let text = '';

        try {
            const json = JSON.parse(content);
            if (json.content) {
                const extractText = (node) => {
                    if (node.text) return node.text;
                    if (node.content) return node.content.map(extractText).join(' ');
                    return '';
                };
                text = extractText(json);
            }
        } catch (e) {
            text = content.replace(/<[^>]*>?/gm, '');
        }

        return text.length > length ? text.substring(0, length) + '...' : text;
    };

    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-7xl">
            {/* Hero Section */}
            <div className="flex flex-col items-center text-center mb-20 space-y-6">
                <div className="space-y-4">
                    <div className="text-sm font-medium text-primary uppercase tracking-wider">Our Blog</div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-serif">
                        Stories & Ideas
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl">
                        The latest news, technologies, and resources from our team.
                    </p>
                </div>

                <div className="w-full max-w-md flex gap-2 mt-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                        <Input
                            placeholder="Search articles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-10"
                        />
                    </div>
                </div>
            </div>

            {/* Explore Topics */}
            {allTags.length > 0 && (
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
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    {paginatedBlogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                            {paginatedBlogs.map((blog) => (
                                <Link
                                    href={`/blog/${blog.slug || blog.id}`}
                                    key={blog.id}
                                    className="group flex flex-col gap-4"
                                >
                                    <div className="aspect-video relative bg-muted overflow-hidden rounded-2xl">
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

                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-xs font-semibold text-primary flex items-center gap-2">
                                                <span>Khoa Nguyễn</span>
                                                <span>•</span>
                                                <span>{format(new Date(blog.createdAt), 'd MMM yyyy')}</span>
                                            </div>
                                            <h2 className="text-2xl font-bold group-hover:text-primary transition-colors leading-tight">
                                                {blog.title}
                                            </h2>
                                        </div>
                                        <p className="text-muted-foreground line-clamp-2 text-base">
                                            {getExcerpt(blog)}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-auto">
                                            {blog.tags && blog.tags.split(',').map((tag, i) => (
                                                <Badge key={i} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none rounded-md font-medium">
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

                    <div className="mt-16">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

BlogList.getLayout = function getLayout(page) {
    return (
        <Layout
            title="Blog"
            description="Sharing my thoughts and experiences on web development, technology, and life."
        >
            {page}
        </Layout>
    );
};
