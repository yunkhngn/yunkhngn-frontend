import AdminLayout from '@/components/template/Admin/Layout';
import BlogForm from '@/components/template/Admin/BlogForm';
import { useRouter } from 'next/router';
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
            router.push(`/admin/blog/${res.data.id}/edit`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to create blog');
        }
    };

    return (
        <AdminLayout>
            <div className="h-[calc(100vh-6rem)]">
                <BlogForm onSubmit={handleSubmit} />
            </div>
        </AdminLayout>
    );
}
