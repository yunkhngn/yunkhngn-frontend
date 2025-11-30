import AdminLayout from "@/components/template/Admin/Layout";
import ProjectForm from '@/components/template/Admin/ProjectForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function EditProject() {
    const { user } = useAuth();
    const router = useRouter();
    const { id } = router.query;
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchProject = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`);
                if (!res.ok) throw new Error('Failed to fetch project');
                const data = await res.json();

                // Parse JSON fields
                const parsedData = {
                    ...data,
                    techStack: typeof data.techStack === 'string' ? JSON.parse(data.techStack || '[]') : data.techStack,
                };

                setProject(parsedData);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch project details');
                router.push('/admin/project');
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id, router]);

    const handleSubmit = async (data) => {
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Failed to update project');

            toast.success('Project updated successfully');
            router.push('/admin/project');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update project');
        }
    };

    if (loading) return <AdminLayout title="Edit Project"><div className="text-center py-12">Loading...</div></AdminLayout>;
    if (!project) return <AdminLayout title="Edit Project"><div className="text-center py-12">Project not found</div></AdminLayout>;

    return (
        <AdminLayout title="Edit Project">
            <div className="max-w-4xl mx-auto">
                <ProjectForm initialData={project} onSubmit={handleSubmit} isEditing />
            </div>
        </AdminLayout>
    );
}
