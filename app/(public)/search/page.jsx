import { Suspense } from 'react';
import SearchClient from './SearchClient';

export const metadata = {
  title: 'Search',
  description: 'Search blogs, projects, and photos',
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Loading…</div>}>
      <SearchClient />
    </Suspense>
  );
}
