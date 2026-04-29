'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Edit, ArrowLeft, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format, isValid } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import dynamic from 'next/dynamic';
const TipTapViewer = dynamic(() => import('@/components/ui/TipTapViewer'), { ssr: false });

export default function ViewBlog() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id;
    const { user } = useAuth();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBlog = useCallback(async () => {
        try {
            const token = await user.getIdToken();
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('DEBUG: Blog detail response data:', res.data);
            setBlog(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch blog details');
            router.push('/admin/blog');
        } finally {
            setLoading(false);
        }
    }, [id, user, router]);

    useEffect(() => {
        if (id && user) {
            fetchBlog();
        }
    }, [id, user, fetchBlog]);

    if (loading) return <><div>Loading...</div></>;
    if (!blog) return <><div>Blog not found</div></>;

    return (
        <>
            <div className="relative">
                {/* Full Width Banner */}
                {blog.thumbnail && (
                    <div className="w-full h-64 md:h-96 relative bg-muted">
                        <Image
                            src={blog.thumbnail}
                            alt={blog.title}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority
                        />
                    </div>
                )}

                <div className="container mx-auto px-4 py-12 md:py-20 relative">
                    {/* Back & Edit Buttons */}
                    <div className="absolute top-0 left-4 md:left-8 mt-10">
                        <Button variant="ghost" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                    </div>
                    <div className="absolute top-0 right-4 md:right-8 mt-10">
                        <Link href={`/admin/blog/${id}/edit`}>
                            <Button size="sm">
                                <Edit className="mr-2 h-4 w-4" /> Edit Blog
                            </Button>
                        </Link>
                    </div>

                    <div className="max-w-5xl mx-auto pt-12">
                        {/* Header Section */}
                        <header className="text-center mb-16 pt-4">
                            <div className="flex items-center justify-center gap-2 mb-6">
                                <Badge variant={blog.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                    {blog.status}
                                </Badge>
                                <div className="text-sm text-muted-foreground uppercase tracking-widest">
                                    {blog.createdAt && isValid(new Date(blog.createdAt)) ? format(new Date(blog.createdAt), 'MMMM d, yyyy') : 'No Date'}
                                </div>
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

                            <div className="flex items-center justify-center gap-4">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted">
                                    <Image src="https://github.com/yunkhngn.png" alt="Author" fill sizes="40px" className="object-cover" />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-sm">Khoa Nguyễn</div>
                                    <div className="text-xs text-muted-foreground">Author & Developer</div>
                                </div>
                            </div>
                        </header>

                        {/* Content */}
                        <article
                            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-p:leading-relaxed"
                            style={{ fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", serif', fontSize: '1.2rem' }}
                        >
                            <TipTapViewer content={blog.contentJSON} />
                        </article>

                        {/* Author Credit & Tags */}
                        <div className="mt-16 pt-8 border-t border-border/40">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-muted border-2 border-background shadow-sm">
                                        <Image src="https://github.com/yunkhngn.png" alt="Author" fill sizes="56px" className="object-cover" />
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
        </>
    );
}
