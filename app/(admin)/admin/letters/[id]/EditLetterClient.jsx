'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { readNestJson } from '@/lib/api/readJson';
import { toast } from 'sonner';
import LetterForm from '@/components/admin/LetterForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EditLetterClient() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const { user } = useAuth();
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLetter = useCallback(async () => {
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/letters/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Not found');
      setLetter(await readNestJson(res));
    } catch (e) {
      console.error(e);
      toast.error('Failed to load letter');
      router.push('/admin/letters');
    } finally {
      setLoading(false);
    }
  }, [id, user, router]);

  useEffect(() => {
    if (id && user) fetchLetter();
  }, [id, user, fetchLetter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!letter) return null;

  return <LetterForm letter={letter} />;
}
