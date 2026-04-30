import { notFound } from 'next/navigation';
import { fetchBlogDetailData } from '@/lib/fetchBlogDetailData';
import BlogDetailClient from './BlogDetailClient';
import JsonLd from '@/lib/seo/JsonLd';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonLd';

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
    alternates: { canonical: `https://yunkhngn.dev/blog/${slug}` },
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

  const jsonLd = [
    articleJsonLd({
      title: blogData.title,
      description: blogData.seoDescription || blogData.description || '',
      slug,
      datePublished: blogData.createdAt,
      dateModified: blogData.updatedAt,
      image: blogData.thumbnail,
    }),
    breadcrumbJsonLd([
      { name: 'Home', url: 'https://yunkhngn.dev' },
      { name: 'Blog', url: 'https://yunkhngn.dev/blog' },
      { name: blogData.title, url: `https://yunkhngn.dev/blog/${slug}` },
    ]),
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <BlogDetailClient blogData={blogData} />
    </>
  );
}
