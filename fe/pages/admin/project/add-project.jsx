import AdminLayout from "@/components/template/Admin/Layout";
import ProjectForm from '@/components/template/Admin/ProjectForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

export default function AddProject() {
    const { user } = useAuth();
    const router = useRouter();

    const handleSubmit = async (data) => {
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Failed to create project');

            toast.success('Project created successfully');
            router.push('/admin/project');
        } catch (error) {
            console.error(error);
            toast.error('Failed to create project');
        }
    };

    return (
        <AdminLayout title="Add Project">
            <div className="max-w-4xl mx-auto">
                <ProjectForm onSubmit={handleSubmit} />
            </div>
        </AdminLayout>
    );
}
