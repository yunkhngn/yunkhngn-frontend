import { Suspense } from 'react';
import SearchClient from './SearchClient';

export const metadata = {
  title: 'Search',
  description: 'Search blogs, projects, photos, and more on yunkhngn.dev.',
  alternates: { canonical: 'https://yunkhngn.dev/search' },
  openGraph: {
    title: 'Search — Khoa Nguyễn',
    description: 'Search blogs, projects, photos, and more on yunkhngn.dev.',
    url: 'https://yunkhngn.dev/search',
  },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Loading…</div>}>
      <SearchClient />
    </Suspense>
  );
}
