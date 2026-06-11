import { apiFetch } from '@/lib/api/server';

export async function fetchBlogListData() {
  const { data, error } = await apiFetch('/blogs');
  if (error) {
    console.warn(`fetchBlogListData: failed to fetch blog list: ${error}`);
    return [];
  }
  if (!Array.isArray(data)) return [];
  return data.filter((blog) => blog.status === 'PUBLISHED');
}
