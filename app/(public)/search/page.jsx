import { Suspense } from 'react';
import SearchClient from './SearchClient';
import { createMetadata } from '@/lib/seo/createMetadata';

export const metadata = createMetadata({
  title: 'Search',
  description: 'Search blogs, projects, photos, and more on yunkhngn.dev.',
  path: '/search',
  ogType: 'page',
});

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Loading…</div>}>
      <SearchClient />
    </Suspense>
  );
}
