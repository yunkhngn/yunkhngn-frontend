'use client';

import { useState, useEffect, useCallback } from 'react';
import BlogForm from '@/components/template/Admin/BlogForm';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

export default function EditBlog() {
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

    if (loading) return <><div>Loading...</div></>;

    return (
        <>
            <div className="h-[calc(100vh-6rem)]">
                <BlogForm initialData={blog} onSubmit={handleSubmit} isEditing />
            </div>
        </>
    );
}
