import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Metadata } from "@/components/template";
import { Calendar, Clock, ChevronLeft, Tag, Facebook, Twitter, Linkedin, Link as LinkIcon, UploadCloud, Loader2, Edit } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import TipTapViewer from '@/components/ui/TipTapViewer';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/template/Default/Layout';

export default function BlogDetail() {
    const router = useRouter();
    const { slug } = router.query;
    const { user } = useAuth();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [publishing, setPublishing] = useState(false);

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

    const shareUrl = `https://yunkhngn.dev/blog/${slug}`;

    const handleShare = (platform) => {
        let url = '';
        switch (platform) {
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                break;
            case 'twitter':
                url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(blog.title)}`;
                break;
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
                break;
        }
        if (url) window.open(url, '_blank', 'width=600,height=400');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
    };

    const handlePublish = async () => {
        if (!confirm('Are you sure you want to publish this blog?')) return;
        setPublishing(true);
        try {
            const token = await user.getIdToken();
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${blog.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'PUBLISHED' })
            });
            toast.success('Blog published successfully');
            setBlog(prev => ({ ...prev, status: 'PUBLISHED' }));
        } catch (error) {
            console.error(error);
            toast.error('Failed to publish blog');
        } finally {
            setPublishing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 min-h-[50vh]">
                <h1 className="text-2xl font-bold">Blog not found</h1>
                <Link href="/blog">
                    <Button>Back to Blog</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-background text-foreground">
            <div className="fixed top-0 left-0 w-full h-1 z-[9999] bg-transparent">
                <div
                    className="h-full bg-blue-500 shadow-[0_0_15px_#3b82f6] transition-all duration-200 ease-out"
                    style={{ width: `${scrollProgress * 100}%` }}
                />
            </div>
            <Metadata
                title={blog.title}
                description={blog.description || `Read ${blog.title} on Yunkhngn`}
                image={blog.thumbnail}
            />

            <div className="relative">
                {/* Full Width Banner */}
                {blog.thumbnail && (
                    <div className="w-full h-64 md:h-100 relative bg-muted">
                        <Image
                            src={blog.thumbnail}
                            alt={blog.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                <div className="container mx-auto px-4 py-12 md:py-20 relative">
                    {/* Back Button */}
                    <div className="absolute top-0 left-4 md:left-8 mt-10">
                        <Link href="/blog">
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                <ChevronLeft className="mr-2 h-4 w-4" /> Back
                            </Button>
                        </Link>
                    </div>

                    {/* Admin Controls */}
                    {user && user.role === 'ADMIN' && (
                        <div className="absolute top-0 right-4 md:right-8 mt-10 flex gap-2">
                            <Link href={`/admin/blog/${blog.slug}/edit`}>
                                <Button variant="outline" size="sm">
                                    <Edit className="mr-2 h-4 w-4" /> Edit Blog
                                </Button>
                            </Link>
                            {blog.status === 'DRAFT' && (
                                <Button size="sm" onClick={handlePublish} disabled={publishing}>
                                    {publishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                    Publish
                                </Button>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto pt-12">
                        {/* Social Sidebar (Desktop) */}
                        <aside className="hidden lg:flex flex-col gap-4 sticky top-32 h-fit w-12 items-center pt-8">
                            <div className="text-xs font-medium text-muted-foreground mb-2" style={{ writingMode: 'vertical-rl' }}>SHARE</div>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => handleShare('facebook')}>
                                <Facebook className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => handleShare('twitter')}>
                                <Twitter className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => handleShare('linkedin')}>
                                <Linkedin className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => handleCopyLink()}>
                                <LinkIcon className="h-4 w-4" />
                            </Button>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1 max-w-3xl mx-auto">
                            <header className="text-center mb-16 pt-4">
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

                                {blog.tags && (
                                    <div className="flex flex-wrap gap-2 mb-8 justify-center">
                                        {blog.tags.split(',').map((tag, i) => (
                                            <Badge key={i} variant="secondary" className="rounded-full px-4 py-1">
                                                {tag.trim()}
                                            </Badge>
                                        ))}
                                    </div>
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

                            <article
                                className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-p:leading-relaxed prose-img:rounded-xl"
                                style={{ fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", serif', fontSize: '1.2rem' }}
                            >
                                <TipTapViewer content={blog.contentJSON || blog.content} />
                            </article>

                            {/* Author Credit & Tags */}
                            <div className="mt-16 pt-8 border-t border-border/40">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-muted border-2 border-background shadow-sm">
                                            <Image src="https://github.com/yunkhngn.png" alt="Author" fill className="object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-serif text-lg font-bold">Khoa Nguyễn</div>
                                            <div className="text-sm text-muted-foreground">Author & Developer</div>
                                        </div>
                                    </div>

                                    {blog.tags && (
                                        <div className="flex flex-wrap gap-2">
                                            {blog.tags.split(',').map((tag, i) => (
                                                <Badge key={i} variant="outline" className="rounded-full px-4 py-1 hover:bg-secondary/50 transition-colors">
                                                    {tag.trim()}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

BlogDetail.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    );
};
