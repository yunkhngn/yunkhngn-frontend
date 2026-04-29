'use client';

import BlogForm from '@/components/template/Admin/BlogForm';
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'sonner';

export default function NewBlog() {
    const router = useRouter();
    const { user } = useAuth();

    const handleSubmit = async (data) => {
        try {
            const token = await user.getIdToken();
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Blog created successfully');
            router.push(`/admin/blog/${res.data.data.slug}/edit`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to create blog');
        }
    };

    return (
        <>
            <div className="h-[calc(100vh-6rem)]">
                <BlogForm onSubmit={handleSubmit} />
            </div>
        </>
    );
}
