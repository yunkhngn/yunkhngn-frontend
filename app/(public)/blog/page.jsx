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

export default async function BlogListPage() {
  const blogs = await fetchBlogListData();

  return <BlogListClient blogs={blogs} />;
}
