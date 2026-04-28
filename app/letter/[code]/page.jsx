import { notFound } from 'next/navigation';
import { fetchLetterResolve } from '@/lib/fetchLetterResolve';
import LetterClient from './LetterClient';

export async function generateMetadata({ params }) {
  const { code } = await params;

  return {
    robots: { index: false, follow: false },
    title: 'Bạn có một bức thư tay — yunkhngn.dev',
    description: 'Một bức thư tay đặc biệt đang đợi bạn mở ra xem. Hãy nhấn vào để đọc nhé.',
    openGraph: {
      title: 'Bạn có một bức thư tay',
      description: 'Một bức thư tay đặc biệt đang đợi bạn mở ra xem.',
      url: `https://yunkhngn.dev/letter/${code}`,
      siteName: 'yunkhngn.dev',
      images: [
        {
          url: '/image/image.jpg',
          width: 1200,
          height: 630,
          alt: 'Bức thư tay đặc biệt',
        },
      ],
      type: 'website',
    },
  };
}

export default async function LetterPage({ params }) {
  const { code } = await params;

  let letter;
  try {
    letter = await fetchLetterResolve(code);
  } catch (err) {
    console.error('LetterPage: failed to fetch letter', code, err);
    notFound();
  }

  if (!letter) notFound();
  return <LetterClient letter={letter} code={code} />;
}
