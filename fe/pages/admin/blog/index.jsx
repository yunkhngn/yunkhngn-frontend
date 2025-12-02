import { useState, useEffect } from 'react';
import AdminLayout from '@/components/template/Admin/Layout';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Edit, Trash2, Eye, Calendar, UploadCloud, MessageSquare, LayoutList, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/router';
import { extractTextFromTipTap } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

export default function BlogList() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState('grid');
    const [itemsPerPage, setItemsPerPage] = useState(9);
    const { user } = useAuth();
    const router = useRouter();
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        const savedViewMode = localStorage.getItem('admin_blog_view_mode');
        const savedItemsPerPage = localStorage.getItem('admin_blog_items_per_page');
        if (savedViewMode) setViewMode(savedViewMode);
        if (savedItemsPerPage) setItemsPerPage(Number(savedItemsPerPage));
    }, []);

    useEffect(() => {
        fetchBlogs();
    }, [user]);

    // ...

    const fetchBlogs = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/blogs`);
            setBlogs(res.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch blogs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const token = await user.getIdToken();
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${deleteId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlogs(blogs.filter(b => b.id !== deleteId));
            toast.success('Blog deleted');
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete blog');
        } finally {
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        }
    };

    const handlePublish = async (blog, e) => {
        e.stopPropagation();
        try {
            const token = await user.getIdToken();
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${blog.id}`, { status: 'PUBLISHED' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlogs(blogs.map(b => b.id === blog.id ? { ...b, status: 'PUBLISHED' } : b));
            toast.success('Blog published');
        } catch (error) {
            console.error(error);
            toast.error('Failed to publish blog');
        }
    };

    const handleViewChange = (mode) => {
        setViewMode(mode);
        const newItemsPerPage = mode === 'grid' ? 9 : 15;
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
        localStorage.setItem('admin_blog_view_mode', mode);
        localStorage.setItem('admin_blog_items_per_page', newItemsPerPage);
    };

    const handleItemsPerPageChange = (value) => {
        const numValue = Number(value);
        setItemsPerPage(numValue);
        setCurrentPage(1);
        localStorage.setItem('admin_blog_items_per_page', numValue);
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

    // ...

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Blogs</h1>
                        <p className="text-muted-foreground">Manage your blog posts</p>
                    </div>
                    <Link href="/admin/blog/new">
                        <Button className="w-full md:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> New Blog
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:flex-1 md:max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search blogs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                            <SelectTrigger className="w-[70px] h-8">
                                <SelectValue placeholder={itemsPerPage} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="6">6</SelectItem>
                                <SelectItem value="9">9</SelectItem>
                                <SelectItem value="12">12</SelectItem>
                                <SelectItem value="15">15</SelectItem>
                                <SelectItem value="30">30</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center border rounded-md p-1 bg-muted/20">
                            <Button
                                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleViewChange('grid')}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleViewChange('list')}
                            >
                                <LayoutList className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading...</div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedBlogs.map((blog) => (
                                    <div
                                        key={blog.id}
                                        className="group relative bg-card border rounded-3xl overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col"
                                        onClick={() => router.push(`/admin/blog/${blog.slug}`)}
                                    >
                                        <div className="aspect-video relative bg-muted shrink-0">
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
                                        <div className="p-4 space-y-3 flex flex-col flex-1">
                                            <div>
                                                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                                    {blog.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{blog.slug}</p>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {extractTextFromTipTap(blog.contentJSON)}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center">
                                                    <Calendar className="mr-1 h-3 w-3" />
                                                    {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                                                </div>
                                                <div className="flex items-center">
                                                    <MessageSquare className="mr-1 h-3 w-3" />
                                                    {blog.comments?.length || 0}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-1 min-h-[1.5rem]">
                                                {blog.tags && blog.tags.split(',').slice(0, 3).map((tag, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        {tag.trim()}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <div className="pt-2 mt-auto flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {blog.status === 'DRAFT' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                                        onClick={(e) => handlePublish(blog, e)}
                                                        title="Publish"
                                                    >
                                                        <UploadCloud className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Link href={`/admin/blog/${blog.slug}/edit`} onClick={(e) => e.stopPropagation()}>
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
                        ) : (
                            <div className="border rounded-lg overflow-hidden overflow-x-auto">
                                <table className="w-full text-sm text-left min-w-[600px]">
                                    <thead className="bg-muted/50 text-muted-foreground border-b">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Title</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {paginatedBlogs.map((blog) => (
                                            <tr
                                                key={blog.id}
                                                className="hover:bg-muted/50 transition-colors cursor-pointer"
                                                onClick={() => router.push(`/admin/blog/${blog.slug}`)}
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative h-10 w-16 bg-muted rounded overflow-hidden shrink-0">
                                                            {blog.thumbnail && (
                                                                <Image
                                                                    src={blog.thumbnail}
                                                                    alt={blog.title}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium line-clamp-1">{blog.title}</div>
                                                            <div className="text-xs text-muted-foreground line-clamp-1">{blog.slug}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={blog.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-xs">
                                                        {blog.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                    {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {blog.status === 'DRAFT' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                                                onClick={(e) => handlePublish(blog, e)}
                                                                title="Publish"
                                                            >
                                                                <UploadCloud className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Link href={`/admin/blog/${blog.slug}/edit`} onClick={(e) => e.stopPropagation()}>
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
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="Delete Blog"
                    description="Are you sure you want to delete this blog? This action cannot be undone."
                />
            </div>
        </AdminLayout>
    );
}
