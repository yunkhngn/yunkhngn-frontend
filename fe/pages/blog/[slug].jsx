import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DefaultFooter, DefaultNavbar, Metadata } from "@/components/template";
import { Calendar, Clock, ChevronLeft, Tag } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import TipTapViewer from '@/components/ui/TipTapViewer';

export default function BlogDetail() {
    const router = useRouter();
    const { slug } = router.query;
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        const fetchBlog = async () => {
            try {
                // Try to fetch all blogs and find by slug or id
                // Ideally backend should support /blogs/slug/:slug
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`);
                if (!res.ok) throw new Error('Failed to fetch blogs');
                const data = await res.json();

                const foundBlog = data.find(b => b.slug === slug || b.id === slug);

                if (foundBlog) {
                    setBlog(foundBlog);
                } else {
                    // Handle 404
                    console.error('Blog not found');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [slug]);

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

    if (!blog) {
        return (
            <div className="flex flex-col min-h-screen font-sans">
                <DefaultNavbar />
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <h1 className="text-2xl font-bold">Blog not found</h1>
                    <Link href="/blog">
                        <Button>Back to Blog</Button>
                    </Link>
                </div>
                <DefaultFooter />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen font-sans bg-background text-foreground">
            <Metadata
                title={blog.title}
                description={blog.description || `Read ${blog.title} on Yunkhngn`}
                image={blog.thumbnail}
            />
            <DefaultNavbar />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="relative w-full h-[40vh] md:h-[50vh] bg-muted">
                    {blog.thumbnail ? (
                        <Image
                            src={blog.thumbnail}
                            alt={blog.title}
                            fill
                            className="object-cover brightness-50"
                            priority
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                    )}

                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 container mx-auto max-w-4xl">
                        <Link href="/blog" className="mb-6 inline-block">
                            <Button variant="secondary" size="sm" className="gap-2">
                                <ChevronLeft className="h-4 w-4" /> Back to Blog
                            </Button>
                        </Link>

                        <div className="space-y-4 text-white">
                            <div className="flex flex-wrap gap-2">
                                {blog.tags && blog.tags.split(',').map((tag, i) => (
                                    <Badge key={i} className="bg-primary/80 hover:bg-primary border-none text-white">
                                        {tag.trim()}
                                    </Badge>
                                ))}
                            </div>

                            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-white">
                                {blog.title}
                            </h1>

                            <div className="flex items-center gap-4 text-sm md:text-base text-white/80">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(blog.createdAt), 'MMMM d, yyyy')}
                                </div>
                                {/* Add read time if available */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <article className="container mx-auto px-4 py-12 max-w-3xl">
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <TipTapViewer content={blog.contentJSON || blog.content} />
                    </div>

                    <div className="mt-12 pt-8 border-t flex justify-between items-center">
                        <Link href="/blog">
                            <Button variant="outline">
                                <ChevronLeft className="mr-2 h-4 w-4" /> Back to All Articles
                            </Button>
                        </Link>
                    </div>
                </article>
            </main>

            <DefaultFooter />
        </div>
    );
}
