import { useState, useEffect } from 'react';
import AdminLayout from '@/components/template/Admin/Layout';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Edit, ArrowLeft, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import TipTapViewer from '@/components/ui/TipTapViewer';

export default function ViewBlog() {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id && user) {
            fetchBlog();
        }
    }, [id, user]);

    const fetchBlog = async () => {
        try {
            const token = await user.getIdToken();
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlog(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch blog details');
            router.push('/admin/blog');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <AdminLayout><div>Loading...</div></AdminLayout>;
    if (!blog) return <AdminLayout><div>Blog not found</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="space-y-6 max-w-4xl mx-auto pb-10">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Link href={`/admin/blog/${id}/edit`}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" /> Edit Blog
                        </Button>
                    </Link>
                </div>

                <div className="space-y-4">
                    {blog.thumbnail && (
                        <div className="relative aspect-video rounded-xl overflow-hidden border">
                            <Image src={blog.thumbnail} alt={blog.title} fill className="object-cover" />
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant={blog.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                {blog.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                {format(new Date(blog.createdAt), 'MMMM d, yyyy')}
                            </span>
                        </div>
                        <h1 className="text-4xl font-bold">{blog.title}</h1>
                        <p className="text-muted-foreground">Slug: {blog.slug}</p>
                    </div>

                    {blog.tags && (
                        <div className="flex flex-wrap gap-2">
                            {blog.tags.split(',').map((tag, i) => (
                                <Badge key={i} variant="outline" className="flex items-center">
                                    <Tag className="mr-1 h-3 w-3" /> {tag.trim()}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="border-t pt-6">
                        <TipTapViewer content={blog.contentJSON} />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
