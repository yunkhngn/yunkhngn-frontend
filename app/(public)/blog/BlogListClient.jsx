'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, ArrowUpRight, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { m as motion } from 'framer-motion';
import PageHero from '@/components/shared/PageHero';
import RevealHeading from '@/components/home/RevealHeading';
import TiltCard from '@/components/home/TiltCard';

const cardContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const cardItemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function BlogList({ blogs = [], initialTag = null }) {
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const [selectedTag, setSelectedTag] = useState(initialTag);

    const allTags = [...new Set(blogs.flatMap(blog => blog.tags ? blog.tags.split(',').map(t => t.trim()) : []))];

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(search.toLowerCase());
        const blogTags = blog.tags ? blog.tags.split(',').map(t => t.trim()) : [];
        const matchesTag = selectedTag ? blogTags.includes(selectedTag) : true;
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
            <PageHero
                eyebrow="Curious Blog"
                title="My Writings & Ideas"
                description="The latest writings, news, technologies, and resources from me."
                className="mb-20"
            >
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
            </PageHero>

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

            {filteredBlogs.length > 0 ? (
                        <div className="space-y-16">
                            {/* Featured & Recent Section - Only if not filtering */}
                            {!isFiltering && recentBlogs.length > 0 && (
                                <>
                                    <RevealHeading index={1}>
                                        <h2 className="text-3xl font-bold mb-8">
                                            Recent Posts
                                        </h2>
                                    </RevealHeading>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                                        {/* Featured Post (Left) */}
                                        {recentBlogs[0] && (
                                            <TiltCard>
                                                <Link href={`/blog/${recentBlogs[0].slug || recentBlogs[0].id}`} className="group flex flex-col gap-4">
                                                    <div className="aspect-video w-full relative overflow-hidden rounded-3xl bg-muted">
                                                        {recentBlogs[0].thumbnail ? (
                                                            <Image
                                                                src={recentBlogs[0].thumbnail}
                                                                alt={recentBlogs[0].title}
                                                                fill
                                                                sizes="(max-width: 1024px) 100vw, 50vw"
                                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-muted-foreground">No Thumbnail</div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="text-sm font-semibold text-primary flex items-center gap-2">
                                                            <span>Khoa Nguyễn</span>
                                                            <span>•</span>
                                                            <span>{format(new Date(recentBlogs[0].createdAt), 'd MMM yyyy')}</span>
                                                        </div>
                                                        <div className="flex justify-between items-start gap-4">
                                                            <h2 className="text-2xl font-bold group-hover:text-primary transition-colors leading-tight">
                                                                {recentBlogs[0].title}
                                                            </h2>
                                                            <ArrowUpRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                                                        </div>
                                                        <p className="text-muted-foreground line-clamp-3 text-base">
                                                            {getExcerpt(recentBlogs[0])}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 pt-2">
                                                            {recentBlogs[0].tags && recentBlogs[0].tags.split(',').map((tag, i) => (
                                                                <Badge key={i} variant="outline" className="rounded-md font-normal">
                                                                    {tag.trim()}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </Link>
                                            </TiltCard>
                                        )}

                                        {/* Sidebar Posts (Right) */}
                                        <div className="flex flex-col gap-8">
                                            {recentBlogs.slice(1, 3).map((blog) => (
                                                <Link href={`/blog/${blog.slug || blog.id}`} key={blog.id} className="group flex flex-col md:flex-row gap-6 items-start">
                                                    <div className="aspect-video md:aspect-[4/3] w-full md:w-64 relative overflow-hidden rounded-3xl bg-muted flex-shrink-0">
                                                        {blog.thumbnail ? (
                                                            <Image
                                                                src={blog.thumbnail}
                                                                alt={blog.title}
                                                                fill
                                                                sizes="(max-width: 768px) 100vw, 256px"
                                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-muted-foreground text-xs">No Thumbnail</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="text-xs font-semibold text-primary flex items-center gap-2">
                                                            <span>Khoa Nguyễn</span>
                                                            <span>•</span>
                                                            <span>{format(new Date(blog.createdAt), 'd MMM yyyy')}</span>
                                                        </div>
                                                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">
                                                            {blog.title}
                                                        </h3>
                                                        <p className="text-muted-foreground text-sm line-clamp-2">
                                                            {getExcerpt(blog)}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 pt-1">
                                                            {blog.tags && blog.tags.split(',').slice(0, 2).map((tag, i) => (
                                                                <Badge key={i} variant="outline" className="text-xs rounded-md font-normal">
                                                                    {tag.trim()}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* All Blog Posts Grid (Paginated) */}
                            {paginatedBlogs.length > 0 && (
                                <div>
                                    <RevealHeading index={isFiltering ? 1 : 2}>
                                        <h2 className="text-2xl font-bold mb-8">
                                            {isFiltering ? 'Search Results' : 'All blog posts'}
                                        </h2>
                                    </RevealHeading>
                                    <motion.div
                                        key={`${currentPage}-${selectedTag || 'all'}-${search}`}
                                        variants={cardContainerVariants}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12"
                                    >
                                        {paginatedBlogs.map((blog) => (
                                            <motion.div key={blog.id} variants={cardItemVariants}>
                                                <TiltCard>
                                                    <Link
                                                        href={`/blog/${blog.slug || blog.id}`}
                                                        className="group flex flex-col gap-4"
                                                    >
                                                        <div className="aspect-video relative bg-muted overflow-hidden rounded-3xl">
                                                            {blog.thumbnail ? (
                                                                <Image
                                                                    src={blog.thumbnail}
                                                                    alt={blog.title}
                                                                    fill
                                                                    sizes="(max-width: 768px) 100vw, 50vw"
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
                                                </TiltCard>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-muted-foreground">
                            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
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
        </div>
    );
}
