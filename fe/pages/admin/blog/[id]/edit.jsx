import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/template/Admin/Layout';
import BlogForm from '@/components/template/Admin/BlogForm';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

export default function EditBlog() {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id && user) {
            fetchBlog();
        }
    }, [id, user, fetchBlog]);

    const fetchBlog = useCallback(async () => {
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
    }, [id, user, router]);

    const handleSubmit = async (data) => {
        try {
            const token = await user.getIdToken();
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${blog.id}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Blog updated successfully');
            router.push('/admin/blog');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update blog');
        }
    };

    if (loading) return <AdminLayout><div>Loading...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="h-[calc(100vh-6rem)]">
                <BlogForm initialData={blog} onSubmit={handleSubmit} isEditing />
            </div>
        </AdminLayout>
    );
}
