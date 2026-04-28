import { apiFetch } from '@/lib/api/server';

export async function fetchLetterResolve(code) {
  const { data, error } = await apiFetch(`/letters/resolve/${code}`);
  if (error || !data) return null;
  return data;
}
