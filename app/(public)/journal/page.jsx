import JournalClient from './JournalClient';

export const metadata = {
  title: 'Journal',
  description: 'Daily reflections, moods, and personal notes — Khoa Nguyễn's digital journal.',
  alternates: { canonical: 'https://yunkhngn.dev/journal' },
  openGraph: {
    title: 'Journal — Khoa Nguyễn',
    description: 'Daily reflections, moods, and personal notes — Khoa Nguyễn's digital journal.',
    url: 'https://yunkhngn.dev/journal',
  },
};

export default function JournalPage() {
  return <JournalClient />;
}
