import { useState, useEffect } from 'react';
import AdminLayout from '@/components/template/Admin/Layout';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/router';
import { Pagination } from '@/components/ui/Pagination';

export default function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        fetchBlogs();
    }, [user]);

    const fetchBlogs = async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlogs(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation(); // Prevent card click
        if (!confirm('Are you sure you want to delete this blog?')) return;

        try {
            const token = await user.getIdToken();
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlogs(blogs.filter(b => b.id !== id));
            toast.success('Blog deleted');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete blog');
        }
    };

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
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Blogs</h1>
                        <p className="text-muted-foreground">Manage your blog posts</p>
                    </div>
                    <Link href="/admin/blog/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Blog
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search blogs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedBlogs.map((blog) => (
                                <div
                                    key={blog.id}
                                    className="group relative bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                                    onClick={() => router.push(`/admin/blog/${blog.id}`)}
                                >
                                    <div className="aspect-video relative bg-muted">
                                        {blog.thumbnail ? (
                                            <Image
                                                src={blog.thumbnail}
                                                alt={blog.title}
                                                fill
                                                className="object-cover transition-transform group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                                No Thumbnail
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <Badge variant={blog.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                                {blog.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                            {blog.title}
                                        </h3>
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Calendar className="mr-1 h-3 w-3" />
                                            {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {blog.tags && blog.tags.split(',').slice(0, 3).map((tag, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">
                                                    {tag.trim()}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="pt-2 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link href={`/admin/blog/${blog.id}/edit`} onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={(e) => handleDelete(blog.id, e)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
