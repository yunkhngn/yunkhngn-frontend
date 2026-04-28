import { Suspense } from 'react';
import BlogListClient from './BlogListClient';

export const metadata = {
  title: 'Blog',
  description: 'Blog posts',
};

export default function BlogListPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Loading…</div>}>
      <BlogListClient />
    </Suspense>
  );
}
