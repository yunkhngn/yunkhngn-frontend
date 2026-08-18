import JournalClient from './JournalClient';
import { createMetadata } from '@/lib/seo/createMetadata';

export const metadata = createMetadata({
  title: 'Journal',
  description: "Daily reflections, moods, and personal notes — Khoa Nguyễn's digital journal.",
  path: '/journal',
  ogType: 'journal',
});

export default function JournalPage() {
  return <JournalClient />;
}
