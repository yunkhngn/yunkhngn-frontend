import AdminNavbar from './Navbar';
import { Metadata } from '@/components/template';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AdminLayout({ children, title = "Admin Dashboard" }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user || user.role !== 'ADMIN') {
                router.push('/');
            }
        }
    }, [user, loading, router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user || user.role !== 'ADMIN') return null;

    return (
        <div className="flex flex-col min-h-screen font-sans bg-background">
            <Metadata
                title={title}
                description="Admin Dashboard"
                robots="noindex, nofollow"
            />
            <AdminNavbar />
            <main className="flex-1 p-1 md:p-8 mt-4 mb-24">
                <div className="mx-2 md:container mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
