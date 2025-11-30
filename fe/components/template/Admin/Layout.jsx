import AdminNavbar from './Navbar';
import { Metadata } from '@/components/template';

export default function AdminLayout({ children, title = "Admin Dashboard" }) {
    return (
        <div className="flex flex-col min-h-screen font-sans bg-background">
            <Metadata
                title={title}
                description="Admin Dashboard"
                robots="noindex, nofollow"
            />
            <AdminNavbar />
            <main className="flex-1 p-8">
                <div className="container mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
