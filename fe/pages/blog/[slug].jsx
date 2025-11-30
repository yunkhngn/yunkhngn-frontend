import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DefaultFooter, DefaultNavbar, Metadata } from "@/components/template";
import { Calendar, Clock, ChevronLeft, Tag, Facebook, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react';
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
    const [scrollProgress, setScrollProgress] = useState(0);

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

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = `${totalScroll / windowHeight}`;
            setScrollProgress(Number(scroll));
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
            <div className="fixed top-0 left-0 w-full h-1.5 z-[100] bg-transparent">
                <div
                    className="h-full bg-primary transition-all duration-100 ease-out"
                    style={{ width: `${scrollProgress * 100}%` }}
                />
            </div>
            <Metadata
                title={blog.title}
                description={blog.description || `Read ${blog.title} on Yunkhngn`}
                image={blog.thumbnail}
            />
            <DefaultNavbar />

            <main className="flex-1 container mx-auto px-4 py-12 md:py-20 relative">
                {/* Back Button */}
                <div className="absolute top-8 left-4 md:left-8">
                    <Link href="/blog">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
                    {/* Social Sidebar (Desktop) */}
                    <aside className="hidden lg:flex flex-col gap-4 sticky top-32 h-fit w-12 items-center pt-8">
                        <div className="text-xs font-medium text-muted-foreground mb-2" style={{ writingMode: 'vertical-rl' }}>SHARE</div>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <Facebook className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <Twitter className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <Linkedin className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                            <LinkIcon className="h-4 w-4" />
                        </Button>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 max-w-3xl mx-auto">
                        <header className="text-center mb-16 pt-12">
                            <div className="text-sm text-muted-foreground uppercase tracking-widest mb-6">
                                {format(new Date(blog.createdAt), 'MMMM d, yyyy')}
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight text-foreground" style={{ fontFamily: 'var(--font-playfair)' }}>
                                {blog.title}
                            </h1>

                            {blog.description && (
                                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                                    {blog.description}
                                </p>
                            )}

                            <div className="flex items-center justify-center gap-4">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                                    <Image src="https://github.com/yunkhngn.png" alt="Author" fill className="object-cover" />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-sm">Khoa Nguyễn</div>
                                    <div className="text-xs text-muted-foreground">Author & Developer</div>
                                </div>
                            </div>
                        </header>

                        {blog.thumbnail && (
                            <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-12 shadow-sm bg-muted">
                                <Image
                                    src={blog.thumbnail}
                                    alt={blog.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        )}

                        <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-p:leading-relaxed prose-img:rounded-xl">
                            <TipTapViewer content={blog.contentJSON || blog.content} />
                        </article>

                        {/* Tags & Footer */}
                        <div className="mt-16 pt-8 border-t">
                            {blog.tags && (
                                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                                    {blog.tags.split(',').map((tag, i) => (
                                        <Badge key={i} variant="secondary" className="rounded-full px-4 py-1">
                                            {tag.trim()}
                                        </Badge>
                                    ))}
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
