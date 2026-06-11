import BlogListClient from './BlogListClient';
import { fetchBlogListData } from '@/lib/fetchBlogListData';

export const revalidate = 120;

export const metadata = {
  title: 'Blog',
  description: 'Thoughts on web development, design, and the creative process — by Khoa Nguyễn.',
  alternates: { canonical: 'https://yunkhngn.dev/blog' },
  openGraph: {
    title: 'Blog — Khoa Nguyễn',
    description: 'Thoughts on web development, design, and the creative process — by Khoa Nguyễn.',
    url: 'https://yunkhngn.dev/blog',
  },
};

export default async function BlogListPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const tagParam = resolvedSearchParams?.tag;
  const initialTag = Array.isArray(tagParam) ? tagParam[0] || null : tagParam || null;
  const blogs = await fetchBlogListData();

  return <BlogListClient blogs={blogs} initialTag={initialTag} />;
}
