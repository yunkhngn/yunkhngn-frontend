'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminNavbar from '@/components/template/Admin/Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayoutClient({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalJson = Response.prototype.json;
      Response.prototype.json = async function () {
        const data = await originalJson.call(this);
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'statusCode' in data &&
          'timestamp' in data
        ) {
          const result = data.data;
          if (data.meta !== undefined && typeof result === 'object' && result !== null) {
            try {
              Object.defineProperty(result, 'meta', {
                value: data.meta,
                enumerable: true,
                writable: true,
                configurable: true
              });
            } catch (e) {
              // Ignore if property cannot be defined
            }
          }
          return result;
        }
        return data;
      };

      return () => {
        Response.prototype.json = originalJson;
      };
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="flex flex-col min-h-screen font-sans bg-background">
      <AdminNavbar />
      <main className="flex-1 p-1 md:p-8 mt-4 mb-24">
        <div className="mx-2 md:container md:mx-auto">{children}</div>
      </main>
    </div>
  );
}
