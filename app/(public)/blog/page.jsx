import { Suspense } from 'react';
import BlogListClient from './BlogListClient';

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

export default function BlogListPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Loading…</div>}>
      <BlogListClient />
    </Suspense>
  );
}
