import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Calendar, Clock, ChevronLeft, Tag, Facebook, Twitter, Linkedin, Link as LinkIcon, UploadCloud, Loader2, Edit, Eye, Maximize, Minimize, Link2 } from 'lucide-react';
import Image from 'next/image';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import TipTapViewer from '@/components/ui/TipTapViewer';
import CommentSection from '@/components/blog/CommentSection';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useFocusMode } from '@/contexts/FocusModeContext';
import Layout from '@/components/template/Default/Layout';
import { extractTextFromTipTap, stripHtml } from '@/lib/utils';
import JsonLd from '@/components/seo/JsonLd';
import { Metadata } from '@/components/template';

export async function getServerSideProps(context) {
    const { slug } = context.params;

    try {
        const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${apiUrl}/blogs/${slug}`);

        if (!res.ok) {
            return { notFound: true };
        }

        const foundBlog = await res.json();

        if (!foundBlog) {
            return { notFound: true };
        }

        // Generate description from content if missing
        let description = foundBlog.description;
        let excerpt = foundBlog.description;

        if (!description) {
            let cleanContent = '';
            if (foundBlog.contentJSON) {
                cleanContent = extractTextFromTipTap(foundBlog.contentJSON);
            } else if (foundBlog.content) {
                cleanContent = stripHtml(foundBlog.content);
            }

            if (cleanContent) {
                // For UI: longer 300 chars
                excerpt = cleanContent.length > 300
                    ? cleanContent.substring(0, 297) + '...'
                    : cleanContent;

                // For SEO: standard 160 chars
                description = cleanContent.length > 160
                    ? cleanContent.substring(0, 157) + '...'
                    : cleanContent;
            }
        }

        return {
            props: {
                blogData: {
                    ...foundBlog,
                    description: excerpt || `Read ${foundBlog.title} on Yunkhngn`, // Use longer excerpt for UI default
                    seoDescription: foundBlog.seoDescription || description // Use shorter description for SEO fallback
                },
            },
        };
    } catch (error) {
        console.error(error);
        return {
            notFound: true,
        };
    }
}

export default function BlogDetail({ blogData }) {
    const router = useRouter();
    const { user } = useAuth();
    const { isFocusMode, toggleFocusMode } = useFocusMode();
    const [blog, setBlog] = useState(blogData);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [publishing, setPublishing] = useState(false);
    const [creatingLink, setCreatingLink] = useState(false);

    const handleCreateShortlink = async () => {
        setCreatingLink(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shortlinks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    targetUrl: `https://yunkhngn.dev/blog/${blog.slug}`,
                    title: blog.title,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                const shortUrl = `https://yunkhngn.dev/s/${data.code}`;
                navigator.clipboard.writeText(shortUrl);
                toast.success(`Shortlink created & copied: ${shortUrl}`);
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to create shortlink');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to create shortlink');
        } finally {
            setCreatingLink(false);
        }
    };

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

    // Increment view count
    useEffect(() => {
        const incrementView = async () => {
            try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${blog.slug}/view`, {
                    method: 'POST',
                });
            } catch (error) {
                console.error('Failed to increment view:', error);
            }
        };
        incrementView();
    }, [blog.slug]);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

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

    const jsonLdData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blog.seoTitle || blog.title,
        description: blog.seoDescription || blog.description,
        image: (blog.seoImage || blog.thumbnail) ? [blog.seoImage || blog.thumbnail] : [],
        datePublished: blog.createdAt,
        dateModified: blog.updatedAt || blog.createdAt,
        author: {
            '@type': 'Person',
            name: 'Khoa Nguyễn',
            url: 'https://yunkhngn.dev'
        }
    };

    return (
        <div className="bg-background text-foreground">
            <JsonLd data={jsonLdData} />
            <Metadata
                title={blog.seoTitle || blog.title}
                description={blog.seoDescription || blog.description}
                image={blog.seoImage || blog.thumbnail}
                url={`/blog/${blog.slug}`}
                type="article"
                publishedTime={blog.createdAt}
                modifiedTime={blog.updatedAt}
                tags={blog.tags}
            />
            <div className="fixed top-0 left-0 h-full w-1 z-[9999] bg-transparent">
                <div
                    className="w-full bg-sky-600 transition-all duration-200 ease-out"
                    style={{ height: `${scrollProgress * 100}%` }}
                />
            </div>

            <div className="relative">
                {/* Full Width Banner */}
                {blog.thumbnail && (
                    <div className="w-full h-64 md:h-96 relative bg-muted overflow-hidden">
                        <Image
                            src={blog.thumbnail}
                            alt={blog.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                <div className="container mx-auto px-4 py-12 md:py-20 relative overflow-x-hidden">
                    {/* Back Button */}
                    {!isFocusMode && (
                        <div className="absolute top-0 left-4 md:left-8 mt-10">
                            <Link href="/blog">
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Admin Controls */}
                    {!isFocusMode && user && user.role === 'ADMIN' && (
                        <div className="absolute top-0 right-4 md:right-8 mt-10 flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleCreateShortlink} disabled={creatingLink}>
                                {creatingLink ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                                Shortlink
                            </Button>
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
                        {!isFocusMode && (
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
                        )}

                        {/* Main Content */}
                        <div className="flex-1 max-w-5xl mx-auto">
                            <header className="text-center mb-16 pt-4">
                                <div className="text-sm text-muted-foreground uppercase tracking-widest mb-6">
                                    {format(new Date(blog.createdAt), 'MMMM d, yyyy')}
                                    <span className="mx-2">·</span>
                                    <span className="normal-case tracking-normal">{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight text-foreground" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    {blog.title}
                                </h1>



                                {blog.tags && (
                                    <div className="flex flex-wrap gap-2 mb-8 justify-center">
                                        {blog.tags.split(',').map((tag, i) => (
                                            <Badge key={i} variant="secondary" className="rounded-full px-4 py-1">
                                                {tag.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-center gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                                            <Image src="https://github.com/yunkhngn.png" alt="Author" fill className="object-cover" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium text-sm">Khoa Nguyễn</div>
                                            <div className="text-xs text-muted-foreground">Author & Developer</div>
                                        </div>
                                    </div>
                                    <div className="h-6 w-px bg-border"></div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Eye className="h-4 w-4" />
                                        <span className="text-sm">{blog.views || 0} views</span>
                                    </div>
                                </div>
                            </header>

                            <article
                                className="prose prose-xl md:prose-xl dark:prose-invert max-w-none prose-headings:font-serif prose-p:leading-relaxed"
                                style={{
                                    fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", serif',
                                    fontSize: '1.2rem',
                                    lineHeight: '2.5rem'
                                }}
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

                            {/* Comment Section */}
                            {!isFocusMode && (
                                <div className="mt-16">
                                    <CommentSection blogId={blog.id} />
                                </div>
                            )}

                            {/* Suggested Posts */}
                            {!isFocusMode && blog.relatedPosts && blog.relatedPosts.length > 0 && (
                                <div className="mt-20 border-t border-border/40 pt-12">
                                    <h3 className="text-2xl font-bold mb-8 font-serif">Suggested Posts</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {blog.relatedPosts.map((post) => {
                                            // Calculate excerpt for related post
                                            let excerpt = post.description;
                                            if (!excerpt) {
                                                let cleanContent = '';
                                                if (post.contentJSON) {
                                                    cleanContent = extractTextFromTipTap(post.contentJSON);
                                                } else if (post.content) {
                                                    cleanContent = stripHtml(post.content);
                                                }
                                                if (cleanContent) {
                                                    excerpt = cleanContent.length > 120
                                                        ? cleanContent.substring(0, 117) + '...'
                                                        : cleanContent;
                                                }
                                            }

                                            return (
                                                <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                                                    <div className="relative aspect-[16/9] mb-4 overflow-hidden rounded-lg bg-muted">
                                                        {post.thumbnail ? (
                                                            <Image
                                                                src={post.thumbnail}
                                                                alt={post.title}
                                                                fill
                                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary/30">
                                                                <span className="text-4xl font-serif opacity-20">Y</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
                                                            <span>{format(new Date(post.createdAt), 'MMM d, yyyy')}</span>
                                                            {post.tags && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>{post.tags.split(',')[0]}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <h4 className="text-xl font-bold font-serif group-hover:text-sky-600 transition-colors">
                                                            {post.title}
                                                        </h4>
                                                        {excerpt && (
                                                            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                                                                {excerpt}
                                                            </p>
                                                        )}
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
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
