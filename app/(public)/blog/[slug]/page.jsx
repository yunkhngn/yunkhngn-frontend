import { notFound } from 'next/navigation';
import { fetchBlogDetailData } from '@/lib/fetchBlogDetailData';
import BlogDetailClient from './BlogDetailClient';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await fetchBlogDetailData(slug);
  if (!blog) {
    return { title: 'Not found' };
  }
  const desc = blog.seoDescription || blog.description || '';
  return {
    title: blog.title,
    description: desc,
    openGraph: {
      title: blog.title,
      description: desc,
      type: 'article',
      images: blog.thumbnail ? [blog.thumbnail] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const blogData = await fetchBlogDetailData(slug);
  if (!blogData) notFound();
  return <BlogDetailClient blogData={blogData} />;
}
