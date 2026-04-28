import { notFound } from 'next/navigation';
import { fetchLetterResolve } from '@/lib/fetchLetterResolve';
import LetterClient from './LetterClient';

export const metadata = {
  robots: { index: false, follow: false },
  title: 'Thư tay',
  description: 'Có một bức thư tay đang đợi bạn mở ra xem...',
};

export default async function LetterPage({ params }) {
  const { code } = await params;
  const letter = await fetchLetterResolve(code);
  if (!letter) notFound();
  return <LetterClient letter={letter} code={code} />;
}
