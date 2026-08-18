const BASE_URL = 'https://yunkhngn.dev';

/**
 * Constructs dynamic Open Graph image URL using /api/og
 */
export function createOgImageUrl({ title, description, type = 'page', thumbnail }) {
  const ogParams = new URLSearchParams();
  if (title) ogParams.set('title', title);
  if (type) ogParams.set('type', type);
  if (description) ogParams.set('description', description);
  if (thumbnail) ogParams.set('thumbnail', thumbnail);

  return `${BASE_URL}/api/og?${ogParams.toString()}`;
}

/**
 * Creates standardized Next.js Metadata object including canonical URL, openGraph, and twitter cards with dynamic OG images.
 */
export function createMetadata({
  title,
  description,
  path = '',
  ogType = 'page',
  type = 'website',
  thumbnail,
  ogTitle,
}) {
  const fullUrl = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const effectiveOgTitle = ogTitle || (title ? `${title} — Khoa Nguyễn` : 'Khoa Nguyễn');
  const ogImageUrl = createOgImageUrl({
    title: effectiveOgTitle,
    description,
    type: ogType,
    thumbnail,
  });

  return {
    title,
    description,
    alternates: { canonical: fullUrl },
    openGraph: {
      title: effectiveOgTitle,
      description,
      url: fullUrl,
      type,
      siteName: 'Khoa Nguyen',
      locale: 'vi_VN',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: effectiveOgTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: effectiveOgTitle,
      description,
      images: [ogImageUrl],
    },
  };
}
