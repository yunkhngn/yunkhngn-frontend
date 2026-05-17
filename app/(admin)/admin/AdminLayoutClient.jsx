'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from '@/components/template/Admin/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from "lucide-react";

export default function AdminLayoutClient({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Loading">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      <AdminNavbar />
      <main className="flex-1 p-1 md:p-8 mt-4 mb-4">
        <div className="mx-2 md:container md:mx-auto">{children}</div>
      </main>
    </div>
  );
}
