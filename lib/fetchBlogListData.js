import { apiFetch } from '@/lib/api/server';

export async function fetchBlogListData() {
  const { data } = await apiFetch('/blogs');
  if (!Array.isArray(data)) return [];
  return data.filter((blog) => blog.status === 'PUBLISHED');
}
