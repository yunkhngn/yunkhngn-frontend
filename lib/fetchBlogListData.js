import { apiFetch } from '@/lib/api/server';

export async function fetchBlogListData() {
  const { data, error } = await apiFetch('/blogs');
  if (error) throw new Error(`Failed to fetch blog list: ${error}`);
  if (!Array.isArray(data)) return [];
  return data.filter((blog) => blog.status === 'PUBLISHED');
}
