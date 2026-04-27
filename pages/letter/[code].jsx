import { useState, useCallback } from 'react';
import Head from 'next/head';
import EnvelopeAnimation from '@/components/letter/EnvelopeAnimation';
import WritingReveal from '@/components/letter/WritingReveal';
import PasswordGate from '@/components/letter/PasswordGate';

export async function getServerSideProps(context) {
  const { code } = context.params;
  try {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/letters/resolve/${code}`);
    if (!res.ok) return { notFound: true };
    const data = await res.json();
    return { props: { letter: data, code } };
  } catch {
    return { notFound: true };
  }
}

export default function LetterView({ letter, code }) {
  const [phase, setPhase] = useState(letter.hasPassword ? 'password' : 'envelope');
  const [pages, setPages] = useState(letter.pages || []);
  const [title, setTitle] = useState(letter.title || '');

  const handlePasswordVerified = useCallback((data) => {
    setPages(data.pages);
    if (data.title) setTitle(data.title);
    setPhase('envelope');
  }, []);

  const handleEnvelopeComplete = useCallback(() => setPhase('reading'), []);

  return (
    <>
      <Head>
        <title>{title ? `${title} — Thư tay` : 'Thư tay'}</title>
        <meta name="description" content="Có một bức thư tay đang đợi bạn mở ra xem..." />
        <meta name="robots" content="noindex, nofollow" />

        {/* Open Graph / Facebook / Zalo */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://yunkhngn.dev/letter/${code}`} />
        <meta property="og:title" content={title ? `${title} — Thư tay` : 'Một bức thư tay dành cho bạn'} />
        <meta property="og:description" content="Có một bức thư tay đang đợi bạn mở ra xem..." />
        {pages?.[0]?.imageUrl && <meta property="og:image" content={pages[0].imageUrl} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`https://yunkhngn.dev/letter/${code}`} />
        <meta name="twitter:title" content={title ? `${title} — Thư tay` : 'Một bức thư tay dành cho bạn'} />
        <meta name="twitter:description" content="Có một bức thư tay đang đợi bạn mở ra xem..." />
        {pages?.[0]?.imageUrl && <meta name="twitter:image" content={pages[0].imageUrl} />}
      </Head>
      {phase === 'password' && (
        <PasswordGate code={code} onVerified={handlePasswordVerified} />
      )}
      {phase === 'envelope' && (
        <EnvelopeAnimation onComplete={handleEnvelopeComplete} coverImage={pages[0]?.imageUrl} />
      )}
      {phase === 'reading' && <WritingReveal pages={pages} />}
    </>
  );
}
