import { notFound } from 'next/navigation';
import { fetchLetterResolve } from '@/lib/fetchLetterResolve';
import LetterClient from './LetterClient';

export async function generateMetadata({ params }) {
  const { code } = await params;

  const title = 'Bạn có một bức thư tay — yunkhngn.dev';
  const description = 'Một bức thư tay đặc biệt đang đợi bạn mở ra xem. Hãy nhấn vào để đọc nhé.';
  const imageUrl = 'https://yunkhngn.dev/image/image.jpg';

  return {
    robots: { index: false, follow: false },
    title,
    description,
    openGraph: {
      title: 'Bạn có một bức thư tay',
      description,
      url: `https://yunkhngn.dev/letter/${code}`,
      siteName: 'yunkhngn.dev',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'Bức thư tay đặc biệt',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Bạn có một bức thư tay',
      description,
      images: [imageUrl],
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
