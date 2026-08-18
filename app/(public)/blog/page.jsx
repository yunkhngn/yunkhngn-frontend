import BlogListClient from './BlogListClient';
import { fetchBlogListData } from '@/lib/fetchBlogListData';
import { createMetadata } from '@/lib/seo/createMetadata';

export const revalidate = 120;

export const metadata = createMetadata({
  title: 'Blog',
  description: 'Thoughts on web development, design, and the creative process — by Khoa Nguyễn.',
  path: '/blog',
  ogType: 'blog',
});

export default async function BlogListPage() {
  const blogs = await fetchBlogListData();

  return <BlogListClient blogs={blogs} />;
}
